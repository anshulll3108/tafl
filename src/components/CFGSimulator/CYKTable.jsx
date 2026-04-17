import React, { useState, useEffect } from 'react';
import CNFConverter from '../../utils/cnfConverter';
import CYKAlgorithm from '../../utils/cykAlgorithm';

export function CYKTable({ grammar, inputString }) {
  const [cnfGrammar, setCnfGrammar] = useState(null);
  const [cykResult, setCykResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCNF, setShowCNF] = useState(false);

  useEffect(() => {
    if (!grammar) return;

    setLoading(true);
    setTimeout(() => {
      try {
        const converter = new CNFConverter(grammar);
        const { rules } = converter.convert();
        
        const cnf = { 
          ...grammar, 
          rules,
          originalRules: grammar.rules 
        };
        setCnfGrammar(cnf);

        // If we have input string, run CYK
        if (inputString && inputString.trim()) {
          const cyk = new CYKAlgorithm(cnf);
          const result = cyk.parse(inputString);
          setCykResult(result);
        }
      } catch (err) {
        console.error('Error in CYK:', err);
      }
      setLoading(false);
    }, 100);
  }, [grammar, inputString]);

  if (!cnfGrammar) {
    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-600">CYK Algorithm</h3>
        <p className="text-xs text-gray-500">Enter and validate grammar to use CYK parser</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald"></div>
          <h2 className="text-xl font-semibold text-gray-900">CYK Algorithm</h2>
        </div>
        <button
          onClick={() => setShowCNF(!showCNF)}
          className="px-3 py-1 text-xs bg-electric-blue/10 text-electric-blue font-medium rounded hover:bg-electric-blue/20"
        >
          {showCNF ? 'Hide' : 'Show'} CNF
        </button>
      </div>

      {/* CNF Transformation */}
      {showCNF && (
        <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900">Chomsky Normal Form</h3>
          <div className="space-y-1 text-xs font-mono text-blue-800">
            {cnfGrammar.rules.slice(0, 10).map((rule, i) => (
              <div key={i}>
                {rule.lhs} → {rule.rhs.map(s => s.value).join(' ')}
              </div>
            ))}
            {cnfGrammar.rules.length > 10 && (
              <div className="text-blue-600">... and {cnfGrammar.rules.length - 10} more rules</div>
            )}
          </div>
        </div>
      )}

      {/* CYK Result */}
      {cykResult && (
        <div className="space-y-3">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse">
              <tbody>
                {cykResult.table.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td
                        key={`${i}-${j}`}
                        className="p-2 min-w-20 h-16 border border-gray-300 bg-white text-center text-gray-600 text-xs font-mono"
                      >
                        <div className="space-y-1">
                          {Array.from(cell.content).map(item => (
                            <div key={item} className="bg-electric-blue/10 text-electric-blue px-1 py-0.5 rounded text-xs">
                              {item}
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Input tokens */}
          <div className="flex gap-2 p-3 bg-gray-50 rounded-lg">
            <span className="text-xs font-medium text-gray-600">Input Tokens:</span>
            {cykResult.tokens.map((token, i) => (
              <span 
                key={i}
                className="px-2 py-1 bg-amber-token/10 text-amber-token text-xs font-mono rounded"
              >
                {token}
              </span>
            ))}
          </div>

          {/* Verdict */}
          <div className={`p-4 rounded-lg border ${
            cykResult.accepted
              ? 'bg-emerald/10 border-emerald/30'
              : 'bg-rose/10 border-rose/30'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${cykResult.accepted ? 'text-emerald' : 'text-rose'}`}>
                {cykResult.accepted ? '✓' : '✗'}
              </span>
              <div>
                <p className={`font-semibold ${cykResult.accepted ? 'text-emerald' : 'text-rose'}`}>
                  {cykResult.accepted 
                    ? `String accepted by grammar (derives from ${cykResult.startSymbol})`
                    : 'String rejected by grammar'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!inputString && (
        <p className="text-sm text-gray-500 text-center py-8">
          Enter a string in the String Tester to visualize CYK table
        </p>
      )}
    </div>
  );
}

export default CYKTable;
