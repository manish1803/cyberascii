import React, { useRef, useEffect } from 'react';
import { ASCIIEngine } from '../modules/ASCIIEngine';
import { AIEngine } from '../modules/AIEngine';

interface ASCIICameraViewProps {
  options: {
    fontSize: number;
    gain: number;
    contrast: number;
    charset: string;
    mode: string;
    aiMode: boolean;
  };
  onAIUpdate: (data: { detected: boolean; confidence: number }) => void;
  videoElement: HTMLVideoElement | null;
  aiEngine: AIEngine;
}

export const ASCIICameraView: React.FC<ASCIICameraViewProps> = ({ options, onAIUpdate, videoElement, aiEngine }) => {
  const preRef = useRef<HTMLPreElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Instance Refs
  const asciiRef = useRef<ASCIIEngine>(new ASCIIEngine());
  
  const latestFaceBox = useRef<any>(null);

  // Options Ref
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!videoElement) return;

    let animationId: number;
    let detectionId: any;
    let isMounted = true;

    const runDetection = async () => {
      if (!isMounted) return;
      
      const { aiMode } = optionsRef.current;
      
      // Only attempt detection if enabled
      if (aiMode) {
        try {
          const data = await aiEngine.detect(videoElement);
          if (data && data.box) {
            latestFaceBox.current = data.box;
            onAIUpdate({ 
              detected: true, 
              confidence: 0.9 // Simplified without emotion classification
            });
          } else {
            latestFaceBox.current = null;
            onAIUpdate({ detected: false, confidence: 0 });
          }
        } catch (err) {
          console.error('Detection Loop Error:', err);
        }
      } else {
        latestFaceBox.current = null;
        onAIUpdate({ detected: false, confidence: 0 });
      }

      // Schedule next detection
      detectionId = setTimeout(runDetection, 50); 
    };
    
    runDetection();

    const render = () => {
      if (!isMounted) return;
      
      const { fontSize, charset, gain, contrast, aiMode } = optionsRef.current;
      
      if (preRef.current) {
        const scale = 16 / fontSize;
        const width = Math.floor(80 * scale);
        const height = Math.floor(40 * scale);

        const ascii = asciiRef.current.process(videoElement, {
          width,
          height,
          chars: charset,
          gain,
          contrast,
          faceBox: aiMode ? latestFaceBox.current : null
        });
        preRef.current.textContent = ascii;
      }

      if (overlayCanvasRef.current) {
        const canvas = overlayCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const rect = canvas.getBoundingClientRect();
          canvas.width = rect.width;
          canvas.height = rect.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (aiMode && latestFaceBox.current && videoElement.videoWidth > 0) {
            const box = latestFaceBox.current;
            const vW = videoElement.videoWidth;
            const vH = videoElement.videoHeight;
            
            const x = (box.x / vW) * canvas.width;
            const y = (box.y / vH) * canvas.height;
            const w = (box.width / vW) * canvas.width;
            const h = (box.height / vH) * canvas.height;

            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, w, h);
            ctx.clip();
            ctx.filter = 'contrast(1.2) brightness(1.1) sepia(0.3) hue-rotate(80deg)';
            ctx.drawImage(videoElement, box.x, box.y, box.width, box.height, x, y, w, h);
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = '#000';
            for (let i = 0; i < h; i += 2) {
              ctx.fillRect(x, y + i, w, 1);
            }
            ctx.restore();

            const color = '#00ff41';
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            const pad = 10;
            const bl = 20;
            
            ctx.beginPath(); ctx.moveTo(x - pad, y - pad + bl); ctx.lineTo(x - pad, y - pad); ctx.lineTo(x - pad + bl, y - pad); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + w + pad - bl, y - pad); ctx.lineTo(x + w + pad, y - pad); ctx.lineTo(x + w + pad, y - pad + bl); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x - pad, y + h + pad - bl); ctx.lineTo(x - pad, y + h + pad); ctx.lineTo(x - pad + bl, y + h + pad); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + w + pad - bl, y + h + pad); ctx.lineTo(x + w + pad, y + h + pad); ctx.lineTo(x + w + pad, y + h + pad - bl); ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.fillStyle = color;
            ctx.font = 'bold 10px Rajdhani, monospace';
            ctx.fillText(`ID: ${optionsRef.current.mode}-SCANNER`, x - pad, y - pad - 15);
            ctx.fillText(`MODE: BIOMETRIC_LOCKED`, x - pad, y - pad - 5);
          }
        }
      }
      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationId);
      clearTimeout(detectionId);
    };
  }, [videoElement, aiEngine, onAIUpdate]);

  const getHudStatusText = () => {
    const { aiMode } = options;
    const isDetected = !!latestFaceBox.current;

    if (!aiMode) return 'SIGNAL ACTIVE';
    
    if (isDetected) {
      return 'TARGET ACQUIRED';
    }
    return 'SCANNING...';
  };

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
        className={`ascii-render ${options.mode}`}
      ></pre>
      <div className="scanline"></div>
      <div className="vignette"></div>
    </div>
  );
};
