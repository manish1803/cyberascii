import React from 'react';

interface ControlPanelProps {
  options: {
    fontSize: number;
    gain: number;
    contrast: number;
    charset: string;
    mode: string;
  };
  setOptions: React.Dispatch<React.SetStateAction<any>>;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ options, setOptions }) => {
  const charsets = {
    Classic: ' .:-=+*#%@',
    Matrix: ' 01',
    Blocks: ' ░▒▓█',
    Minimal: ' .:',
  };

  const modes = ['Matrix', 'BW', 'Retro', 'Color'];

  const handleChange = (key: string, value: any) => {
    setOptions((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="control-panel">
      <div className="control-group">
        <label className="cyber-input-label">FONT SIZE: {options.fontSize}px</label>
        <input 
          type="range" min="4" max="24" step="1" 
          value={options.fontSize} 
          onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
          className="cyber-range"
        />
      </div>

      <div className="control-group">
        <label className="cyber-input-label">GAIN: {options.gain.toFixed(1)}</label>
        <input 
          type="range" min="0.1" max="5.0" step="0.1" 
          value={options.gain} 
          onChange={(e) => handleChange('gain', parseFloat(e.target.value))}
          className="cyber-range"
        />
      </div>

      <div className="control-group">
        <label className="cyber-input-label">CHARSET</label>
        <div className="btn-row">
          {Object.entries(charsets).map(([name, set]) => (
            <button 
              key={name}
              className={`btn ${options.charset === set ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleChange('charset', set)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <label className="cyber-input-label">RENDER MODE</label>
        <div className="btn-row">
          {modes.map((m) => (
            <button 
              key={m}
              className={`btn ${options.mode === m ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleChange('mode', m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .control-panel {
          background: var(--surface);
          border-top: var(--border-dim);
          padding: var(--space-5);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-6);
        }
        .control-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .cyber-range {
          -webkit-appearance: none;
          width: 100%;
          background: var(--green-900);
          height: 4px;
          outline: none;
          border: 1px solid var(--green-700);
        }
        .cyber-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: var(--neon-primary);
          cursor: pointer;
          box-shadow: var(--glow-sm);
        }
        .btn-row {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .btn {
          font-size: 10px;
          padding: 6px 12px;
        }
      `}</style>
    </div>
  );
};
