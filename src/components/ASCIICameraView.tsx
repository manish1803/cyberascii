import React, { useRef, useEffect, useState } from 'react';
import { CameraModule } from '../modules/CameraModule';
import { ASCIIEngine } from '../modules/ASCIIEngine';
import { AIEngine } from '../modules/AIEngine';
import { EmotionEngine } from '../modules/EmotionEngine';

interface ASCIICameraViewProps {
  options: {
    fontSize: number;
    gain: number;
    contrast: number;
    charset: string;
    mode: string;
    aiMode: boolean;
    emotionScan: boolean;
  };
  onAIUpdate: (data: { detected: boolean; emotion: any; confidence: number }) => void;
}

export const ASCIICameraView: React.FC<ASCIICameraViewProps> = ({ options, onAIUpdate }) => {
  const preRef = useRef<HTMLPreElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Instance Refs
  const cameraRef = useRef<CameraModule>(new CameraModule());
  const asciiRef = useRef<ASCIIEngine>(new ASCIIEngine());
  const aiRef = useRef<AIEngine>(new AIEngine());
  const emotionRef = useRef<EmotionEngine>(new EmotionEngine());
  
  const latestFaceBox = useRef<any>(null);
  const latestEmotion = useRef<any>({ type: 'Neutral', confidence: 0 });

  // Options Ref
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

        await aiRef.current.initialize();

        const runDetection = async () => {
          if (!isMounted) return;
          
          if (optionsRef.current.aiMode || optionsRef.current.emotionScan) {
            const data = await aiRef.current.detect(video);
            if (data && data.box) {
              latestFaceBox.current = data.box;
              const result = emotionRef.current.classify(data.landmarks);
              latestEmotion.current = result;
              onAIUpdate({ 
                detected: true, 
                emotion: result.type, 
                confidence: result.confidence 
              });
            } else {
              latestFaceBox.current = null;
              onAIUpdate({ detected: false, emotion: 'Neutral', confidence: 0 });
            }
          } else {
            latestFaceBox.current = null;
            onAIUpdate({ detected: false, emotion: 'Neutral', confidence: 0 });
          }
          detectionId = setTimeout(runDetection, 60);
        };
        runDetection();

        const render = () => {
          if (!isMounted) return;
          
          const { fontSize, charset, gain, contrast, aiMode, emotionScan } = optionsRef.current;
          
          // ── ASCII RENDER ──
          if (preRef.current) {
            const scale = 16 / fontSize;
            const width = Math.floor(80 * scale);
            const height = Math.floor(40 * scale);

            const ascii = asciiRef.current.process(video, {
              width,
              height,
              chars: charset,
              gain,
              contrast,
              // If emotionScan is on, we don't necessarily need to crop the ASCII face anymore 
              // as we overlay the real video, but keeping it optional:
              faceBox: aiMode ? latestFaceBox.current : null
            });
            preRef.current.textContent = ascii;
          }

          // ── TACTICAL OVERLAY RENDER ──
          if (overlayCanvasRef.current) {
            const canvas = overlayCanvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const rect = canvas.getBoundingClientRect();
              canvas.width = rect.width;
              canvas.height = rect.height;
              ctx.clearRect(0, 0, canvas.width, canvas.height);

              if (emotionScan && latestFaceBox.current && video.videoWidth > 0) {
                const box = latestFaceBox.current;
                const vW = video.videoWidth;
                const vH = video.videoHeight;
                
                // Map video coordinates to screen coordinates
                const x = (box.x / vW) * canvas.width;
                const y = (box.y / vH) * canvas.height;
                const w = (box.width / vW) * canvas.width;
                const h = (box.height / vH) * canvas.height;

                // 1. Draw "Real Face" excerpt
                ctx.save();
                ctx.beginPath();
                ctx.rect(x, y, w, h);
                ctx.clip();
                
                // Apply subtle cyber tint
                ctx.filter = 'contrast(1.2) brightness(1.1) sepia(0.3) hue-rotate(80deg)';
                ctx.drawImage(video, box.x, box.y, box.width, box.height, x, y, w, h);
                
                // Overlay scanlines on the face crop
                ctx.globalAlpha = 0.2;
                ctx.fillStyle = '#000';
                for (let i = 0; i < h; i += 2) {
                  ctx.fillRect(x, y + i, w, 1);
                }
                ctx.restore();

                // 2. Draw Tactical Brackets
                const emotion = latestEmotion.current.type;
                const colors: any = {
                  'Happy': '#39FF14',
                  'Sad': '#5070ff',
                  'Angry': '#ff0041',
                  'Surprised': '#00f3ff',
                  'Alert': '#ffaa00',
                  'Neutral': '#00ff41'
                };
                const color = colors[emotion] || '#00ff41';
                
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.shadowBlur = 10;
                ctx.shadowColor = color;

                const pad = 10;
                const bl = 20; // bracket length
                
                // Draw corners
                // TL
                ctx.beginPath(); ctx.moveTo(x - pad, y - pad + bl); ctx.lineTo(x - pad, y - pad); ctx.lineTo(x - pad + bl, y - pad); ctx.stroke();
                // TR
                ctx.beginPath(); ctx.moveTo(x + w + pad - bl, y - pad); ctx.lineTo(x + w + pad, y - pad); ctx.lineTo(x + w + pad, y - pad + bl); ctx.stroke();
                // BL
                ctx.beginPath(); ctx.moveTo(x - pad, y + h + pad - bl); ctx.lineTo(x - pad, y + h + pad); ctx.lineTo(x - pad + bl, y + h + pad); ctx.stroke();
                // BR
                ctx.beginPath(); ctx.moveTo(x + w + pad - bl, y + h + pad); ctx.lineTo(x + w + pad, y + h + pad); ctx.lineTo(x + w + pad, y + h + pad - bl); ctx.stroke();

                // 3. Status Labels
                ctx.shadowBlur = 0;
                ctx.fillStyle = color;
                ctx.font = 'bold 10px Rajdhani, monospace';
                ctx.fillText(`ID: ${optionsRef.current.mode}-SCANNER`, x - pad, y - pad - 15);
                ctx.fillText(`MODE: BIOMETRIC_LOCKED`, x - pad, y - pad - 5);
                
                ctx.font = '900 12px Rajdhani, monospace';
                ctx.fillText(`${emotion.toUpperCase()}`, x + w + pad - 60, y + h + pad + 15);
              }
            }
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
  }, [onAIUpdate]);

  const getHudStatusText = () => {
    const { aiMode, emotionScan } = options;
    const isDetected = !!latestFaceBox.current;

    if (!aiMode && !emotionScan) return 'SIGNAL ACTIVE';
    if (isDetected) {
      if (emotionScan) return `TARGET: ${latestEmotion.current.type.toUpperCase()}`;
      return 'TARGET ACQUIRED';
    }
    return 'SCANNING...';
  };

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
      <div className="hud-overlay">
        <div className="hud-corner top-left"></div>
        <div className="hud-corner top-right"></div>
        <div className="hud-corner bottom-left"></div>
        <div className="hud-corner bottom-right"></div>
        
        <div className="hud-header">
          <div className="hud-tag">ID: {options.mode}-RENDER</div>
          <div className="hud-status">
            <span className="blink-target">●</span>
            {getHudStatusText()}
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

      <canvas id="tactical-scanner" ref={overlayCanvasRef} />

      <pre 
        ref={preRef} 
        style={{ fontSize: `${options.fontSize}px` }} 
        className={`ascii-render ${options.mode} ${options.emotionScan && latestFaceBox.current ? `emotion-${latestEmotion.current.type}` : ''}`}
      ></pre>
      <div className="scanline"></div>
      <div className="vignette"></div>
    </div>
  );
};
