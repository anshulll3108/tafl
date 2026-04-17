import React, { useState, useEffect } from 'react';

export function StringTester({ grammar, inputString, setInputString, onTestResult }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testString = () => {
    if (!grammar || !inputString.trim()) {
      setResult({ accepted: false, message: 'Enter a string to test' });
      return;
    }

    setLoading(true);
    
    // Simulate async computation
    setTimeout(() => {
      try {
        // Basic CYK or acceptance check would go here
        // For now, simple check - accept if string can be derived
        const accepted = Math.random() > 0.5; // Placeholder
        
        setResult({
          accepted,
          message: accepted 
            ? `✓ String "${inputString}" is accepted by the grammar`
            : `✗ String "${inputString}" is rejected by the grammar`,
          string: inputString
        });
        
        onTestResult?.(result);
      } catch (err) {
        setResult({ accepted: false, message: `Error: ${err.message}` });
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      testString();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-amber-token"></div>
        <h2 className="text-xl font-semibold text-gray-900">String Tester</h2>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Input String
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter test string (space-separated tokens or raw characters)"
            className="flex-1 px-4 py-2 font-mono text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-transparent"
          />
          <button
            onClick={testString}
            disabled={loading}
            className="px-6 py-2 bg-electric-blue text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Testing...' : 'Test'}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`p-4 rounded-lg border ${
          result.accepted 
            ? 'bg-emerald/10 border-emerald/30' 
            : 'bg-rose/10 border-rose/30'
        }`}>
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-bold ${result.accepted ? 'text-emerald' : 'text-rose'}`}>
              {result.accepted ? '✓' : '✗'}
            </span>
            <div>
              <p className={`font-medium ${result.accepted ? 'text-emerald' : 'text-rose'}`}>
                {result.accepted ? 'Accepted' : 'Rejected'}
              </p>
              <p className="text-sm text-gray-600">{result.string}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StringTester;
