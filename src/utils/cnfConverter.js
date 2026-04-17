/**
 * Chomsky Normal Form (CNF) Converter
 * Converts a CFG to CNF for use with CYK algorithm
 */

export class CNFConverter {
  constructor(grammar) {
    this.grammar = grammar;
    this.cnfRules = [];
    this.replacements = new Map(); // Maps new non-terminals to what they replace
    this.nextNTIndex = 1;
  }

  convert() {
    let rules = [...this.grammar.rules];

    // Step 1: Remove epsilon productions
    rules = this._removeEpsilon(rules);

    // Step 2: Remove unit productions (A -> B)
    rules = this._removeUnitProductions(rules);

    // Step 3: Break down to CNF (A -> BC or A -> a)
    rules = this._convertToCNF(rules);

    this.cnfRules = rules;
    return { rules, replacements: this.replacements };
  }

  _removeEpsilon(rules) {
    const nullable = this._findNullable(rules);
    const newRules = [];

    for (const rule of rules) {
      if (rule.rhs.some(s => s.type === 'epsilon')) {
        // Skip epsilon production, but generate alternatives
        continue;
      }

      newRules.push(rule);

      // Generate alternatives by removing nullable symbols
      const indices = [];
      for (let i = 0; i < rule.rhs.length; i++) {
        if (nullable.has(rule.rhs[i].value)) {
          indices.push(i);
        }
      }

      // Generate all subsets (but not the empty subset)
      for (let mask = 1; mask < (1 << indices.length); mask++) {
        const altRhs = [];
        for (let i = 0; i < rule.rhs.length; i++) {
          let include = true;
          for (let j = 0; j < indices.length; j++) {
            if (indices[j] === i && (mask & (1 << j))) {
              include = false;
              break;
            }
          }
          if (include) {
            altRhs.push(rule.rhs[i]);
          }
        }
        if (altRhs.length > 0) {
          newRules.push({ lhs: rule.lhs, rhs: altRhs });
        }
      }
    }

    return newRules;
  }

  _findNullable(rules) {
    const nullable = new Set();
    let changed = true;

    while (changed) {
      changed = false;
      for (const rule of rules) {
        if (nullable.has(rule.lhs)) continue;
        if (rule.rhs.some(s => s.type === 'epsilon') ||
            rule.rhs.every(s => nullable.has(s.value))) {
          nullable.add(rule.lhs);
          changed = true;
        }
      }
    }

    return nullable;
  }

  _removeUnitProductions(rules) {
    const unitRelations = new Map(); // A -> B relations
    const nonTerminals = new Set();

    // Build unit production relations
    for (const rule of rules) {
      nonTerminals.add(rule.lhs);
      if (rule.rhs.length === 1 && rule.rhs[0].type === 'nonterminal') {
        if (!unitRelations.has(rule.lhs)) {
          unitRelations.set(rule.lhs, new Set());
        }
        unitRelations.get(rule.lhs).add(rule.rhs[0].value);
      }
    }

    // Compute transitive closure
    const closure = new Map();
    for (const nt of nonTerminals) {
      closure.set(nt, new Set());
      const stack = [nt];
      const visited = new Set([nt]);

      while (stack.length > 0) {
        const current = stack.pop();
        if (unitRelations.has(current)) {
          for (const next of unitRelations.get(current)) {
            closure.get(nt).add(next);
            if (!visited.has(next)) {
              visited.add(next);
              stack.push(next);
            }
          }
        }
      }
    }

    // Generate new rules
    const newRules = [];
    for (const rule of rules) {
      if (!(rule.rhs.length === 1 && rule.rhs[0].type === 'nonterminal')) {
        newRules.push(rule);
      }
    }

    // Add consequent rules
    for (const nt of nonTerminals) {
      for (const relatedNT of closure.get(nt)) {
        for (const rule of rules) {
          if (rule.lhs === relatedNT &&
              !(rule.rhs.length === 1 && rule.rhs[0].type === 'nonterminal')) {
            newRules.push({ lhs: nt, rhs: rule.rhs });
          }
        }
      }
    }

    return newRules.filter((r, i, arr) => arr.findIndex(x => x.lhs === r.lhs && arraysEqual(x.rhs, r.rhs)) === i);
  }

  _convertToCNF(rules) {
    const cnfRules = [];
    const terminalMap = new Map(); // terminal -> new non-terminal

    for (const rule of rules) {
      if (rule.rhs.length === 1) {
        // Already in form A -> a
        cnfRules.push(rule);
      } else if (rule.rhs.length === 2 &&
                 rule.rhs[0].type === 'nonterminal' &&
                 rule.rhs[1].type === 'nonterminal') {
        // Already in form A -> BC
        cnfRules.push(rule);
      } else {
        // Need to convert: A -> w (longer or mixed)
        let currentRhs = [...rule.rhs];
        let currentLhs = rule.lhs;

        // Replace terminals with new non-terminals
        currentRhs = currentRhs.map(sym => {
          if (sym.type === 'terminal') {
            if (!terminalMap.has(sym.value)) {
              const newNT = `X${this.nextNTIndex++}`;
              terminalMap.set(sym.value, newNT);
              cnfRules.push({ lhs: newNT, rhs: [sym] });
            }
            return { value: terminalMap.get(sym.value), type: 'nonterminal' };
          }
          return sym;
        });

        // Break into binary rules
        while (currentRhs.length > 2) {
          const newNT = `Y${this.nextNTIndex++}`;
          cnfRules.push({
            lhs: currentLhs,
            rhs: [currentRhs[0], { value: newNT, type: 'nonterminal' }]
          });
          currentLhs = newNT;
          currentRhs = currentRhs.slice(1);
        }

        cnfRules.push({ lhs: currentLhs, rhs: currentRhs });
      }
    }

    return cnfRules;
  }
}

function arraysEqual(a, b) {
  return a.length === b.length &&
    a.every((val, idx) => val.value === b[idx].value && val.type === b[idx].type);
}

export default CNFConverter;
