/**
 * FIRST & FOLLOW Set Computation
 * Implements standard FIRST and FOLLOW set algorithms for context-free grammars
 */

export class FirstFollowCompute {
  constructor(grammar) {
    this.grammar = grammar;
    this.first = new Map();
    this.follow = new Map();
    this._computeFirst();
    this._computeFollow();
  }

  _computeFirst() {
    const { rules, nonTerminals, terminals } = this.grammar;

    // Initialize FIRST sets
    for (const nt of nonTerminals) {
      this.first.set(nt, new Set());
    }
    for (const t of terminals) {
      this.first.set(t, new Set([t]));
    }
    this.first.set('ε', new Set(['ε']));

    // Fixed-point iteration
    let changed = true;
    while (changed) {
      changed = false;

      for (const rule of rules) {
        const { lhs, rhs } = rule;
        const beforeSize = this.first.get(lhs).size;

        // For each sequence in rhs, compute FIRST
        let i = 0;
        let canBeEmpty = true;

        while (i < rhs.length) {
          const symbol = rhs[i];
          const symbolFirst = this.first.get(symbol.value) || new Set();

          // Add all non-epsilon symbols from FIRST(symbol)
          for (const s of symbolFirst) {
            if (s !== 'ε') {
              this.first.get(lhs).add(s);
            }
          }

          // If symbol doesn't derive epsilon, stop
          if (!symbolFirst.has('ε')) {
            canBeEmpty = false;
            break;
          }

          i++;
        }

        // If all symbols can be empty (or RHS is epsilon), add epsilon to FIRST(lhs)
        if (canBeEmpty || rhs.some(s => s.type === 'epsilon')) {
          this.first.get(lhs).add('ε');
        }

        if (this.first.get(lhs).size > beforeSize) {
          changed = true;
        }
      }
    }
  }

  _computeFollow() {
    const { rules, nonTerminals, startSymbol } = this.grammar;

    // Initialize FOLLOW sets
    for (const nt of nonTerminals) {
      this.follow.set(nt, new Set());
    }

    // Start symbol gets $ (end marker)
    this.follow.get(startSymbol).add('$');

    // Fixed-point iteration
    let changed = true;
    while (changed) {
      changed = false;

      for (const rule of rules) {
        const { rhs } = rule;

        for (let i = 0; i < rhs.length; i++) {
          const symbol = rhs[i];
          if (symbol.type !== 'nonterminal') continue;

          const followBefore = this.follow.get(symbol.value).size;

          // Look at everything after this symbol
          let j = i + 1;
          let canReachEnd = true;

          while (j < rhs.length) {
            const nextSymbol = rhs[j];
            const nextFirst = this.first.get(nextSymbol.value) || new Set();

            // Add FIRST of next symbol (excluding epsilon)
            for (const f of nextFirst) {
              if (f !== 'ε') {
                this.follow.get(symbol.value).add(f);
              }
            }

            // Stop if next symbol doesn't derive epsilon
            if (!nextFirst.has('ε')) {
              canReachEnd = false;
              break;
            }

            j++;
          }

          // If we reached end of RHS, add FOLLOW of LHS
          if (canReachEnd) {
            const lhsFollow = this.follow.get(rule.lhs) || new Set();
            for (const f of lhsFollow) {
              this.follow.get(symbol.value).add(f);
            }
          }

          if (this.follow.get(symbol.value).size > followBefore) {
            changed = true;
          }
        }
      }
    }
  }

  getFirst(symbol) {
    return this.first.get(symbol) || new Set();
  }

  getFollow(symbol) {
    return this.follow.get(symbol) || new Set();
  }

  getAllFirst() {
    return new Map(this.first);
  }

  getAllFollow() {
    return new Map(this.follow);
  }
}

export default FirstFollowCompute;
