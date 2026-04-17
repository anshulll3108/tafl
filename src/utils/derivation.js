/**
 * Derivation Engine
 * Computes leftmost and rightmost derivations for a given string
 */

export class DerivationEngine {
  constructor(grammar) {
    this.grammar = grammar;
    this.maxDepth = 20;
    this.maxStates = 100000;
  }

  findLeftmostDerivation(target) {
    return this._findDerivation(target, 'leftmost');
  }

  findRightmostDerivation(target) {
    return this._findDerivation(target, 'rightmost');
  }

  _findDerivation(target, mode) {
    const { rules, startSymbol } = this.grammar;
    const targetTokens = target.trim().split(/\s+/).filter(t => t.length > 0);

    // BFS to find derivation
    const visited = new Set();
    const queue = [{
      sententialForm: [[{ value: startSymbol, type: 'nonterminal' }]],
      steps: [{ form: `${startSymbol}`, rule: null, highlighted: [0] }],
      depth: 0
    }];

    const startKey = startSymbol;
    visited.add(startKey);

    let statesExplored = 0;

    while (queue.length > 0 && statesExplored < this.maxStates) {
      const current = queue.shift();
      statesExplored++;
      const form = current.sententialForm[current.sententialForm.length - 1];

      // Find leftmost/rightmost non-terminal
      const ntIndex = mode === 'leftmost'
        ? form.findIndex(s => s.type === 'nonterminal')
        : form.reduce((ridx, s, idx) => s.type === 'nonterminal' ? idx : ridx, -1);

      if (ntIndex === -1) {
        // All terminals - check if matches target
        const derived = form.map(s => s.value).join('');
        if (derived === target || this._tokensMatch(form, targetTokens)) {
          return { steps: current.steps, accepted: true };
        }
        continue;
      }

      if (current.depth >= this.maxDepth) continue;

      const ntSymbol = form[ntIndex].value;

      // Find applicable rules
      for (const rule of rules) {
        if (rule.lhs !== ntSymbol) continue;

        // Create new sentential form
        const newForm = [
          ...form.slice(0, ntIndex),
          ...rule.rhs,
          ...form.slice(ntIndex + 1)
        ];

        const formStr = newForm.map(s => s.value).join('');
        if (!visited.has(formStr)) {
          visited.add(formStr);

          const newSententialForm = [...current.sententialForm, newForm];
          const newSteps = [
            ...current.steps,
            {
              form: formStr,
              rule: `${rule.lhs} → ${rule.rhs.map(s => s.value).join('')}`,
              highlighted: [ntIndex]
            }
          ];

          queue.push({
            sententialForm: newSententialForm,
            steps: newSteps,
            depth: current.depth + 1
          });
        }
      }
    }

    return { steps: [], accepted: false };
  }

  _tokensMatch(form, tokens) {
    const formTokens = form.map(s => s.value);
    return formTokens.length === tokens.length &&
      formTokens.every((t, i) => t === tokens[i]);
  }

  buildParseTree(steps, targetTokens) {
    if (steps.length === 0) return null;

    // Simplified: build tree from final derivation
    const finalStep = steps[steps.length - 1];
    const tokens = finalStep.form.split('');

    return {
      symbol: this.grammar.startSymbol,
      type: 'nonterminal',
      children: tokens.map(t => ({ symbol: t, type: 'terminal', children: null }))
    };
  }
}

export default DerivationEngine;
