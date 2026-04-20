import { useState, useCallback, useEffect, useRef } from 'react';
import { NeuralPanel } from './components/NeuralPanel';
import { ASCIICameraView } from './components/ASCIICameraView';
import { ControlPanel } from './components/ControlPanel';
import { CyberLoader } from './components/CyberLoader';
import { AIEngine } from './modules/AIEngine';
import { CameraModule } from './modules/CameraModule';

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStatus, setLoadStatus] = useState('Initializing Systems...');

  const [options, setOptions] = useState({
    fontSize: 10,
    gain: 1.0,
    contrast: 1.0,
    charset: ' .:-=+*#%@',
    mode: 'Matrix',
    aiMode: false,
  });

  const [aiData, setAIData] = useState({
    detected: false,
    confidence: 0
  });

  // Shared instances
  const aiRef = useRef<AIEngine>(new AIEngine());
  const cameraRef = useRef<CameraModule>(new CameraModule());
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSystems = async () => {
      try {
        // 1. Load AI Engine (0-60%)
        await aiRef.current.initialize((step, p) => {
          if (isMounted) {
            setLoadStatus(step);
            setLoadProgress(p * 0.6); // Scale to 60%
          }
        });

        // 2. Load Camera (60-100%)
        const video = await cameraRef.current.initialize(640, 480, (step, p) => {
          if (isMounted) {
            setLoadStatus(step);
            setLoadProgress(60 + p * 0.4); // Scale to 40% (total 100%)
          }
        });

        if (isMounted) {
          setVideoElement(video);
          setTimeout(() => {
            setIsLoaded(true);
          }, 500); // Small delay for aesthetic transition
        }
      } catch (err) {
        console.error('System Load Failed:', err);
        setLoadStatus('SYSTEM CRITICAL ERROR');
      }
    };

    loadSystems();
    return () => { isMounted = false; };
  }, []);

  const handleAIUpdate = useCallback((data: any) => {
    setAIData(data);
  }, []);

  if (!isLoaded) {
    return <CyberLoader progress={loadProgress} status={loadStatus} />;
  }

  return (
    <div className="app-container">
      <NeuralPanel 
        aiMode={options.aiMode} 
        faceDetected={aiData.detected} 
        confidence={aiData.confidence}
      />
      
      <main className="content">
        <ASCIICameraView 
          options={options} 
          onAIUpdate={handleAIUpdate}
          videoElement={videoElement}
          aiEngine={aiRef.current}
        />
      </main>

      <ControlPanel options={options} setOptions={setOptions} />

      <style>{`
        .app-container {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          overflow: hidden;
          animation: app-entry 0.8s ease-out;
        }
        @keyframes app-entry {
          from { opacity: 0; filter: blur(10px) brightness(2); }
          to { opacity: 1; filter: blur(0) brightness(1); }
        }
        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--void);
          position: relative;
          min-height: 0; 
        }
      `}</style>
    </div>
  );
}

export default App;
