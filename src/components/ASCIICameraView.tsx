import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
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
  remoteStream: MediaStream | null;
}

export const ASCIICameraView = forwardRef(({ 
  options, 
  onAIUpdate, 
  videoElement, 
  aiEngine,
  remoteStream
}: ASCIICameraViewProps, ref) => {
  const preRef = useRef<HTMLPreElement>(null);
  const remotePreRef = useRef<HTMLPreElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  
  // Instance Refs
  const asciiRef = useRef<ASCIIEngine>(new ASCIIEngine());
  const latestFaceBox = useRef<any>(null);

  // Expose capture logic to parent
  useImperativeHandle(ref, () => ({
    capturePhoto: () => {
      if (!preRef.current) return;
      
      const text = preRef.current.textContent || '';
      const lines = text.split('\n');
      const fontSize = options.fontSize;
      
      // Create snapshot canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Calculate dimensions based on font
      ctx.font = `${fontSize}px "Share Tech Mono", monospace`;
      const charWidth = ctx.measureText('M').width;
      const lineHeight = fontSize;
      
      canvas.width = lines[0].length * charWidth;
      canvas.height = lines.length * lineHeight;
      
      // Background
      ctx.fillStyle = '#000800'; // Void
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw Text
      ctx.font = `${fontSize}px "Share Tech Mono", monospace`;
      ctx.textBaseline = 'top';
      
      // Mode colors
      const colors = {
        Matrix: '#00ff41',
        BW: '#ffffff',
        Retro: '#ff8c00',
        Color: '#00ffff'
      };
      ctx.fillStyle = (colors as any)[options.mode] || colors.Matrix;

      lines.forEach((line, i) => {
        ctx.fillText(line, 0, i * lineHeight);
      });

      // Download
      const link = document.createElement('a');
      link.download = `cyber-ascii-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  }));

  // Options Ref
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Handle Remote Video Setup
  useEffect(() => {
    if (remoteStream) {
      const video = document.createElement('video');
      video.srcObject = remoteStream;
      video.autoplay = true;
      video.muted = true; // Avoid feedback
      remoteVideoRef.current = video;
      return () => {
        video.srcObject = null;
        remoteVideoRef.current = null;
      };
    }
  }, [remoteStream]);

  useEffect(() => {
    if (!videoElement) return;

    let animationId: number;
    let detectionId: any;
    let isMounted = true;

    const runDetection = async () => {
      if (!isMounted) return;
      
      const { aiMode } = optionsRef.current;
      
      if (aiMode) {
        try {
          const data = await aiEngine.detect(videoElement);
          if (data && data.box) {
            latestFaceBox.current = data.box;
            onAIUpdate({ detected: true, confidence: data.score });
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

      detectionId = setTimeout(runDetection, 50); 
    };
    
    runDetection();

    const render = () => {
      if (!isMounted) return;
      
      const { fontSize, charset, gain, contrast, aiMode } = optionsRef.current;
      const aspect = remoteStream ? 1.0 : 2.0; // Narrower if split screen

      // Render Local
      if (preRef.current && preRef.current.parentElement && videoElement.videoWidth > 0) {
        const container = preRef.current.parentElement;
        const widthPx = container.clientWidth;
        const heightPx = container.clientHeight;
        
        const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
        const charWidth = fontSize * 0.55; // Refined for Share Tech Mono
        const charHeight = fontSize;
        const charAspect = charWidth / charHeight;

        // Calculate columns to fit width
        let width = Math.floor(widthPx / charWidth);
        // Calculate rows to maintain video aspect ratio
        let height = Math.floor((width * charAspect) / videoAspect);
        
        // If it's too tall for the container, scale down
        if (height * charHeight > heightPx) {
          height = Math.floor(heightPx / charHeight);
          width = Math.floor((height * videoAspect) / charAspect);
        }

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

      // Render Remote
      if (remotePreRef.current && remotePreRef.current.parentElement && remoteVideoRef.current && remoteVideoRef.current.videoWidth > 0) {
        const container = remotePreRef.current.parentElement;
        const widthPx = container.clientWidth;
        const heightPx = container.clientHeight;
        
        const videoAspect = remoteVideoRef.current.videoWidth / remoteVideoRef.current.videoHeight;
        const charWidth = fontSize * 0.55;
        const charHeight = fontSize;
        const charAspect = charWidth / charHeight;

        let width = Math.floor(widthPx / charWidth);
        let height = Math.floor((width * charAspect) / videoAspect);
        
        if (height * charHeight > heightPx) {
          height = Math.floor(heightPx / charHeight);
          width = Math.floor((height * videoAspect) / charAspect);
        }

        const ascii = asciiRef.current.process(remoteVideoRef.current, {
          width,
          height,
          chars: charset,
          gain,
          contrast,
          faceBox: null
        });
        remotePreRef.current.textContent = ascii;
      }

      // Tactical Overlay (Local only)
      if (overlayCanvasRef.current && !remoteStream) {
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
            ctx.filter = 'contrast(1.2) brightness(1.1) sepia(0.3) hue-rotate(80deg)';
            ctx.drawImage(videoElement, box.x, box.y, box.width, box.height, x, y, w, h);
            ctx.restore();

            const color = '#00ff41';
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            const pad = 10;
            const bl = 20;
            ctx.beginPath(); ctx.moveTo(x - pad, y - pad + bl); ctx.lineTo(x - pad, y - pad); ctx.lineTo(x - pad + bl, y - pad); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + w + pad - bl, y - pad); ctx.lineTo(x + w + pad, y - pad); ctx.lineTo(x + w + pad, y - pad + bl); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x - pad, y + h + pad - bl); ctx.lineTo(x - pad, y + h + pad); ctx.lineTo(x - pad + bl, y + h + pad); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(x + w + pad - bl, y + h + pad); ctx.lineTo(x + w + pad, y + h + pad); ctx.lineTo(x + w + pad, y + h + pad - bl); ctx.stroke();
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
  }, [videoElement, aiEngine, onAIUpdate, remoteStream]);

  const getHudStatusText = () => {
    const { aiMode } = options;
    if (remoteStream) return 'MULTI-STREAM ACTIVE';
    return aiMode && latestFaceBox.current ? 'TARGET ACQUIRED' : 'SIGNAL ACTIVE';
  };

  return (
    <div className={`ascii-viewport ${remoteStream ? 'multiplayer-layout' : ''}`}>
      <div className="hud-overlay">
        <div className="hud-header">
          <div className="hud-tag">ID: {options.mode}-RENDER</div>
          <div className="hud-status">
            <span className="blink-target">●</span>
            {getHudStatusText()}
          </div>
        </div>
      </div>

      {!remoteStream && <canvas id="tactical-scanner" ref={overlayCanvasRef} />}

      <div className="render-container">
        <div className="render-item local">
          <div className="render-label">LOCAL_FEED</div>
          <pre 
            ref={preRef} 
            style={{ fontSize: `${options.fontSize}px` }} 
            className={`ascii-render ${options.mode}`}
          ></pre>
        </div>

        {remoteStream && (
          <div className="render-item remote">
            <div className="render-label">REMOTE_PEER</div>
            <pre 
              ref={remotePreRef} 
              style={{ fontSize: `${options.fontSize}px` }} 
              className={`ascii-render ${options.mode}`}
            ></pre>
          </div>
        )}
      </div>

      <div className="scanline"></div>
      <div className="vignette"></div>
    </div>
  );
});
