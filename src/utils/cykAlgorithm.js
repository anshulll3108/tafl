/**
 * CYK Algorithm (Cocke-Younger-Kasami)
 * Parses a string using a grammar in Chomsky Normal Form
 */

export class CYKAlgorithm {
  constructor(cnfGrammar) {
    this.grammar = cnfGrammar;
    this._buildRuleMap();
  }

  _buildRuleMap() {
    // Maps terminal/non-terminal -> list of LHS non-terminals that produce it
    this.terminalMap = new Map(); // terminal -> [A, B, ...]
    this.binaryMap = new Map();   // "B C" -> [A, ...]

    for (const rule of this.grammar.rules) {
      const key = rule.rhs.map(s => s.value).join(' ');

      if (rule.rhs.length === 1) {
        if (!this.terminalMap.has(key)) {
          this.terminalMap.set(key, []);
        }
        this.terminalMap.get(key).push(rule.lhs);
      } else if (rule.rhs.length === 2) {
        if (!this.binaryMap.has(key)) {
          this.binaryMap.set(key, []);
        }
        this.binaryMap.get(key).push(rule.lhs);
      }
    }
  }

  parse(input) {
    // Tokenize input
    const tokens = input.trim().split(/\s+/).filter(t => t.length > 0);
    const n = tokens.length;

    if (n === 0) {
      return { accepted: false, table: [], tokens: [] };
    }

    // CYK table: table[i][j] = set of non-terminals deriving tokens[j..j+i]
    const table = Array(n).fill(null).map(() => Array(n).fill(null).map(() => new Set()));

    // Fill base case (substrings of length 1)
    for (let j = 0; j < n; j++) {
      const token = tokens[j];
      const producers = this.terminalMap.get(token) || [];
      for (const producer of producers) {
        table[0][j].add(producer);
      }
    }

    // Fill table for substrings of length 2 to n
    for (let len = 2; len <= n; len++) {
      for (let j = 0; j <= n - len; j++) {
        const i = len - 1;

        // Try all split points
        for (let k = 0; k < len - 1; k++) {
          const leftRow = k;
          const rightRow = len - 2 - k;
          const leftSet = table[leftRow][j];
          const rightSet = table[rightRow][j + k + 1];

          // Try all combinations
          for (const B of leftSet) {
            for (const C of rightSet) {
              const key = `${B} ${C}`;
              const producers = this.binaryMap.get(key) || [];
              for (const producer of producers) {
                table[i][j].add(producer);
              }
            }
          }
        }
      }
    }

    const accepted = table[n - 1][0].has(this.grammar.startSymbol);

    return {
      accepted,
      table,
      tokens,
      startSymbol: this.grammar.startSymbol
    };
  }

  // Format table for display
  formatTable(result) {
    const { table, tokens } = result;
    if (tokens.length === 0) return [];

    const formatted = [];
    const n = tokens.length;

    // Build rows from bottom to top
    for (let len = 1; len <= n; len++) {
      const row = [];
      for (let j = 0; j <= n - len; j++) {
        row.push({
          content: Array.from(table[len - 1][j]),
          isAccepted: false
        });
      }
      formatted.push(row);
    }

    return formatted;
  }
}

export default CYKAlgorithm;
