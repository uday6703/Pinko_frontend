import React, { useState, useEffect, useCallback } from 'react';
import PlinkoAnimation from './PlinkoAnimation';
import { formatCents, generateClientSeed, API_BASE_URL } from '../utils/utils';

export default function PlinkoGame({ onVerifyRound }) {
  const [dropColumn, setDropColumn] = useState(6);
  const [betAmount, setBetAmount] = useState('1.00');
  const [clientSeed, setClientSeed] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [roundId, setRoundId] = useState('');
  const [easterEggActive, setEasterEggActive] = useState({
    tilt: false,
    darkTheme: false
  });
  const [keySequence, setKeySequence] = useState('');
  
  // Initialize client seed on component mount
  useEffect(() => {
    setClientSeed(generateClientSeed());
  }, []);

  // Easter egg detection and keyboard controls
  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key.toLowerCase();
      
      // Tilt effect with 'T'
      if (key === 't') {
        setEasterEggActive(prev => ({ ...prev, tilt: !prev.tilt }));
        return;
      }

      // Dark theme sequence detection
      const newSequence = keySequence + key;
      if ('open sesame'.startsWith(newSequence)) {
        setKeySequence(newSequence);
        if (newSequence === 'open sesame') {
          setEasterEggActive(prev => ({ ...prev, darkTheme: !prev.darkTheme }));
          setKeySequence('');
        }
      } else {
        setKeySequence(key);
      }

      // Keyboard controls
      if (key === 'arrowleft') {
        event.preventDefault();
        setDropColumn(prev => Math.max(0, prev - 1));
      } else if (key === 'arrowright') {
        event.preventDefault();
        setDropColumn(prev => Math.min(12, prev + 1));
      } else if (key === ' ' && !isLoading && !isAnimating) {
        event.preventDefault();
        handleDropBall();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [keySequence, isLoading, isAnimating]);

  // Clear easter eggs after one round
  useEffect(() => {
    if (gameResult && easterEggActive.darkTheme) {
      const timer = setTimeout(() => {
        setEasterEggActive(prev => ({ ...prev, darkTheme: false }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [gameResult, easterEggActive.darkTheme]);

  const handleDropBall = async () => {
    if (isLoading || isAnimating) return;

    setIsLoading(true);
    setGameResult(null);
    setShowResults(false);

    try {
      // First, commit to a round
      const commitResponse = await fetch(`${API_BASE_URL}/api/rounds/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!commitResponse.ok) {
        throw new Error('Failed to create round commitment');
      }

      const commitData = await commitResponse.json();
      setRoundId(commitData.roundId);

      // Then start the round with client parameters
      const betCents = Math.round(parseFloat(betAmount) * 100);
      const startResponse = await fetch(`${API_BASE_URL}/api/rounds/${commitData.roundId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientSeed,
          betCents,
          dropColumn,
        }),
      });

      if (!startResponse.ok) {
        throw new Error('Failed to start round');
      }

      const result = await startResponse.json();
      setGameResult(result);
      setIsAnimating(true);

    } catch (error) {
      console.error('Error playing round:', error);
      alert('Failed to play round. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
    setShowResults(true);
    
    // Auto-reveal the round after animation
    if (roundId) {
      fetch(`${API_BASE_URL}/api/rounds/${roundId}/reveal`, { method: 'POST' })
        .catch(console.error);
    }
  }, [roundId]);

  const handleBetAmountChange = (value) => {
    // Allow only valid decimal numbers
    if (/^\d*\.?\d*$/.test(value)) {
      setBetAmount(value);
    }
  };

  const openVerifyWindow = () => {
    if (gameResult && onVerifyRound) {
      onVerifyRound(gameResult);
    }
  };

  return (
    <div className={`transition-all duration-500 ${
      easterEggActive.darkTheme ? 'bg-gray-900' : ''
    }`}>
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-bold mb-2 ${
          easterEggActive.darkTheme ? 'text-orange-400' : 'text-gray-900'
        }`}>
          Plinko Lab
        </h2>
        <p className={`text-sm ${
          easterEggActive.darkTheme ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Provably Fair • Deterministic • Transparent
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Board */}
        <div className="lg:col-span-2">
          <div className={`card ${easterEggActive.darkTheme ? 'bg-gray-800 border-gray-600' : ''}`}>
            <div className="card-content">
              <PlinkoAnimation
                pegMap={gameResult?.pegMap}
                path={gameResult?.path}
                isAnimating={isAnimating}
                onAnimationComplete={handleAnimationComplete}
                dropColumn={dropColumn}
                tiltAngle={easterEggActive.tilt ? (Math.random() - 0.5) * 10 : 0}
                isDarkTheme={easterEggActive.darkTheme}
              />
            </div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="space-y-6">
          {/* Controls Card */}
          <div className={`card ${easterEggActive.darkTheme ? 'bg-gray-800 border-gray-600' : ''}`}>
            <div className="card-header">
              <h3 className={`card-title ${easterEggActive.darkTheme ? 'text-orange-400' : ''}`}>
                Game Controls
              </h3>
            </div>
            <div className="card-content space-y-4">
              <div className="form-group">
                <label className={`form-label ${easterEggActive.darkTheme ? 'text-gray-300' : ''}`}>
                  Drop Column: {dropColumn}
                </label>
                <input
                  type="range"
                  min={0}
                  max={12}
                  value={dropColumn}
                  onChange={(e) => setDropColumn(parseInt(e.target.value))}
                  className="slider"
                  disabled={isLoading || isAnimating}
                />
                <div className={`text-sm mt-1 ${
                  easterEggActive.darkTheme ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Use ← → arrow keys
                </div>
              </div>

              <div className="form-group">
                <label className={`form-label ${easterEggActive.darkTheme ? 'text-gray-300' : ''}`}>
                  Bet Amount
                </label>
                <div className="flex items-center space-x-2">
                  <span className={easterEggActive.darkTheme ? 'text-gray-300' : 'text-gray-700'}>$</span>
                  <input
                    type="text"
                    value={betAmount}
                    onChange={(e) => handleBetAmountChange(e.target.value)}
                    disabled={isLoading || isAnimating}
                    className={`form-input ${easterEggActive.darkTheme ? 'bg-gray-700 border-gray-600 text-gray-100' : ''}`}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className={`form-label ${easterEggActive.darkTheme ? 'text-gray-300' : ''}`}>
                  Client Seed
                </label>
                <input
                  type="text"
                  value={clientSeed}
                  onChange={(e) => setClientSeed(e.target.value)}
                  disabled={isLoading || isAnimating}
                  className={`form-input ${easterEggActive.darkTheme ? 'bg-gray-700 border-gray-600 text-gray-100' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setClientSeed(generateClientSeed())}
                  className="btn btn-secondary mt-2"
                  disabled={isLoading || isAnimating}
                >
                  Generate New
                </button>
              </div>

              <button
                onClick={handleDropBall}
                disabled={isLoading || isAnimating}
                className="btn btn-primary w-full"
                style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
              >
                {isLoading ? 'Creating Round...' : isAnimating ? 'Dropping...' : 'Drop Ball (Space)'}
              </button>
            </div>
          </div>

          {/* Results Card */}
          {gameResult && showResults && (
            <div className={`card ${easterEggActive.darkTheme ? 'bg-gray-800 border-gray-600' : ''}`}>
              <div className="card-header">
                <h3 className={`card-title ${easterEggActive.darkTheme ? 'text-orange-400' : ''}`}>
                  Round Result
                </h3>
              </div>
              <div className="card-content space-y-3">
                <div className="flex justify-between">
                  <span className={easterEggActive.darkTheme ? 'text-gray-300' : 'text-gray-600'}>Landed in Bin:</span>
                  <span className={`font-bold ${easterEggActive.darkTheme ? 'text-orange-400' : 'text-gray-900'}`}>
                    {gameResult.binIndex}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={easterEggActive.darkTheme ? 'text-gray-300' : 'text-gray-600'}>Multiplier:</span>
                  <span className={`font-bold ${easterEggActive.darkTheme ? 'text-orange-400' : 'text-gray-900'}`}>
                    {gameResult.payoutMultiplier}x
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={easterEggActive.darkTheme ? 'text-gray-300' : 'text-gray-600'}>Bet Amount:</span>
                  <span className={easterEggActive.darkTheme ? 'text-gray-100' : 'text-gray-900'}>
                    {formatCents(gameResult.betCents)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={easterEggActive.darkTheme ? 'text-gray-300' : 'text-gray-600'}>Win Amount:</span>
                  <span className={`font-bold text-lg ${
                    gameResult.winAmount > gameResult.betCents 
                      ? 'text-green' 
                      : easterEggActive.darkTheme ? 'text-red' : 'text-red'
                  }`}>
                    {formatCents(gameResult.winAmount)}
                  </span>
                </div>
                
                <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
                  <button
                    onClick={openVerifyWindow}
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                  >
                    🔍 Verify This Round
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Easter Egg Hints */}
      <div className={`mt-6 text-center text-xs ${
        easterEggActive.darkTheme ? 'text-gray-500' : 'text-gray-400'
      }`}>
        <p>Press 'T' for a surprise • Type "open sesame" for another surprise</p>
        <p>Keyboard controls: ← → arrows to change drop column, Space to drop</p>
      </div>
    </div>
  );
}