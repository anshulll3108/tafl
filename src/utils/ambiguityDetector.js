/**
 * Ambiguity Detection Engine
 * Detects if a CFG is ambiguous by generating strings and checking for multiple parse trees
 */

export class AmbiguityDetector {
  constructor(grammar, options = {}) {
    this.grammar = grammar;
    this.maxStringLength = options.maxStringLength || 6;
    this.maxDerivations = options.maxDerivations || 1000000;
    this.maxDepth = options.maxDepth || 15;
    this.generatedStrings = new Set();
    this.parseTreeCache = new Map();
    this.stateCounter = 0;
  }

  /**
   * Main entry point: check if grammar is ambiguous
   * Returns: { isAmbiguous, example, parseCount, totalStrings, maxLength }
   */
  async detect() {
    try {
      const result = {
        isAmbiguous: false,
        example: null,
        parseCount: 0,
        totalStrings: 0,
        maxLength: this.maxStringLength,
        statesExplored: 0
      };

      // Generate all strings up to maxStringLength
      const strings = this._generateStrings();
      result.totalStrings = strings.length;

      // Check each string for multiple parse trees
      for (const str of strings) {
        if (this.stateCounter > this.maxDerivations) {
          result.warning = `Stopped early after ${this.maxDerivations} states explored`;
          break;
        }

        const parseCount = this._countParseTrees(str);
        result.statesExplored = this.stateCounter;

        if (parseCount > 1) {
          result.isAmbiguous = true;
          result.example = str;
          result.parseCount = parseCount;
          return result;
        }
      }

      return result;
    } catch (err) {
      throw new Error(`Ambiguity detection failed: ${err.message}`);
    }
  }

  /**
   * Generate all possible strings from start symbol up to maxStringLength
   */
  _generateStrings() {
    const { startSymbol } = this.grammar;
    const strings = new Set();

    // BFS to generate strings
    const queue = [
      {
        form: [{ value: startSymbol, type: 'nonterminal' }],
        depth: 0
      }
    ];

    const visited = new Set();
    const startKey = startSymbol;
    visited.add(startKey);

    while (queue.length > 0) {
      const current = queue.shift();
      const { form, depth } = current;

      // Check if this is a terminal string
      const isTerminal = form.every(sym => sym.type === 'terminal' || sym.value === 'ε');
      const stringValue = this._formToString(form);
      const stringLength = this._calculateStringLength(form);

      if (isTerminal && stringLength > 0 && stringLength <= this.maxStringLength) {
        strings.add(stringValue);
      }

      // Generate next forms
      if (depth >= this.maxDepth) continue;

      for (let i = 0; i < form.length; i++) {
        const sym = form[i];
        if (sym.type !== 'nonterminal') continue;

        // Find rules for this non-terminal
        const applicableRules = this.grammar.rules.filter(r => r.lhs === sym.value);

        for (const rule of applicableRules) {
          // Create new form by replacing non-terminal with production
          const newForm = [
            ...form.slice(0, i),
            ...rule.rhs,
            ...form.slice(i + 1)
          ];

          const newLength = this._calculateStringLength(newForm);
          
          // Only continue if we haven't exceeded max length
          if (newLength <= this.maxStringLength) {
            const newKey = this._formToString(newForm);
            if (!visited.has(newKey)) {
              visited.add(newKey);
              queue.push({
                form: newForm,
                depth: depth + 1
              });
            }
          }
        }
      }
    }

    return Array.from(strings).sort((a, b) => a.length - b.length || a.localeCompare(b));
  }

