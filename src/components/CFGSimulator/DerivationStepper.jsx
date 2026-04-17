import React, { useState, useEffect } from 'react';
import DerivationEngine from '../../utils/derivation';

export function DerivationStepper({ grammar, inputString }) {
  const [derivationMode, setDerivationMode] = useState('leftmost');
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!grammar || !inputString) return;

    setLoading(true);
    setTimeout(() => {
      try {
        const engine = new DerivationEngine(grammar);
        const result = derivationMode === 'leftmost'
          ? engine.findLeftmostDerivation(inputString)
          : engine.findRightmostDerivation(inputString);

        if (result && result.steps) {
          setSteps(result.steps);
          setCurrentStep(0);
        }
      } catch (err) {
        console.error('Error computing derivation:', err);
      }
      setLoading(false);
    }, 100);
  }, [grammar, inputString, derivationMode]);

  useEffect(() => {
    if (!isAutoPlay || steps.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev + 1 >= steps.length) {
          setIsAutoPlay(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isAutoPlay, steps.length, speed]);

  const currentStepData = steps[currentStep];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose"></div>
          <h2 className="text-xl font-semibold text-gray-900">Derivation Stepper</h2>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-xs">
            <input
              type="radio"
              value="leftmost"
              checked={derivationMode === 'leftmost'}
              onChange={(e) => setDerivationMode(e.target.value)}
              className="w-4 h-4"
            />
            Leftmost (LMD)
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="radio"
              value="rightmost"
              checked={derivationMode === 'rightmost'}
              onChange={(e) => setDerivationMode(e.target.value)}
              className="w-4 h-4"
            />
            Rightmost (RMD)
          </label>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Computing derivation...</div>
      ) : steps.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {inputString ? 'No derivation found' : 'Enter a grammar and string to see derivations'}
        </div>
      ) : (
        <>
          {/* Current Step Display */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">Step {currentStep + 1} of {steps.length}</span>
                {currentStepData?.rule && (
                  <span className="text-xs bg-electric-blue/20 text-electric-blue px-2 py-1 rounded">
                    {currentStepData.rule}
                  </span>
                )}
              </div>
              <div className="font-mono text-lg font-semibold text-purple-nt break-all">
                {currentStepData?.form || ''}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 justify-center">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>

            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="px-6 py-2 bg-electric-blue text-white font-medium rounded-lg hover:bg-blue-600"
            >
              {isAutoPlay ? '⏸ Pause' : '▶ Play'}
            </button>

            <button
              onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
              disabled={currentStep === steps.length - 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-gray-600 w-16">Speed:</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.25"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono text-gray-600 w-8">{speed.toFixed(2)}x</span>
          </div>

          {/* Step History */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">Full Derivation:</p>
            <div className="flex flex-wrap gap-1">
              {steps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                    i === currentStep
                      ? 'bg-electric-blue text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Step {i + 1}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DerivationStepper;
