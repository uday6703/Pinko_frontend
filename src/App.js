import React, { useState } from 'react';
import PlinkoGame from './components/PlinkoGame';
import Verify from './components/Verify';

function App() {
  const [verifyData, setVerifyData] = useState(null);
  const [showVerifier, setShowVerifier] = useState(false);

  const handleVerifyRound = async (gameResult) => {
    console.log('Verify round called with:', gameResult);
    console.log('gameResult keys:', gameResult ? Object.keys(gameResult) : 'null/undefined');
    console.log('roundId exists:', !!gameResult?.roundId);
    console.log('roundId value:', gameResult?.roundId);
    
    if (gameResult && gameResult.roundId) {
      try {
        console.log('Attempting to reveal server seed for round:', gameResult.roundId);
        
        // First, reveal the server seed if not already revealed
        const revealResponse = await fetch(`http://localhost:5000/api/rounds/${gameResult.roundId}/reveal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('Reveal response status:', revealResponse.status);
        
        if (revealResponse.ok) {
          const revealData = await revealResponse.json();
          console.log('Reveal data received:', revealData);
          
          setVerifyData({
            serverSeed: revealData.serverSeed || '',
            clientSeed: revealData.clientSeed || gameResult.clientSeed || '',
            nonce: revealData.nonce?.toString() || gameResult.nonce?.toString() || '',
            dropColumn: gameResult.dropColumn?.toString() || ''
          });
          
          console.log('Verify data set successfully');
        } else {
          const errorText = await revealResponse.text();
          console.error('Reveal failed with status:', revealResponse.status);
          console.error('Reveal error response:', errorText);
          
          // If reveal fails, use available data from gameResult
          setVerifyData({
            serverSeed: '', // Server seed not available without reveal
            clientSeed: gameResult.clientSeed || '',
            nonce: gameResult.nonce?.toString() || '',
            dropColumn: gameResult.dropColumn?.toString() || ''
          });
          
          alert(`Server seed reveal failed (${revealResponse.status}): ${errorText}. Please try again or enter the server seed manually.`);
        }
        
        // Show the verifier section
        setShowVerifier(true);
        
        // Scroll to verifier section
        setTimeout(() => {
          document.getElementById('verifier-section')?.scrollIntoView({ 
            behavior: 'smooth' 
          });
        }, 100);
        
      } catch (error) {
        console.error('Error preparing verification data:', error);
        
        // Fallback to available data from gameResult
        setVerifyData({
          serverSeed: '', // Server seed not available due to error
          clientSeed: gameResult.clientSeed || '',
          nonce: gameResult.nonce?.toString() || '',
          dropColumn: gameResult.dropColumn?.toString() || ''
        });
        
        setShowVerifier(true);
        alert('Failed to auto-fill server seed. Please enter it manually after revealing the round.');
      }
    } else {
      console.error('No valid game result provided:', gameResult);
      alert('No game result available. Please play a round first.');
    }
  };

  const handleCloseVerifier = () => {
    setShowVerifier(false);
    setVerifyData(null);
  };

  return (
    <div className="App">
      <div className="app-container">
        <div className="app-header">
          <h1>Plinko Game Dashboard</h1>
          <p>Play the game and click "Verify in Side Panel →" to verify results</p>
        </div>
        <div className="app-layout">
          <div className="game-section">
            <PlinkoGame onVerifyRound={handleVerifyRound} />
          </div>
          {showVerifier && (
            <div id="verifier-section" className="verify-section">
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h2 style={{ margin: 0, color: '#10b981', fontSize: '1.5rem' }}>
                  Round Verification
                </h2>
                <button
                  onClick={handleCloseVerifier}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  × Close
                </button>
              </div>
              <Verify verifyData={verifyData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;