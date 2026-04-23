import React, { useState, useEffect } from 'react';

interface NeuralPanelProps {
  aiMode: boolean;
  faceDetected: boolean;
  confidence: number;
  multiplayerStatus: string;
  onToggleFullScreen: () => void;
}

export const NeuralPanel: React.FC<NeuralPanelProps> = ({ 
  aiMode, 
  faceDetected, 
  confidence,
  multiplayerStatus,
  onToggleFullScreen
}) => {
  const [telemetry, setTelemetry] = useState<string[]>([]);
  const [jitterConfidence, setJitterConfidence] = useState(0);

  // Neural Jitter Effect (Simulation of high-frequency targeting logic)
  useEffect(() => {
    if (!aiMode) {
      setJitterConfidence(0);
      return;
    }

    const interval = setInterval(() => {
      // Base confidence from AI, or 0.6 if searching
      const base = faceDetected ? confidence : 0.6;
      // Add random fluctuation between 0 and 0.15, clamped to > 50%
      const jitter = Math.max(0.51, base + (Math.random() * 0.15 - 0.05));
      setJitterConfidence(jitter);
    }, 150);

    return () => clearInterval(interval);
  }, [aiMode, faceDetected, confidence]);

  useEffect(() => {
    const defaultLogs = [
      'OPTIMIZING OPTIC ARRAY...',
      'SYNCING BIOMETRICS...',
      'NEURAL LINK STABLE',
      'VOXEL MAPPING ENABLED',
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      let pool = [...defaultLogs];
      if (faceDetected && aiMode) {
        pool = [...pool, 'TARGET ACQUIRED', 'ANALYZING MESH...', 'LOCKED'];
      }
      if (multiplayerStatus !== 'OFFLINE') {
        pool = [...pool, `SIGNAL: ${multiplayerStatus}`, 'P2P_HANDSHAKE_INIT'];
      }
      
      setTelemetry((prev) => [...prev, pool[i % pool.length]].slice(-4));
      i++;
    }, 1500);

    return () => clearInterval(interval);
  }, [faceDetected, aiMode, multiplayerStatus]);

  return (
    <div className="neural-panel">
      <div className="telemetry-grid">
        <div className="status-item">
          <span className="label">SYSTEM STATUS:</span>
          <span className="value t-ok">OPTIMAL</span>
        </div>
        
        <div className="status-item">
          <span className="label">SIGNAL LINK:</span>
          <span className={`value ${multiplayerStatus === 'CONNECTED' ? 't-ok' : ''}`} style={{ color: multiplayerStatus === 'OFFLINE' ? 'var(--text-ghost)' : 'var(--neon-primary)' }}>
            {multiplayerStatus}
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

        {/* ── TARGET LOCK BAR ── */}
        <div className="status-item confidence-box">
          <span className="label">TARGET LOCK:</span>
          <div className="confidence-track">
            <div 
              className="confidence-fill" 
              style={{ 
                width: `${aiMode ? (jitterConfidence * 100) : 0}%`,
                opacity: aiMode ? 1 : 0.2 
              }}
            ></div>
          </div>
          <span className="confidence-text" style={{ color: aiMode ? 'var(--neon-primary)' : 'var(--text-disabled)' }}>
            {aiMode ? `${(jitterConfidence * 100).toFixed(0)}%` : 'OFFLINE'}
          </span>
        </div>
      </div>
    
      <div className="panel-right">
        <div className="telemetry-logs">
          {telemetry.map((log, idx) => (
            <div key={idx} className="log-line anim-typing">{log}</div>
          ))}
        </div>

        <button 
          className="btn btn-ghost btn-compact fs-btn"
          onClick={onToggleFullScreen}
          title="Toggle Fullscreen [F11]"
        >
          <span className="fs-icon">⛶</span>
        </button>
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

        .panel-right {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          min-width: 300px;
          justify-content: flex-end;
        }

        .telemetry-logs {
          font-family: var(--font-terminal);
          font-size: 10px;
          color: var(--text-ghost);
          text-align: right;
        }

        .log-line {
          height: 14px;
        }

        .fs-btn {
          min-width: 40px !important;
          padding: 8px !important;
          border-style: dashed !important;
          font-size: 14px !important;
        }

        .fs-icon {
          display: inline-block;
          transform: scale(1.2);
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
