import React, { useState, useEffect } from 'react';

interface NeuralPanelProps {
  aiMode: boolean;
  faceDetected: boolean;
  confidence: number;
}

export const NeuralPanel: React.FC<NeuralPanelProps> = ({ 
  aiMode, 
  faceDetected, 
  confidence 
}) => {
  const [telemetry, setTelemetry] = useState<string[]>([]);

  useEffect(() => {
    const defaultLogs = [
      'OPTIMIZING OPTIC ARRAY...',
      'SYNCING BIOMETRICS...',
      'NEURAL LINK STABLE',
      'VOXEL MAPPING ENABLED',
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      let pool = defaultLogs;
      if (faceDetected && aiMode) {
        pool = [...defaultLogs, 'TARGET ACQUIRED', 'ANALYZING MESH...', 'LOCKED'];
      }
      
      setTelemetry((prev) => [...prev, pool[i % pool.length]].slice(-4));
      i++;
    }, 1500);

    return () => clearInterval(interval);
  }, [faceDetected, aiMode]);

  return (
    <div className="neural-panel">
      <div className="telemetry-grid">
        <div className="status-item">
          <span className="label">SYSTEM STATUS:</span>
          <span className="value t-ok">OPTIMAL</span>
        </div>
        
        <div className="status-item">
          <span className="label">AI MODE:</span>
          <span className="value" style={{ color: aiMode ? 'var(--neon-primary)' : 'var(--text-ghost)' }}>
            {aiMode ? 'ACTIVE' : 'PASSIVE'}
          </span>
        </div>

        <div className="status-item">
          <span className="label">TARGET_STATUS:</span>
          <span 
            className={`value ${faceDetected ? 'anim-pulse' : ''}`} 
            style={{ color: faceDetected ? 'var(--neon-hot)' : 'var(--text-disabled)' }}
          >
            {faceDetected ? 'LOCKED' : 'SEARCHING'}
          </span>
        </div>

        {/* ── NEURAL CONFIDENCE BAR ── */}
        <div className="status-item confidence-box">
          <span className="label">NEURAL PROBABILITY:</span>
          <div className="confidence-track">
            <div 
              className="confidence-fill" 
              style={{ width: `${confidence * 100}%` }}
            ></div>
          </div>
          <span className="confidence-text">{(confidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="telemetry-logs">
        {telemetry.map((log, idx) => (
          <div key={idx} className="log-line anim-typing">{log}</div>
        ))}
      </div>

      <style>{`
        .neural-panel {
          padding: var(--space-4);
          background: var(--surface);
          border-bottom: var(--border-dim);
          font-family: var(--font-ui);
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 10;
          transition: all 0.3s ease;
        }

        .telemetry-grid {
          display: flex;
          gap: var(--space-8);
          align-items: center;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .confidence-box {
          min-width: 120px;
        }

        .confidence-track {
          width: 100%;
          height: 4px;
          background: var(--text-disabled);
          margin-top: 4px;
          position: relative;
          overflow: hidden;
        }

        .confidence-fill {
          height: 100%;
          background: var(--neon-primary);
          box-shadow: var(--glow-sm);
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .confidence-text {
          font-size: 8px;
          color: var(--neon-primary);
          text-align: right;
          font-weight: 700;
          margin-top: 2px;
        }

        .label {
          font-size: 9px;
          color: var(--text-primary);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .value {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--neon-primary);
          text-shadow: var(--glow-sm);
        }

        .anim-pulse {
          animation: pulse-glow 2s infinite ease-in-out;
        }

        .telemetry-logs {
          font-family: var(--font-terminal);
          font-size: 10px;
          color: var(--text-ghost);
          min-width: 250px;
          text-align: right;
        }

        .log-line {
          height: 14px;
        }

        @keyframes pulse-glow {
          0%, 100% { text-shadow: var(--glow-sm); opacity: 0.8; }
          50% { text-shadow: var(--glow-md); opacity: 1; }
        }

        @media (max-width: 1000px) {
          .neural-panel { flex-direction: column; gap: 15px; }
          .telemetry-grid { flex-wrap: wrap; gap: 15px; justify-content: center; }
          .telemetry-logs { display: none; }
        }
      `}</style>
    </div>
  );
};
