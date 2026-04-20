import React, { useState } from 'react';
import { AmbiguityDetector } from '../../utils/ambiguityDetector';
import { SimpleTreeDisplay } from './SimpleTreeDisplay';

export function AmbiguityChecker({ grammar, isDark }) {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [maxLength, setMaxLength] = useState(6);
  const [parseTrees, setParseTrees] = useState([]);

  const handleCheck = async () => {
    if (!grammar || !grammar.rules || grammar.rules.length === 0) {
      setError('Please enter a valid grammar first.');
      return;
    }

    setIsChecking(true);
    setError('');
    setResult(null);
    setParseTrees([]);

    try {
      const detector = new AmbiguityDetector(grammar, {
        maxStringLength: parseInt(maxLength) || 6,
        maxDerivations: 500000,
        maxDepth: 15
      });

      const detectionResult = await detector.detect();
      setResult(detectionResult);

      // If ambiguous, get parse trees
      if (detectionResult.isAmbiguous) {
        const trees = detector.getParseTrees(detectionResult.example);
        setParseTrees(trees);
      }
    } catch (err) {
      setError(err.message || 'Error during ambiguity detection');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className={`p-6 rounded-lg border transition-colors ${
      isDark 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Ambiguity Detection
          </h3>
          <span className={`text-xs px-2 py-1 rounded ${
            isDark 
              ? 'bg-slate-700 text-gray-300' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            Bounded Detection (Undecidable Problem)
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-end gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Max String Length
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={maxLength}
              onChange={(e) => setMaxLength(e.target.value)}
              disabled={isChecking}
              className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                isDark
                  ? 'bg-slate-700 border-slate-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>

          <button
            onClick={handleCheck}
            disabled={isChecking || !grammar}
            className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-all ${
              isChecking
                ? 'opacity-75 cursor-not-allowed'
                : 'hover:shadow-md active:scale-95'
            } ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-700'
                : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300'
            }`}
          >
            {isChecking ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Checking...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Check Ambiguity
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`p-3 rounded-md text-sm ${
            isDark
              ? 'bg-red-900/30 text-red-300 border border-red-800'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3">
            {/* Main Result */}
            <div className={`p-4 rounded-md border-2 transition-colors ${
              result.isAmbiguous
                ? isDark
                  ? 'bg-red-900/20 border-red-700 text-red-300'
                  : 'bg-red-50 border-red-300 text-red-800'
                : isDark
                  ? 'bg-emerald-900/20 border-emerald-700 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}>
              <div className="flex items-start gap-3">
                {result.isAmbiguous ? (
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                <div>
                  <div className="font-semibold">
                    {result.isAmbiguous ? '⚠️ Ambiguous Grammar' : '✓ No Ambiguity Detected'}
                  </div>
                  <div className="text-sm mt-1 opacity-90">
                    {result.isAmbiguous 
                      ? `Found ${result.parseCount} different parse trees for string "${result.example}"`
                      : `Checked ${result.totalStrings} strings up to length ${result.maxLength}`
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className={`grid grid-cols-2 gap-3 p-3 rounded-md ${
              isDark
                ? 'bg-slate-700/50'
                : 'bg-gray-50'
            }`}>
              <div>
                <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Strings Generated
                </div>
                <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {result.totalStrings}
                </div>
              </div>
              <div>
                <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Max Length Checked
                </div>
                <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {result.maxLength}
                </div>
              </div>
              {result.isAmbiguous && (
                <div>
                  <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Ambiguous String
                  </div>
                  <div className={`text-lg font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    "{result.example}"
                  </div>
                </div>
              )}
              {result.isAmbiguous && (
                <div>
                  <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Parse Trees
                  </div>
                  <div className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {result.parseCount}+
                  </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className={`p-3 text-xs rounded-md ${
              isDark
                ? 'bg-slate-700/50 text-gray-300'
                : 'bg-gray-50 text-gray-600'
            }`}>
              <p className="mb-2 font-medium">ℹ️ About this detection:</p>
              <ul className="space-y-1 list-disc list-inside opacity-75">
                <li>CFG ambiguity is undecidable in general</li>
                <li>This tool uses bounded search up to length {result.maxLength}</li>
                <li>If ambiguous string found → grammar is ambiguous</li>
                <li>If no ambiguity found → grammar may still be ambiguous for longer strings</li>
              </ul>
            </div>

            {result.warning && (
              <div className={`p-3 text-sm rounded-md ${
                isDark
                  ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800'
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}>
                ⚠️ {result.warning}
              </div>
            )}

            {/* Parse Trees for Ambiguous String */}
            {result.isAmbiguous && parseTrees.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Parse Trees for "{result.example}"
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parseTrees.slice(0, 2).map((tree, idx) => (
                    <div key={idx} className={`rounded-md border ${
                      isDark
                        ? 'bg-slate-700/50 border-slate-600'
                        : 'bg-gray-50 border-gray-300'
                    }`}>
                      <div className={`text-sm font-medium p-3 border-b ${
                        isDark
                          ? 'border-slate-600 text-gray-300'
                          : 'border-gray-300 text-gray-600'
                      }`}>
                        Tree {idx + 1}
                      </div>
                      <SimpleTreeDisplay tree={tree} isDark={isDark} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Initial State */}
        {!result && !isChecking && (
          <div className={`p-4 rounded-md text-center text-sm ${
            isDark
              ? 'bg-slate-700/50 text-gray-400'
              : 'bg-gray-50 text-gray-600'
          }`}>
            <p>Click "Check Ambiguity" to analyze your grammar for ambiguous productions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
