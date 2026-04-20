import React from 'react';

/**
 * Simple tree display component for parse trees
 * Renders tree as nested boxes and lines
 */
export function SimpleTreeDisplay({ tree, isDark }) {
  if (!tree) return null;

  const renderNode = (node, depth = 0) => {
    if (!node) return null;

    const isTerminal = node.type === 'terminal';
    const isRoot = depth === 0;

    return (
      <div key={`${node.symbol}-${depth}`} className="flex flex-col items-center">
        {/* Node */}
        <div
          className={`px-3 py-1 rounded font-mono text-sm font-semibold whitespace-nowrap ${
            isTerminal
              ? isDark
                ? 'bg-amber-700 text-amber-100'
                : 'bg-amber-400 text-amber-900'
              : isDark
                ? 'bg-blue-700 text-blue-100'
                : 'bg-blue-400 text-blue-900'
          }`}
        >
          {node.symbol}
        </div>

        {/* Children */}
        {node.children && node.children.length > 0 && (
          <>
            {/* Connector line down */}
            <div
              className={`w-0.5 h-4 ${isDark ? 'bg-gray-600' : 'bg-gray-400'}`}
              style={{ marginTop: '2px' }}
            />

            {/* Children container */}
            <div
              className="flex gap-8 items-start"
              style={{ marginTop: '4px' }}
            >
              {node.children.map((child, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center relative"
                >
                  {/* Connector to parent */}
                  <div
                    className={`absolute w-px h-4 -top-4 left-1/2 transform -translate-x-1/2 ${
                      isDark ? 'bg-gray-600' : 'bg-gray-400'
                    }`}
                  />

                  {renderNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`p-4 rounded-lg overflow-auto flex justify-center ${
      isDark ? 'bg-slate-700/30' : 'bg-gray-50'
    }`} style={{ minHeight: '300px' }}>
      <div className="flex flex-col items-center pt-4">
        {renderNode(tree)}
      </div>
    </div>
  );
}
