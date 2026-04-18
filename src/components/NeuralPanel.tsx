import React, { useState, useEffect } from 'react';

interface NeuralPanelProps {
  aiMode: boolean;
  faceDetected: boolean;
}

export const NeuralPanel: React.FC<NeuralPanelProps> = ({ aiMode, faceDetected }) => {
  const [telemetry, setTelemetry] = useState<string[]>([]);

  useEffect(() => {
    const logs = [
      'INITIALIZING SCANNER...',
      'BUFFERING NEURAL LINK...',
      'EYE-TRACKING ACTIVE',
      'VOXEL MAPPING ENABLED',
      'ENCRYPTING STREAM...',
      'SYSTEM: STABLE',
    ];
    let i = 0;
    const interval = setInterval(() => {
      setTelemetry((prev) => [...prev, logs[i % logs.length]].slice(-4));
      i++;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
          <span className="label">FACE DETECTED:</span>
          <span className="value" style={{ color: faceDetected ? 'var(--neon-hot)' : 'var(--text-disabled)' }}>
            {faceDetected ? 'YES' : 'NO'}
          </span>
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
        }
        .telemetry-grid {
          display: flex;
          gap: var(--space-6);
        }
        .status-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .label {
          font-size: 9px;
          color: var(--text-dim);
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
        .telemetry-logs {
          font-family: var(--font-terminal);
          font-size: 10px;
          color: var(--text-ghost);
          min-width: 200px;
          text-align: right;
        }
        .log-line {
          height: 14px;
        }
      `}</style>
    </div>
  );
};
