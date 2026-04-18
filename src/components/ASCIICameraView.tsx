import React, { useRef, useEffect, useState } from 'react';
import { CameraModule } from '../modules/CameraModule';
import { ASCIIEngine } from '../modules/ASCIIEngine';
import { AIEngine } from '../modules/AIEngine';
import type { FaceBox } from '../modules/AIEngine';

interface ASCIICameraViewProps {
  options: {
    fontSize: number;
    gain: number;
    contrast: number;
    charset: string;
    mode: string;
    aiMode: boolean;
  };
  onFaceDetect: (detected: boolean) => void;
}

export const ASCIICameraView: React.FC<ASCIICameraViewProps> = ({ options, onFaceDetect }) => {
  const preRef = useRef<HTMLPreElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Instance Refs (Stable)
  const cameraRef = useRef<CameraModule>(new CameraModule());
  const asciiRef = useRef<ASCIIEngine>(new ASCIIEngine());
  const aiRef = useRef<AIEngine>(new AIEngine());
  const latestFaceBox = useRef<FaceBox | null>(null);

  // Options Ref (to avoid loop dependency)
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    let animationId: number;
    let detectionId: any;
    let isMounted = true;

    const initializeSystem = async () => {
      try {
        const video = await cameraRef.current.initialize(640, 480);
        if (!isMounted) return;

        // One-time AI init
        await aiRef.current.initialize();

        // Continuous Detection Loop
        const runDetection = async () => {
          if (!isMounted) return;
          
          if (optionsRef.current.aiMode) {
            const box = await aiRef.current.detect(video);
            latestFaceBox.current = box;
            onFaceDetect(!!box);
          } else {
            latestFaceBox.current = null;
            onFaceDetect(false);
          }
          detectionId = setTimeout(runDetection, 120);
        };
        runDetection();

        // High-speed Render Loop
        const render = () => {
          if (!isMounted) return;
          
          if (preRef.current) {
            const { fontSize, charset, gain, contrast } = optionsRef.current;
            
            // Recalculate grid based on current font size
            const scale = 16 / fontSize;
            const width = Math.floor(80 * scale);
            const height = Math.floor(40 * scale);

            const ascii = asciiRef.current.process(video, {
              width,
              height,
              chars: charset,
              gain,
              contrast,
              faceBox: latestFaceBox.current
            });
            preRef.current.textContent = ascii;
          }
          animationId = requestAnimationFrame(render);
        };
        render();

      } catch (err) {
        if (isMounted) {
          setError('CAMERA ACCESS DENIED');
          console.error(err);
        }
      }
    };

    initializeSystem();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationId);
      clearTimeout(detectionId);
      cameraRef.current.stop();
    };
  }, [onFaceDetect]); // Only depend on callback, camera stays open

  if (error) {
    return (
      <div className="error-panel">
        <div className="glitch-text" data-text={error}>{error}</div>
        <p>Biometric interface failure. check hardware link.</p>
      </div>
    );
  }

  return (
    <div className="ascii-viewport">
      {/* ── TACTICAL HUD OVERLAY ── */}
      <div className="hud-overlay">
        <div className="hud-corner top-left"></div>
        <div className="hud-corner top-right"></div>
        <div className="hud-corner bottom-left"></div>
        <div className="hud-corner bottom-right"></div>
        
        <div className="hud-header">
          <div className="hud-tag">ID: {options.mode}-RENDER</div>
          <div className="hud-status">
            <span className="blink-target">●</span>
            {options.aiMode ? (latestFaceBox.current ? 'TARGET ACQUIRED' : 'SCANNING...') : 'SIGNAL ACTIVE'}
          </div>
        </div>

        <div className="hud-footer">
          <div className="hud-metrics">
            <span>RES: {Math.floor(80 * (16 / options.fontSize))}x{Math.floor(40 * (16 / options.fontSize))}</span>
            <span>GA: {options.gain.toFixed(1)}</span>
          </div>
          <div className="hud-branding">CYBERASCII VISION PRO</div>
        </div>
      </div>

      <pre 
        ref={preRef} 
        style={{ fontSize: `${options.fontSize}px` }} 
        className={`ascii-render ${options.mode}`}
      ></pre>
      <div className="scanline"></div>
      <div className="vignette"></div>
    </div>
  );
};
