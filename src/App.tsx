import { useState, useCallback } from 'react';
import { NeuralPanel } from './components/NeuralPanel';
import { ASCIICameraView } from './components/ASCIICameraView';
import { ControlPanel } from './components/ControlPanel';

function App() {
  const [options, setOptions] = useState({
    fontSize: 10,
    gain: 1.0,
    contrast: 1.0,
    charset: ' .:-=+*#%@',
    mode: 'Matrix',
    aiMode: false,
    emotionScan: false,
  });

  const [aiData, setAIData] = useState({
    detected: false,
    emotion: 'Neutral',
    confidence: 0
  });

  const handleAIUpdate = useCallback((data: any) => {
    setAIData(data);
  }, []);

  return (
    <div className="app-container">
      <NeuralPanel 
        aiMode={options.aiMode} 
        faceDetected={aiData.detected} 
        emotion={aiData.emotion}
        confidence={aiData.confidence}
      />
      
      <main className="content">
        <ASCIICameraView 
          options={options} 
          onAIUpdate={handleAIUpdate}
        />
      </main>

      <ControlPanel options={options} setOptions={setOptions} />

      <style>{`
        .app-container {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          overflow: hidden;
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
