import React, { useState, useEffect } from 'react';
import { GrammarInput } from './GrammarInput';
import { StringTester } from './StringTester';
import { FirstFollowTable } from './FirstFollowTable';
import { CYKTable } from './CYKTable';
import { ParseTreeD3 } from './ParseTreeD3';
import { DerivationStepper } from './DerivationStepper';
import { LL1Table } from './LL1Table';
import { useTheme } from '../../context/ThemeContext';
import CFGParser from '../../utils/cfgParser';

export function CFGSimulator() {
  const [grammarText, setGrammarText] = useState('S -> AB\nA -> aA | a\nB -> bB | b');
  const [grammar, setGrammar] = useState(null);
  const [inputString, setInputString] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [grammarParsed, setGrammarParsed] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  // Parse grammar when text changes
  useEffect(() => {
    if (!grammarText.trim()) {
      setGrammar(null);
      setGrammarParsed(false);
      return;
    }

    try {
      const parsed = CFGParser.parse(grammarText, '');
      setGrammar(parsed);
      setGrammarParsed(true);
      setError('');
    } catch (err) {
      setError(err.message);
      setGrammar(null);
      setGrammarParsed(false);
    }
  }, [grammarText]);

  return ( dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CFG Simulator</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Context-Free Grammar & Parse Tree Visualization</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                grammarParsed
                  ? 'bg-emerald/20 text-emerald dark:bg-emerald/30 dark:text-emerald'
                  : 'bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
              }`}>
                {grammarParsed ? '✓ Grammar Valid' : '○ Enter Grammar'}
              </span>
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-200"
                aria-label="Toggle dark mode"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.293 1.293a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2.828 2.829a1 1 0 011.415 0l.707.707a1 1 0 11-1.414 1.415l-.707-.707a1 1 0 010-1.415zM10 7a3 3 0 100 6 3 3 0 000-6zm.707 5.707a1 1 0 11-1.414 1.414l-.707.707a1 1 0 001.414 1.414l.707-.707a1 1 0 000-1.414zM10 18a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm4.293-1.293a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 000-1.414zm2.828-2.829a1 1 0 011.415 0l.707.707a1 1 0 11-1.414 1.415l-.707-.707a1 1 0 010-1.415zM3 10a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm5.414-5.414a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM9 5a1 1 0 010-2 3 3 0 013 3 1 1 0 11-2 0 1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </buttoammarParsed ? '✓ Grammar Valid' : '○ Enter Grammar'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Input */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6 rounded-xl bg-white dark:bg-slate-800 shadow-sm dark:shadow-md transition-colors duration-300">
              <GrammarInput 
                grammar={grammarText}
                setGrammar={setGrammarText}
                error={error}
                setError={setError}
              />
            </div>

            <div className="glass-card p-6 rounded-xl bg-white dark:bg-slate-800 shadow-sm dark:shadow-md transition-colors duration-300">
              <StringTester
                grammar={grammar}
                inputString={inputString}
                setInputString={setInputString}
                onTestResult={console.log}
              />
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2 space-y-6">
            {grammarParsed ? (
              <>
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-slate-700 pb-3">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                      activeTab === 'overview'
                        ? 'bg-electric-blue text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('sets')}
                    className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                      activeTab === 'sets'
                        ? 'bg-electric-blue text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    FIRST/FOLLOW
                  </button>
                  <button
                    onClick={() => setActiveTab('cyk')}
                    className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                      activeTab === 'cyk'
                        ? 'bg-electric-blue text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    CYK Algorithm
                  </button>
                  <button
                    onClick={() => setActiveTab('tree')}
                    className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                      activeTab === 'tree'
                        ? 'bg-electric-blue text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Parse Tree
                  </button>
                  <button
                    onClick={() => setActiveTab('derivation')}
                    className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                      activeTab === 'derivation'
                        ? 'bg-electric-blue text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Derivation
                  </button>
                  <button
                    onClick={() => setActiveTab('ll1')}
                    className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                      activeTab === 'll1'
                        ? 'bg-electric-blue text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    LL(1) table
                  </button>
                </div>

                {/* Tab Content */}
                <div className="glass-card p-6 rounded-xl bg-white dark:bg-slate-800 shadow-sm dark:shadow-md transition-colors duration-300">
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Grammar Overview</h2>
                      <grid className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg transition-colors duration-300">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Non-Terminals</p>
                          <div className="flex flex-wrap gap-1">
                            {Array.from(grammar.nonTerminals).map(nt => (
                              <span key={nt} className="px-2 py-1 bg-purple-nt/20 dark:bg-purple-nt/40 text-purple-nt dark:text-purple-400 text-xs font-mono rounded transition-colors duration-300">
                                {nt}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg transition-colors duration-300">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Terminals</p>
                          <div className="flex flex-wrap gap-1">
                            {Array.from(grammar.terminals).slice(0, 10).map(t => (
                              <span key={t} className="px-2 py-1 bg-amber-token/20 dark:bg-amber-token/40 text-amber-token dark:text-amber-300 text-xs font-mono rounded transition-colors duration-300">
                                {t}
                              </span>
                            ))}
                            {grammar.terminals.size > 10 && (
                              <span className="px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs rounded transition-colors duration-300">
                                +{grammar.terminals.size - 10} more
                              </span>
                            )}
                          </div>
                        </div>
                      </grid>
                      <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg transition-colors duration-300">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Start Symbol</p>
                        <p className="font-mono font-semibold text-purple-nt dark:text-purple-400">{grammar.startSymbol}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg transition-colors duration-300">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Production Rules</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {grammar.rules.map((rule, i) => (
                            <p key={i} className="font-mono text-sm text-gray-700 dark:text-gray-300">
                              {rule.lhs} → {rule.rhs.map(s => s.value).join('')}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'sets' && (
                    <FirstFollowTable grammar={grammar} />
                  )}

                  {activeTab === 'cyk' && (
                    <CYKTable grammar={grammar} inputString={inputString} />
                  )}

                  {activeTab === 'tree' && (
                    <ParseTreeD3 parseTree={{
                      symbol: 'S',
                      type: 'nonterminal',
                      children: [
                        { symbol: 'a', type: 'terminal', children: null },
                        { symbol: 'A', type: 'nonterminal', children: [
                          { symbol: 'a', type: 'terminal', children: null }
                        ]}
                      ]
                    }} />
                  )}

                  {activeTab === 'derivation' && (
                    <DerivationStepper grammar={grammar} inputString={inputString} />
                  )}

                  {activeTab === 'll1' && (
                    <LL1Table grammar={grammar} />
                  )}
                </div>
              </>
            ) : (
              <div className="glass-card p-12 rounded-xl text-center bg-white dark:bg-slate-800 shadow-sm dark:shadow-md transition-colors duration-300">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Enter a Grammar</h3>
                <p className="text-gray-600 dark:text-gray-400">Start by entering production rules in the left panel to see analysis here</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 mt-16 py-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>CFG Simulator v1.0 • Theory of Automata & Formal Languages</p>
          <p className="mt-2 text-xs">Built with React, D3.js, and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}

export default CFGSimulator;
