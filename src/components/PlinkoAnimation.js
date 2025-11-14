import React, { useEffect, useRef, useState } from 'react';

const ROWS = 12;

export default function PlinkoAnimation({
  pegMap,
  path,
  isAnimating,
  onAnimationComplete,
  dropColumn,
  enableSound = true,
  tiltAngle = 0,
  isDarkTheme = false
}) {
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 });
  const [currentStep, setCurrentStep] = useState(-1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  
  const boardRef = useRef(null);
  const soundRef = useRef(null);

  // Initialize sound (simplified - no Howler dependency)
  useEffect(() => {
    if (typeof window !== 'undefined' && enableSound) {
      // Simple audio setup - can be enhanced later
      soundRef.current = {
        play: () => {
          // Could implement Web Audio API or simple audio element
          console.log('Peg hit sound would play here');
        }
      };
    }
  }, [enableSound]);

  // Window resize handler for confetti
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  // Calculate board dimensions
  const BOARD_WIDTH = 600;
  const BOARD_HEIGHT = 500;
  const PEG_SIZE = 8;
  const BALL_SIZE = 12;
  
  const rowHeight = BOARD_HEIGHT / (ROWS + 2);

  // Calculate ball starting position
  const startX = (dropColumn / ROWS) * BOARD_WIDTH;
  const startY = 0;

  // Animation effect
  useEffect(() => {
    if (!isAnimating || !path || path.length === 0) {
      setCurrentStep(-1);
      setBallPosition({ x: startX, y: startY });
      return;
    }

    let stepIndex = 0;
    setBallPosition({ x: startX, y: startY });
    setCurrentStep(0);

    const animateStep = () => {
      if (stepIndex >= path.length) {
        // Final step: animate ball to the bottom bin
        const lastStep = path[path.length - 1];
        const finalBinX = (lastStep.column / ROWS) * BOARD_WIDTH;
        const finalBinY = BOARD_HEIGHT - 20; // Bottom of the board
        
        setBallPosition({ x: finalBinX, y: finalBinY });
        
        // Show results immediately, then confetti after a delay
        setTimeout(() => {
          onAnimationComplete(); // This will show the results
          
          // Show confetti after results are displayed
          setTimeout(() => {
            setShowConfetti(true);
            setTimeout(() => {
              setShowConfetti(false);
            }, 2000);
          }, 500); // 500ms delay before confetti starts
        }, 300);
        return;
      }

      const step = path[stepIndex];
      const targetX = (step.column / ROWS) * BOARD_WIDTH;
      const targetY = (step.row + 1) * rowHeight;

      // Play sound effect
      if (soundRef.current && enableSound) {
        soundRef.current.play();
      }

      // Animate to next position
      setBallPosition({ x: targetX, y: targetY });
      setCurrentStep(stepIndex);

      stepIndex++;
      setTimeout(animateStep, 300); // 300ms between steps
    };

    // Start animation after a brief delay
    setTimeout(animateStep, 500);
  }, [isAnimating, path, startX, startY, onAnimationComplete, enableSound]);

  if (!pegMap) {
    return (
      <div 
        style={{ 
          width: '100%', 
          height: '400px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          borderRadius: '8px',
          backgroundColor: isDarkTheme ? '#111827' : '#f3f4f6'
        }}
      >
        <div style={{ 
          fontSize: '1.125rem',
          color: isDarkTheme ? '#d1d5db' : '#6b7280'
        }}>
          Start a round to see the board
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '1rem' 
    }}>
      {/* Simple confetti effect */}
      {showConfetti && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 1000,
          background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)'
        }}>
          {/* Simple animated particles */}
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}vw`,
                top: '-10px',
                width: '4px',
                height: '4px',
                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)],
                animation: `fall ${2 + Math.random() * 2}s linear infinite`,
                opacity: 0.8
              }}
            />
          ))}
        </div>
      )}

      {/* Game Board */}
      <div
        ref={boardRef}
        style={{
          position: 'relative',
          width: BOARD_WIDTH,
          height: BOARD_HEIGHT,
          transform: `rotate(${tiltAngle}deg)`,
          transition: 'transform 0.5s ease-out',
          backgroundColor: isDarkTheme ? '#1f2937' : 'white',
          border: `2px solid ${isDarkTheme ? '#4b5563' : '#e5e7eb'}`,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: isDarkTheme ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Peg Grid */}
        {pegMap.map((row, rowIndex) =>
          row.map((pegBias, pegIndex) => {
            const x = ((pegIndex + 0.5) / (row.length)) * BOARD_WIDTH;
            const y = (rowIndex + 1) * rowHeight;

            return (
              <div
                key={`peg-${rowIndex}-${pegIndex}`}
                style={{
                  position: 'absolute',
                  left: x - PEG_SIZE / 2,
                  top: y - PEG_SIZE / 2,
                  width: PEG_SIZE,
                  height: PEG_SIZE,
                  borderRadius: '50%',
                  backgroundColor: isDarkTheme ? '#fb923c' : '#3b82f6',
                  opacity: currentStep >= rowIndex ? 0.8 : 0.4,
                  transition: 'opacity 0.2s ease',
                  boxShadow: `0 2px 4px 0 ${isDarkTheme ? '#ea580c' : '#1e40af'}`
                }}
              />
            );
          })
        )}

        {/* Bin Lines */}
        {Array.from({ length: ROWS + 2 }, (_, i) => (
          <div
            key={`bin-line-${i}`}
            style={{
              position: 'absolute',
              left: (i / (ROWS + 1)) * BOARD_WIDTH,
              top: BOARD_HEIGHT - 30,
              width: 1,
              height: 30,
              backgroundColor: isDarkTheme ? '#4b5563' : '#d1d5db'
            }}
          />
        ))}

        {/* Drop Zone Indicators */}
        {Array.from({ length: ROWS + 1 }, (_, i) => (
          <div
            key={`drop-zone-${i}`}
            style={{
              position: 'absolute',
              left: (i / ROWS) * BOARD_WIDTH - 10,
              top: -15,
              width: 20,
              height: 8,
              backgroundColor: i === dropColumn 
                ? (isDarkTheme ? '#f97316' : '#22c55e')
                : (isDarkTheme ? '#4b5563' : '#e5e7eb'),
              borderRadius: '2px',
              boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
          />
        ))}

        {/* Animated Ball */}
        <div
          style={{
            position: 'absolute',
            width: BALL_SIZE,
            height: BALL_SIZE,
            left: ballPosition.x - BALL_SIZE / 2,
            top: ballPosition.y - BALL_SIZE / 2,
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.5)',
            zIndex: 10,
            transition: 'all 0.3s ease',
            transform: isAnimating && currentStep >= 0 ? 'scale(1.2)' : 'scale(1)'
          }}
        />

        {/* Bin Labels */}
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          display: 'flex' 
        }}>
          {Array.from({ length: ROWS + 1 }, (_, i) => (
            <div
              key={`bin-${i}`}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '0.25rem 0',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                color: isDarkTheme ? '#fdba74' : '#374151'
              }}
            >
              {i}
            </div>
          ))}
        </div>
      </div>

      {/* Add keyframes for confetti animation */}
      <style>
        {`
          @keyframes fall {
            0% {
              transform: translateY(-10px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  );
}