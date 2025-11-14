import React, { useState, useEffect } from 'react';

export default function Verify({ verifyData }) {
  const [inputs, setInputs] = useState({
    serverSeed: '',
    clientSeed: '',
    nonce: '',
    dropColumn: ''
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [autoFilled, setAutoFilled] = useState(false);

  // Auto-fill form when verifyData is provided
  useEffect(() => {
    console.log('Verify component received verifyData:', verifyData);
    if (verifyData) {
      setInputs(verifyData);
      setResult(null);
      setError('');
      setAutoFilled(true);
      // Clear the auto-filled message after 3 seconds
      setTimeout(() => setAutoFilled(false), 3000);
    }
  }, [verifyData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const params = new URLSearchParams(inputs);
      const response = await fetch(`http://localhost:5000/api/verify?${params}`);
      
      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '0', maxWidth: '100%', margin: '0' }}>
      <h2 style={{ marginBottom: '1rem', color: '#10b981', fontSize: '1.5rem' }}>Provably Fair Verifier</h2>
      <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>Enter round details to verify the outcome was fair and deterministic:</p>
      
      {autoFilled && (
        <div style={{ 
          backgroundColor: '#d1fae5', 
          border: '1px solid #10b981', 
          borderRadius: '4px', 
          padding: '10px', 
          marginBottom: '15px',
          color: '#065f46'
        }}>
          ✓ Form auto-filled with game round data!
        </div>
      )}
      
      <form onSubmit={handleVerify} style={{ marginBottom: '30px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Server Seed:
          </label>
          <input
            type="text"
            name="serverSeed"
            value={inputs.serverSeed}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px', fontFamily: 'monospace', fontSize: '12px' }}
            placeholder="64-character hex string (auto-filled when using verify button)"
            required
          />
          {!inputs.serverSeed && (
            <div style={{ 
              fontSize: '12px', 
              color: '#6c757d', 
              marginTop: '4px',
              padding: '8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              💡 <strong>How to get Server Seed:</strong><br/>
              • <strong>Automatic:</strong> Use "🔍 Verify This Round" button after playing<br/>
              • <strong>Manual:</strong> Call POST <code>/api/rounds/{`{roundId}`}/reveal</code> to get the server seed
            </div>
          )}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Client Seed:
          </label>
          <input
            type="text"
            name="clientSeed"
            value={inputs.clientSeed}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px' }}
            placeholder="Your chosen client seed"
            required
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Nonce:
          </label>
          <input
            type="text"
            name="nonce"
            value={inputs.nonce}
            onChange={handleInputChange}
            style={{ width: '100%', padding: '8px' }}
            placeholder="Round nonce"
            required
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Drop Column (0-12):
          </label>
          <input
            type="number"
            name="dropColumn"
            value={inputs.dropColumn}
            onChange={handleInputChange}
            min="0"
            max="12"
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        
        <button 
          type="submit"
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Verifying...' : 'Verify Round'}
        </button>
      </form>

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px' 
        }}>
          Error: {error}
        </div>
      )}

      {result && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px' 
        }}>
          <h2>Verification Result</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>Commit Hash:</strong>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '12px', 
              backgroundColor: '#ffffff',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              marginTop: '5px',
              wordBreak: 'break-all'
            }}>
              {result.commitHex}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Combined Seed:</strong>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '12px', 
              backgroundColor: '#ffffff',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              marginTop: '5px',
              wordBreak: 'break-all'
            }}>
              {result.combinedSeed}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Peg Map Hash:</strong>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '12px', 
              backgroundColor: '#ffffff',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              marginTop: '5px',
              wordBreak: 'break-all'
            }}>
              {result.pegMapHash}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Final Bin:</strong> {result.binIndex}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Payout Multiplier:</strong> {result.payoutMultiplier}x
          </div>

          {result.path && (
            <div>
              <h3>Ball Path Replay</h3>
              <div style={{ 
                fontFamily: 'monospace', 
                fontSize: '12px',
                backgroundColor: '#ffffff',
                padding: '10px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {result.path.map((step, index) => (
                  <div key={index}>
                    Row {step.row}: Column {step.column} → {step.direction}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ 
            marginTop: '15px',
            padding: '10px',
            backgroundColor: result.binIndex !== undefined ? '#d4edda' : '#f8d7da',
            color: result.binIndex !== undefined ? '#155724' : '#721c24',
            border: `1px solid ${result.binIndex !== undefined ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px'
          }}>
            {result.binIndex !== undefined ? '✅ Verification Successful' : '❌ Verification Failed'}
          </div>
        </div>
      )}

      {/* Explanatory Section */}
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ color: '#495057', marginBottom: '15px', fontSize: '1.2rem' }}>
          🔍 What is Provably Fair Verification?
        </h3>
        
        <p style={{ color: '#6c757d', marginBottom: '20px', lineHeight: '1.5' }}>
          This verification system proves that every game round was completely fair and not manipulated. 
          Each field contributes to the mathematical proof:
        </p>

        <div style={{ display: 'grid', gap: '15px' }}>
          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #dee2e6' }}>
            <strong style={{ color: '#007bff' }}>Server Seed:</strong>
            <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
              A 64-character random value generated by the server. This is kept secret during the game 
              and only revealed after completion via the <code>/api/rounds/{`{roundId}`}/reveal</code> endpoint. 
              The "🔍 Verify This Round" button automatically fetches this for you.
            </p>
          </div>

          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #dee2e6' }}>
            <strong style={{ color: '#28a745' }}>Client Seed:</strong>
            <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
              Your chosen random value that you provide before playing. This ensures you contribute to the randomness 
              and the server cannot predict or manipulate the outcome.
            </p>
          </div>

          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #dee2e6' }}>
            <strong style={{ color: '#ffc107' }}>Nonce:</strong>
            <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
              A unique number for each round that ensures different outcomes even with the same seeds. 
              It prevents replay attacks and guarantees each game is unique.
            </p>
          </div>

          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #dee2e6' }}>
            <strong style={{ color: '#dc3545' }}>Drop Column:</strong>
            <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
              Your gameplay choice (0-12) of where to drop the ball. This decision affects the final outcome 
              and is part of the deterministic calculation.
            </p>
          </div>
        </div>

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#e7f3ff', 
          borderRadius: '4px',
          border: '1px solid #b3d9ff'
        }}>
          <strong style={{ color: '#0056b3' }}>🛡️ Why This Matters:</strong>
          <p style={{ margin: '8px 0 0 0', color: '#0056b3', fontSize: '14px' }}>
            Unlike traditional online games where you must "trust" the house, this system provides 
            <strong> mathematical proof</strong> that every outcome is fair. The verification recreates 
            the exact same game using cryptographic algorithms, making cheating mathematically impossible.
          </p>
        </div>
      </div>
    </div>
  );
}