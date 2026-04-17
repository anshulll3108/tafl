/**
 * CFG Parser - Parses raw grammar text into a structured grammar object
 * Format: "S -> aB | bA" (one rule per line)
 */

export class CFGParser {
  static parse(text, startSymbolOverride) {
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('//'));

    if (lines.length === 0) {
      throw new Error('No grammar rules provided.');
    }

    const rules = [];
    const nonTerminals = new Set();
    const terminals = new Set();
    let startSymbol = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^([A-Z][A-Z0-9_']*)\s*(?:->|→|::=)\s*(.+)$/);
      if (!match) {
        throw new Error(`Invalid rule on line ${i + 1}: "${line}". Expected format: A -> aB | bA`);
      }

      const lhs = match[1];
      const rhsText = match[2];

      nonTerminals.add(lhs);
      if (startSymbol === null) {
        startSymbol = lhs;
      }

      const alternatives = rhsText.split('|').map(a => a.trim());

      for (const alt of alternatives) {
        if (alt.length === 0) {
          throw new Error(`Empty alternative in rule for "${lhs}" on line ${i + 1}.`);
        }

        const symbols = CFGParser._tokenize(alt, nonTerminals);
        rules.push({ lhs, rhs: symbols, original: `${lhs} → ${alt}` });
      }
    }

    // Categorize symbols
    for (const rule of rules) {
      rule.rhs = CFGParser._categorizeSymbols(rule.rhs, nonTerminals);
      for (const sym of rule.rhs) {
        if (sym.type === 'terminal') {
          terminals.add(sym.value);
        }
      }
    }

    if (startSymbolOverride && startSymbolOverride.trim()) {
      const s = startSymbolOverride.trim();
      if (!nonTerminals.has(s)) {
        throw new Error(`Start symbol "${s}" is not defined in the grammar.`);
      }
      startSymbol = s;
    }

    return { rules, nonTerminals, terminals, startSymbol };
  }

  static _tokenize(rhsStr, knownNonTerminals) {
    const tokens = [];
    const str = rhsStr.trim();

    if (str === 'ε' || str.toLowerCase() === 'epsilon' || str === 'λ') {
      tokens.push({ value: 'ε', type: 'epsilon' });
      return tokens;
    }

    let i = 0;
    while (i < str.length) {
      if (str[i] === ' ') {
        i++;
        continue;
      }

      if (str[i] >= 'A' && str[i] <= 'Z') {
        let nt = str[i];
        i++;
        while (i < str.length && ((str[i] >= 'A' && str[i] <= 'Z') || (str[i] >= '0' && str[i] <= '9') || str[i] === '_' || str[i] === "'")) {
          nt += str[i];
          i++;
        }
        tokens.push({ value: nt, type: 'nonterminal' });
      } else {
        tokens.push({ value: str[i], type: 'terminal' });
        i++;
      }
    }

    return tokens;
  }

  static _categorizeSymbols(symbols, nonTerminals) {
    return symbols.map(sym => {
      if (sym.type === 'epsilon') return sym;
      if (nonTerminals.has(sym.value)) {
        return { value: sym.value, type: 'nonterminal' };
      }
      return { value: sym.value, type: 'terminal' };
    });
  }
}

export default CFGParser;
