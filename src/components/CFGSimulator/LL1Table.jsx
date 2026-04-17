import React, { useState, useEffect } from 'react';
import FirstFollowCompute from '../../utils/firstFollow';

export function LL1Table({ grammar }) {
  const [ll1Table, setLL1Table] = useState(null);
  const [isLL1, setIsLL1] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!grammar) return;

    setLoading(true);
    setTimeout(() => {
      try {
        const ff = new FirstFollowCompute(grammar);
        const table = buildLL1Table(grammar, ff);
        const { isLL1: valid, conflicts: conf } = checkLL1Conflicts(table, grammar);

        setLL1Table(table);
        setIsLL1(valid);
        setConflicts(conf);
      } catch (err) {
        console.error('Error building LL(1) table:', err);
      }
      setLoading(false);
    }, 100);
  }, [grammar]);

  if (!ll1Table) {
    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-600">LL(1) Parsing Table</h3>
        <p className="text-xs text-gray-500">Enter and validate grammar to build LL(1) table</p>
      </div>
    );
  }

  const nonTerminals = Array.from(grammar.nonTerminals).sort();
  const terminals = Array.from(grammar.terminals).sort();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-electric-blue"></div>
          <h2 className="text-xl font-semibold text-gray-900">LL(1) Parsing Table</h2>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
          isLL1
            ? 'bg-emerald/20 text-emerald'
            : 'bg-rose/20 text-rose'
        }`}>
          {isLL1 ? '✓ LL(1)' : '✗ Not LL(1)'}
        </span>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <div className="p-4 bg-rose/10 border border-rose/30 rounded-lg">
          <p className="text-sm font-medium text-rose mb-2">⚠ {conflicts.length} Conflict(s) Found</p>
          <ul className="text-xs text-rose/80 space-y-1">
            {conflicts.slice(0, 5).map((conf, i) => (
              <li key={i}>• {conf}</li>
            ))}
            {conflicts.length > 5 && <li>• ... and {conflicts.length - 5} more</li>}
          </ul>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-900 border-r border-gray-200 bg-gray-100">
                NT / Terminal
              </th>
              {terminals.map(t => (
                <th
                  key={t}
                  className="px-3 py-2 text-center font-semibold text-gray-900 border-r border-gray-200 min-w-24"
                >
                  {t}
                </th>
              ))}
              <th className="px-3 py-2 text-center font-semibold text-gray-900">$</th>
            </tr>
          </thead>
          <tbody>
            {nonTerminals.map((nt, i) => (
              <tr key={nt} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-3 py-2 font-mono font-semibold text-purple-nt border-r border-gray-200 bg-gray-50">
                  {nt}
                </td>
                {terminals.map(t => {
                  const entries = ll1Table.get(`${nt}-${t}`) || [];
                  const hasConflict = entries.length > 1;

                  return (
                    <td
                      key={t}
                      className={`px-3 py-2 text-center border-r border-gray-200 text-xs font-mono ${
                        hasConflict
                          ? 'bg-rose/20 border border-rose/50'
                          : entries.length === 1
                          ? 'bg-emerald/5'
                          : ''
                      }`}
                    >
                      {entries.length === 0 ? (
                        <span className="text-gray-300">—</span>
                      ) : entries.length === 1 ? (
                        <span className="text-purple-nt font-semibold">{entries[0]}</span>
                      ) : (
                        <span className="text-rose font-bold">{entries.length}</span>
                      )}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center text-xs font-mono">
                  {ll1Table.get(`${nt}-$`) ? (
                    <span className="text-purple-nt">{ll1Table.get(`${nt}-$`)}</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg space-y-1">
        <p className="font-medium">ℹ LL(1) Parsing Table</p>
        <p>A grammar is LL(1) if each cell contains at most one production rule.</p>
        <p>Used for top-down predictive parsing with 1-token lookahead.</p>
      </div>
    </div>
  );
}

function buildLL1Table(grammar, ff) {
  const table = new Map();
  const terminals = Array.from(grammar.terminals);
  const nonTerminals = Array.from(grammar.nonTerminals);

  for (const nt of nonTerminals) {
    for (const t of terminals) {
      table.set(`${nt}-${t}`, []);
    }
    table.set(`${nt}-$`, []);
  }

  for (const rule of grammar.rules) {
    const first = new Set();

    // Compute FIRST of RHS
    for (const sym of rule.rhs) {
      const symFirst = ff.getFirst(sym.value);
      for (const f of symFirst) {
        if (f !== 'ε') {
          first.add(f);
        }
      }
      if (!symFirst.has('ε')) break;
    }

    // Add entries for each terminal in FIRST
    for (const t of first) {
      const key = `${rule.lhs}-${t}`;
      const entries = table.get(key) || [];
      entries.push(rule.lhs);
      table.set(key, entries);
    }

    // If RHS can derive epsilon, add entries from FOLLOW
    const allDerivEpsilon = rule.rhs.every(sym => ff.getFirst(sym.value).has('ε'));
    if (allDerivEpsilon) {
      const follow = ff.getFollow(rule.lhs);
      for (const f of follow) {
        const key = `${rule.lhs}-${f}`;
        const entries = table.get(key) || [];
        entries.push(rule.lhs);
        table.set(key, entries);
      }
    }
  }

  return table;
}

function checkLL1Conflicts(table, grammar) {
  const conflicts = [];
  let conflictCount = 0;

  for (const [key, entries] of table.entries()) {
    if (entries.length > 1) {
      conflictCount++;
      conflicts.push(`Multiple entries for ${key}`);
    }
  }

  return { isLL1: conflictCount === 0, conflicts };
}

export default LL1Table;
