import React, { useState, useEffect } from 'react';
import CFGParser from '../utils/cfgParser';

const EXAMPLE_GRAMMARS = {
  anbn: {
    name: 'aⁿbⁿ',
    grammar: 'S -> aSb | ab'
  },
  simpleab: {
    name: 'Simple AB',
    grammar: 'S -> AB\nA -> aA | a\nB -> bB | b'
  },
  arithmetic: {
    name: 'Arithmetic Expressions',
    grammar: 'E -> E + T | T\nT -> T * F | F\nF -> (E) | id'
  },
  palindrome: {
    name: 'Palindrome',
    grammar: 'S -> aSa | bSb | a | b | ε'
  },
  balanced: {
    name: 'Balanced Parentheses',
    grammar: 'S -> (S) | SS | ε'
  }
};

export function GrammarInput({ grammar, setGrammar, error, setError }) {
  const [localGrammar, setLocalGrammar] = useState(grammar);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setLocalGrammar(grammar);
  }, [grammar]);

  const handleGrammarChange = (e) => {
    const value = e.target.value;
    setLocalGrammar(value);
    setError('');
    
    // Auto-validate on change
    try {
      if (value.trim()) {
        CFGParser.parse(value, '');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const loadExample = (exampleKey) => {
    const example = EXAMPLE_GRAMMARS[exampleKey];
    if (example) {
      setLocalGrammar(example.grammar);
      setGrammar(example.grammar);
      setError('');
    }
  };

  const insertEpsilon = () => {
    const textarea = document.getElementById('grammar-input');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = localGrammar.substring(0, start) + 'ε' + localGrammar.substring(end);
    setLocalGrammar(newValue);
    setGrammar(newValue);
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-electric-blue"></div>
          <h2 className="text-xl font-semibold text-gray-900">Grammar Input</h2>
        </div>
        <span className="px-3 py-1 bg-electric-blue/10 text-electric-blue text-sm font-medium rounded-full">
          Config
        </span>
      </div>

      {/* Example Grammars Dropdown */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-600 font-medium">Examples:</span>
        {Object.entries(EXAMPLE_GRAMMARS).map(([key, example]) => (
          <button
            key={key}
            onClick={() => loadExample(key)}
            className="px-3 py-1 bg-electric-blue/10 text-electric-blue text-sm font-medium rounded-lg hover:bg-electric-blue/20 transition-colors"
          >
            {example.name}
          </button>
        ))}
      </div>

      {/* Grammar Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <span className="text-lg">📝</span>
          Production Rules
        </label>
        
        <textarea
          id="grammar-input"
          value={localGrammar}
          onChange={handleGrammarChange}
          onBlur={() => setGrammar(localGrammar)}
          className="w-full h-48 p-4 font-mono text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-transparent resize-none"
          placeholder="Enter grammar rules (one per line)&#10;Format: S -> aB | bA&#10;Example:&#10;S -> aB | bA&#10;A -> aAA | a&#10;B -> bBB | b"
          spellCheck="false"
        />

        <div className="flex gap-2">
          <button
            onClick={insertEpsilon}
            className="px-3 py-2 bg-purple-nt/10 text-purple-nt text-sm font-medium rounded-lg hover:bg-purple-nt/20 transition-colors flex items-center gap-2"
          >
            <span>ε</span> Insert Epsilon
          </button>
        </div>

        <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg">
          <p><code className="bg-white px-1 rounded">-&gt;</code> for production • <code className="bg-white px-1 rounded">|</code> for alternatives</p>
          <p><code className="bg-white px-1 rounded">ε</code> or <code className="bg-white px-1 rounded">epsilon</code> for empty string</p>
          <p>Uppercase = non-terminals • lowercase/digits = terminals</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-rose/10 border border-rose/30 rounded-lg">
          <p className="text-sm text-rose font-medium">⚠ {error}</p>
        </div>
      )}
    </div>
  );
}

export default GrammarInput;
