import React from 'react';

interface CyberLoaderProps {
  progress: number;
  status: string;
}

export const CyberLoader: React.FC<CyberLoaderProps> = ({ progress, status }) => {
  return (
    <div className="cyber-loader">
      <div className="loader-grid"></div>
      <div className="loader-glitch"></div>
      
      <div className="loader-content">
        <div className="loader-header">
          <div className="loader-title">SYSTEM_INITIALIZING</div>
          <div className="loader-percent">{Math.round(progress)}%</div>
        </div>

        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="loader-status">
          <span className="blink-target">&gt;&gt;</span> {status.toUpperCase()}
        </div>
      </div>

      <style>{`
        .cyber-loader {
          /* Add unique styles if needed, but most are in index.css */
          letter-spacing: 0.1em;
        }
      `}</style>
    </div>
  );
};
