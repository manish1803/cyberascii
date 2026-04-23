import { useState, useCallback, useEffect, useRef } from 'react';
import { NeuralPanel } from './components/NeuralPanel';
import { ASCIICameraView } from './components/ASCIICameraView';
import { ControlPanel } from './components/ControlPanel';
import { CyberLoader } from './components/CyberLoader';
import { AIEngine } from './modules/AIEngine';
import { CameraModule } from './modules/CameraModule';
import { MultiplayerModule } from './modules/MultiplayerModule';
import type { ConnectionStatus } from './modules/MultiplayerModule';

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

  // Multiplayer State
  const [multiplayerStatus, setMultiplayerStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [roomId, setRoomId] = useState<string>('');

  // Shared instances
  const aiRef = useRef<AIEngine | null>(null);
  const cameraRef = useRef<CameraModule | null>(null);
  const multiplayerRef = useRef<MultiplayerModule | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const cameraViewRef = useRef<any>(null);

  // Lazy initialize refs
  if (!aiRef.current) aiRef.current = new AIEngine();
  if (!cameraRef.current) cameraRef.current = new CameraModule();
  if (!multiplayerRef.current) multiplayerRef.current = new MultiplayerModule();

  useEffect(() => {
    let isMounted = true;

    const loadSystems = async () => {
      try {
        // 1. Load AI Engine (0-60%)
        await aiRef.current!.initialize((step, p) => {
          if (isMounted) {
            setLoadStatus(step);
            setLoadProgress(p * 0.6); // Scale to 60%
          }
        });

        // 2. Load Camera (60-100%)
        const video = await cameraRef.current!.initialize(640, 480, (step, p) => {
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
    
    // Check for room ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    if (roomFromUrl) {
      setRoomId(roomFromUrl);
      // We don't auto-join here to avoid camera race conditions, 
      // but the UI will show we are pre-linked to this room.
    }

    // Setup Multiplayer listeners
    multiplayerRef.current!.onStatusChange = (status) => setMultiplayerStatus(status);
    multiplayerRef.current!.onRemoteStream = (stream) => setRemoteStream(stream);

    return () => { isMounted = false; };
  }, []);

  const handleAIUpdate = useCallback((data: any) => {
    setAIData(data);
  }, []);

  const handleMultiplayerAction = useCallback(async (action: 'CREATE' | 'JOIN', id: string) => {
    if (!videoElement?.srcObject) return;
    const stream = videoElement.srcObject as MediaStream;
    await multiplayerRef.current!.initialize(stream, id, action === 'CREATE');
    setRoomId(id);
  }, [videoElement]);

  const handleDisconnect = useCallback(() => {
    multiplayerRef.current!.disconnect();
    setRemoteStream(null);
    setRoomId('');
    setMultiplayerStatus('DISCONNECTED');
  }, []);

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullScreen();
      }
    };

    const handleDblClick = () => {
      toggleFullScreen();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('dblclick', handleDblClick);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('dblclick', handleDblClick);
    };
  }, [toggleFullScreen]);

  const handleCapture = useCallback(() => {
    cameraViewRef.current?.capturePhoto();
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
        multiplayerStatus={multiplayerStatus === 'DISCONNECTED' ? 'OFFLINE' : multiplayerStatus}
        onToggleFullScreen={toggleFullScreen}
      />
      
      <main className="content">
        <ASCIICameraView 
          ref={cameraViewRef}
          options={options} 
          onAIUpdate={handleAIUpdate}
          videoElement={videoElement}
          aiEngine={aiRef.current!}
          remoteStream={remoteStream}
        />
      </main>

      <ControlPanel 
        options={options} 
        setOptions={setOptions} 
        roomId={roomId}
        multiplayerStatus={multiplayerStatus}
        onMultiplayerAction={handleMultiplayerAction}
        onDisconnect={handleDisconnect}
        onToggleFullScreen={toggleFullScreen}
        onCapture={handleCapture}
      />

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
