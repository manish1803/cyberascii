import React, { useRef, useEffect, useState } from 'react';
import { CameraModule } from '../modules/CameraModule';
import { ASCIIEngine } from '../modules/ASCIIEngine';

interface ASCIICameraViewProps {
  options: {
    fontSize: number;
    gain: number;
    contrast: number;
    charset: string;
    mode: string;
  };
}

export const ASCIICameraView: React.FC<ASCIICameraViewProps> = ({ options }) => {
  const preRef = useRef<HTMLPreElement>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<CameraModule>(new CameraModule());
  const asciiRef = useRef<ASCIIEngine>(new ASCIIEngine());

  useEffect(() => {
    let animationId: number;
    
    const startCamera = async () => {
      try {
        // Higher density for smaller font sizes, lower for larger
        const scale = 16 / options.fontSize;
        const width = Math.floor(80 * scale);
        const height = Math.floor(40 * scale);

        const video = await cameraRef.current.initialize(640, 480);
        
        const render = () => {
          if (preRef.current) {
            const ascii = asciiRef.current.process(video, {
              width,
              height,
              chars: options.charset,
              gain: options.gain,
              contrast: options.contrast
            });
            preRef.current.textContent = ascii;
          }
          animationId = requestAnimationFrame(render);
        };
        
        render();
      } catch (err) {
        setError('CAMERA ACCESS DENIED');
        console.error(err);
      }
    };

    startCamera();

    return () => {
      cancelAnimationFrame(animationId);
      cameraRef.current.stop();
    };
  }, [options]);

  return (
    <div className="ascii-viewport">
      <div className="corner tl"></div>
      <div className="corner tr"></div>
      <div className="corner bl"></div>
      <div className="corner br"></div>
      <div className="scanline"></div>
      
      {error ? (
        <div className="error-display anim-glitch">{error}</div>
      ) : (
        <pre ref={preRef} style={{ fontSize: `${options.fontSize}px` }} className={`ascii-render ${options.mode}`}></pre>
      )}

      <style>{`
        .ascii-viewport {
          flex: 1;
          background: var(--abyss);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border-left: var(--border-dim);
          border-right: var(--border-dim);
          margin: var(--space-4) auto;
          width: 95%;
          max-width: 1000px;
          min-height: 400px;
          box-shadow: inset 0 0 50px rgba(0,255,65,0.05);
        }
        .ascii-render {
          font-family: var(--font-terminal);
          line-height: 0.8;
          white-space: pre;
          text-align: center;
          color: var(--neon-primary);
          text-shadow: var(--glow-sm);
        }
        .ascii-render.Matrix { color: var(--neon-primary); }
        .ascii-render.BW { color: var(--text-bright); filter: grayscale(1); }
        .ascii-render.Retro { color: var(--warn-amber); text-shadow: 0 0 8px var(--warn-amber); }
        .ascii-render.Color { color: var(--neon-cold); }

        .corner { position: absolute; width: 20px; height: 20px; z-index: 5; }
        .corner.tl { top: -1px; left: -1px; border-top: 2px solid var(--neon-primary); border-left: 2px solid var(--neon-primary); }
        .corner.tr { top: -1px; right: -1px; border-top: 2px solid var(--neon-primary); border-right: 2px solid var(--neon-primary); }
        .corner.bl { bottom: -1px; left: -1px; border-bottom: 2px solid var(--neon-primary); border-left: 2px solid var(--neon-primary); }
        .corner.br { bottom: -1px; right: -1px; border-bottom: 2px solid var(--neon-primary); border-right: 2px solid var(--neon-primary); }

        .scanline {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: rgba(0,255,65,0.2);
          box-shadow: var(--glow-md);
          animation: scan-line 4s linear infinite;
          pointer-events: none;
          z-index: 4;
        }
        .error-display {
          color: var(--danger-red);
          font-family: var(--font-display);
          font-size: 24px;
          letter-spacing: 0.5em;
          text-shadow: 0 0 10px var(--danger-red);
        }
      `}</style>
    </div>
  );
};