  /**
   * Count number of distinct parse trees for a given string
   * Using CYK-style dynamic programming with parse tree tracking
   */
  _countParseTrees(targetString) {
    this.stateCounter++;
    
    if (this.parseTreeCache.has(targetString)) {
      return this.parseTreeCache.get(targetString);
    }

    const n = targetString.length;
    if (n === 0) {
      const count = this._canDeriveEmpty() ? 1 : 0;
      this.parseTreeCache.set(targetString, count);
      return count;
    }

    // dp[i][j] = Set of non-terminals that can derive substring[i:i+j]
    // Store: { nonTerminal: [array of parse tree combinations] }
    const dp = Array(n).fill(null).map(() => Array(n + 1).fill(null).map(() => ({})));

    // Base case: single characters
    for (let i = 0; i < n; i++) {
      const char = targetString[i];
      
      for (const rule of this.grammar.rules) {
        // Check if this rule produces a single terminal
        if (rule.rhs.length === 1 && rule.rhs[0].type === 'terminal' && rule.rhs[0].value === char) {
          if (!dp[i][1][rule.lhs]) {
            dp[i][1][rule.lhs] = [];
          }
          dp[i][1][rule.lhs].push([rule]); // Single rule as a parse tree
        }
      }
    }

    // Fill DP table for substrings of length > 1
    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        // Try all split points
        for (let k = 1; k < len; k++) {
          const leftLen = k;
          const rightLen = len - k;

          // Try all rules that have exactly 2 symbols on RHS
          for (const rule of this.grammar.rules) {
            if (rule.rhs.length !== 2) continue;
            if (rule.rhs[0].type !== 'nonterminal' || rule.rhs[1].type !== 'nonterminal') continue;

            const leftNT = rule.rhs[0].value;
            const rightNT = rule.rhs[1].value;

            const leftTrees = dp[i][leftLen][leftNT] || [];
            const rightTrees = dp[i + leftLen][rightLen][rightNT] || [];

            if (leftTrees.length > 0 && rightTrees.length > 0) {
              if (!dp[i][len][rule.lhs]) {
                dp[i][len][rule.lhs] = [];
              }

              // Create all combinations of left and right parse trees
              for (const leftTree of leftTrees) {
                for (const rightTree of rightTrees) {
                  dp[i][len][rule.lhs].push([rule, ...leftTree, ...rightTree]);
                }
              }
            }
          }
        }
      }
    }

    // Count parse trees for the entire string starting from start symbol
    const startSym = this.grammar.startSymbol;
    const count = (dp[0][n][startSym] || []).length;

    this.parseTreeCache.set(targetString, count);
    return count;
  }

  /**
   * Check if grammar can derive empty string (epsilon)
   */
  _canDeriveEmpty() {
    const { rules, startSymbol } = this.grammar;
    const canDeriveEpsilon = new Set();

    let changed = true;
    let iterations = 0;
    const maxIterations = 100;

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;

      for (const rule of rules) {
        if (canDeriveEpsilon.has(rule.lhs)) continue;

        // Check if RHS can derive epsilon
        if (rule.rhs.length === 0 || (rule.rhs.length === 1 && rule.rhs[0].value === 'ε')) {
          canDeriveEpsilon.add(rule.lhs);
          changed = true;
        } else if (rule.rhs.every(sym => sym.type === 'nonterminal' && canDeriveEpsilon.has(sym.value))) {
          canDeriveEpsilon.add(rule.lhs);
          changed = true;
        }
      }
    }

    return canDeriveEpsilon.has(startSymbol);
  }

  /**
   * Convert a sentential form to a string
   */
  _formToString(form) {
    return form
      .map(sym => sym.value)
      .filter(v => v !== 'ε')
      .join('');
  }

  /**
   * Calculate the terminal string length (ignoring epsilon and non-terminals)
   */
  _calculateStringLength(form) {
    return form
      .filter(sym => sym.type === 'terminal' && sym.value !== 'ε')
      .length;
  }

  /**
   * Get detailed parse trees for a string (for display purposes)
   * Returns array of tree structures formatted for visualization
   */
  getParseTrees(targetString) {
    const n = targetString.length;
    if (n === 0) return [];

    // dp[i][len] = { nonTerminal: [trees] }
    // where each tree = { rule, leftChild, rightChild, terminals }
    const dp = Array(n).fill(null).map(() => Array(n + 1).fill(null).map(() => ({})));

    // Base case: single characters
    for (let i = 0; i < n; i++) {
      const char = targetString[i];
      for (const rule of this.grammar.rules) {
        if (rule.rhs.length === 1 && rule.rhs[0].type === 'terminal' && rule.rhs[0].value === char) {
          if (!dp[i][1][rule.lhs]) {
            dp[i][1][rule.lhs] = [];
          }
          dp[i][1][rule.lhs].push({
            rule: rule,
            lhs: rule.lhs,
            rhs: [{ symbol: char, type: 'terminal' }],
            leftChild: null,
            rightChild: null
          });
        }
      }
    }

    // Fill DP for substrings of length > 1
    for (let len = 2; len <= n; len++) {
      for (let i = 0; i <= n - len; i++) {
        for (let k = 1; k < len; k++) {
          const leftLen = k;
          const rightLen = len - k;

          for (const rule of this.grammar.rules) {
            if (rule.rhs.length !== 2) continue;
            if (rule.rhs[0].type !== 'nonterminal' || rule.rhs[1].type !== 'nonterminal') continue;

            const leftNT = rule.rhs[0].value;
            const rightNT = rule.rhs[1].value;

            const leftTrees = dp[i][leftLen][leftNT] || [];
            const rightTrees = dp[i + leftLen][rightLen][rightNT] || [];

            if (leftTrees.length > 0 && rightTrees.length > 0) {
              if (!dp[i][len][rule.lhs]) {
                dp[i][len][rule.lhs] = [];
              }

              for (const leftTree of leftTrees) {
                for (const rightTree of rightTrees) {
                  dp[i][len][rule.lhs].push({
                    rule: rule,
                    lhs: rule.lhs,
                    rhs: [leftNT, rightNT],
                    leftChild: leftTree,
                    rightChild: rightTree
                  });
                }
              }
            }
          }
        }
      }
    }

    const trees = (dp[0][n][this.grammar.startSymbol] || []).slice(0, 2);
    
    // Convert to visualization format
    return trees.map(tree => this._buildVisualizationTree(tree));
  }

  /**
   * Recursively build visualization tree from parse tree structure
   */
  _buildVisualizationTree(tree) {
    if (!tree) return null;

    const children = [];

    if (tree.leftChild && tree.rightChild) {
      // Non-terminal with two children
      children.push(this._buildVisualizationTree(tree.leftChild));
      children.push(this._buildVisualizationTree(tree.rightChild));
    } else if (tree.rhs && tree.rhs[0] && tree.rhs[0].type === 'terminal') {
      // Terminal child
      children.push({
        symbol: tree.rhs[0].symbol,
        type: 'terminal',
        children: null
      });
    }

    return {
      symbol: tree.lhs,
      type: 'nonterminal',
      children: children.length > 0 ? children : null
    };
  }
}
