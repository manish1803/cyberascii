import React from 'react';

interface ControlPanelProps {
  options: {
    fontSize: number;
    gain: number;
    contrast: number;
    charset: string;
    mode: string;
    aiMode: boolean;
  };
  setOptions: React.Dispatch<React.SetStateAction<{
    fontSize: number;
    gain: number;
    contrast: number;
    charset: string;
    mode: string;
    aiMode: boolean;
  }>>;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ options, setOptions }) => {
  const charsets = {
    Classic: ' .:-=+*#%@',
    Matrix: ' 01',
    HighDetail: ' .`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczMW&8%B@$',
    Blocks: '░▒▓█',
    Minimal: ' .:',
  };

  const modes = ['Matrix', 'BW', 'Retro', 'Color'];

  const handleChange = (key: string, value: string | number | boolean) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="control-dock">
      {/* ── OPTICS MODULE ── */}
      <div className="dock-section">
        <div className="section-header">PRIMARY OPTICS</div>
        <div className="control-group">
          <label className="cyber-input-label">ZOOM/SIZE: {options.fontSize}px</label>
          <input 
            type="range" min="4" max="24" step="1" 
            value={options.fontSize} 
            onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
            className="cyber-range"
          />
        </div>
        <div className="control-group">
          <label className="cyber-input-label">GAIN BOOST: {options.gain.toFixed(1)}</label>
          <input 
            type="range" min="0.1" max="5.0" step="0.1" 
            value={options.gain} 
            onChange={(e) => handleChange('gain', parseFloat(e.target.value))}
            className="cyber-range"
          />
        </div>
      </div>

      <div className="dock-divider"></div>

      {/* ── NEURAL MODULE ── */}
      <div className="dock-section">
        <div className="section-header">NEURAL MAPPING</div>
        <div className="btn-stack">
          <div className="btn-row">
            {Object.entries(charsets)
              .filter(([name]) => !options.aiMode || (name === 'Classic' || name === 'HighDetail'))
              .map(([name, set]) => (
              <button 
                key={name}
                className={`btn ${options.charset === set ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handleChange('charset', set)}
              >
                {name}
              </button>
            ))}
          </div>
          
          <div className="btn-row-multi">
            <button 
              className={`btn ai-toggle ${options.aiMode ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => handleChange('aiMode', !options.aiMode)}
            >
              {options.aiMode ? 'AI ACTIVE' : 'AI MODE'}
            </button>
            <button className="btn btn-ghost opacity-40 cursor-not-allowed">
              MULTIPLAYER
            </button>
          </div>
        </div>
      </div>

      <div className="dock-divider"></div>

      {/* ── FILTERS MODULE ── */}
      <div className="dock-section">
        <div className="section-header">OPTIC FILTERS</div>
        <div className="btn-row">
          {modes.map((m) => (
            <button 
              key={m}
              className={`btn btn-compact ${options.mode === m ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleChange('mode', m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .control-dock {
          background: rgba(9, 18, 9, 0.9);
          backdrop-filter: blur(12px);
          border-top: 2px solid var(--neon-primary);
          box-shadow: 0 -10px 30px rgba(0, 255, 65, 0.15);
          padding: 24px 40px 40px 40px;
          display: flex;
          justify-content: space-around;
          align-items: flex-start;
          gap: var(--space-8);
          z-index: 100;
          flex-shrink: 0;
          min-height: fit-content;
        }

        .dock-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          max-width: 500px;
        }

        .section-header {
          font-family: var(--font-display);
          font-size: 10px;
          color: var(--neon-primary);
          font-weight: 900;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          margin-bottom: 8px;
          opacity: 0.8;
        }

        .dock-divider {
          width: 1px;
          height: 100px;
          background: linear-gradient(to bottom, transparent, var(--green-600), transparent);
          opacity: 0.5;
        }

        .control-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .cyber-input-label {
          font-family: var(--font-ui);
          font-size: 11px;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .cyber-range {
          -webkit-appearance: none;
          width: 100%;
          background: var(--green-900);
          height: 2px;
          outline: none;
          cursor: pointer;
        }

        .cyber-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: var(--neon-primary);
          border: 2px solid var(--void);
          clip-path: polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%);
          box-shadow: var(--glow-sm);
        }

        .btn-stack {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .btn-row {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .btn-row-multi {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-2);
          width: 100%;
        }

        .btn {
          min-width: 80px;
          justify-content: center;
          font-size: 9px !important;
          letter-spacing: 0.1em !important;
          padding: 6px 12px !important;
          white-space: nowrap;
        }

        .ai-toggle {
          border-width: 2px !important;
        }

        .btn-danger {
          background: var(--danger-red);
          color: var(--void) !important;
          font-weight: 900;
          border-color: var(--danger-red) !important;
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.4);
        }

        .btn-compact {
          min-width: 70px;
        }

        @media (max-width: 1200px) {
          .btn-row-multi {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 900px) {
          .control-dock {
            flex-direction: column;
            padding: 20px;
            gap: 20px;
          }
          .dock-divider { display: none; }
          .dock-section { max-width: none; width: 100%; }
        }
      `}</style>
    </div>
  );
};
