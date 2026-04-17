import React, { useState, useEffect } from 'react';
import FirstFollowCompute from '../../utils/firstFollow';

export function FirstFollowTable({ grammar }) {
  const [firstFollow, setFirstFollow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('first');

  useEffect(() => {
    if (!grammar) return;

    setLoading(true);
    setTimeout(() => {
      try {
        const ff = new FirstFollowCompute(grammar);
        setFirstFollow(ff);
      } catch (err) {
        console.error('Error computing FIRST/FOLLOW:', err);
      }
      setLoading(false);
    }, 100);
  }, [grammar]);

  if (!firstFollow) {
    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-600">FIRST & FOLLOW Sets</h3>
        <p className="text-xs text-gray-500">Enter and validate grammar to compute sets</p>
      </div>
    );
  }

  const nonTerminals = Array.from(grammar.nonTerminals).sort();
  const firstMap = firstFollow.getAllFirst();
  const followMap = firstFollow.getAllFollow();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-purple-nt"></div>
        <h2 className="text-xl font-semibold text-gray-900">FIRST & FOLLOW Sets</h2>
      </div>

      {/* Tab Switch */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('first')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'first'
              ? 'border-electric-blue text-electric-blue'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          FIRST Sets
        </button>
        <button
          onClick={() => setActiveTab('follow')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'follow'
              ? 'border-electric-blue text-electric-blue'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          FOLLOW Sets
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 w-24">Symbol</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                {activeTab === 'first' ? 'FIRST(X)' : 'FOLLOW(X)'}
              </th>
            </tr>
          </thead>
          <tbody>
            {nonTerminals.map((nt, idx) => {
              const set = activeTab === 'first' 
                ? firstMap.get(nt) || new Set()
                : followMap.get(nt) || new Set();
              const items = Array.from(set).sort();

              return (
                <tr 
                  key={nt}
                  className={`border-t border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-electric-blue/5`}
                >
                  <td className="px-4 py-3 font-mono font-semibold text-purple-nt">
                    {nt}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {items.length === 0 ? (
                        <span className="text-gray-400 text-xs">∅</span>
                      ) : (
                        items.map((item, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-electric-blue/10 text-electric-blue text-xs font-mono rounded"
                          >
                            {item === 'ε' ? 'ε' : item}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
        <p className="font-medium mb-1">ℹ Information:</p>
        <p>
          {activeTab === 'first'
            ? 'FIRST(X) = set of terminal symbols that can start a string derivable from X'
            : 'FOLLOW(X) = set of terminals that can immediately follow X in a derivation'}
        </p>
      </div>
    </div>
  );
}

export default FirstFollowTable;
