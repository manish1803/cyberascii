import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceData {
  box: FaceBox;
  landmarks: any[];
  score: number;
}

export class AIEngine {
  private detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;
  private _isInitialized = false;

  get isInitialized() {
    return this._isInitialized;
  }

  async initialize(onProgress?: (step: string, progress: number) => void) {
    if (this.isInitialized) return;

    try {
      onProgress?.('INITIALIZING NEURAL BACKEND', 10);
      // Initialize TFJS Backend
      await tf.setBackend('webgl').catch(() => tf.setBackend('cpu'));
      await tf.ready();

      onProgress?.('LOADING FACE MESH MODELS', 30);
      // Load the MediaPipe Face Mesh model
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshTfjsModelConfig = {
        runtime: 'tfjs',
        refineLandmarks: false, // Precision no longer needed without emotion
        maxFaces: 1
      };

      this.detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      
      onProgress?.('CALIBRATING NEURAL ENGINE', 80);
      try {
        // Warmup the model with a dummy tensor (rank 3) to prevent first-detection lag
        const dummyTensor = tf.zeros([480, 640, 3]);
        await this.detector.estimateFaces(dummyTensor as any);
        tf.dispose(dummyTensor);
      } catch (warmupErr) {
        console.warn('AI Engine Warmup skipped:', warmupErr);
      }

      this._isInitialized = true;
      onProgress?.('NEURAL ENGINE READY', 100);
      console.log('AI Engine: Face Mesh Detector Initialized & Warmed Up');
    } catch (error) {
      console.error('AI Engine Initialization Failed:', error);
      throw error;
    }
  }

  async detect(video: HTMLVideoElement | HTMLCanvasElement): Promise<FaceData | null> {
    if (!this.detector || !this._isInitialized) return null;

    try {
      const estimationConfig = { flipHorizontal: false };
      const faces = await this.detector.estimateFaces(video, estimationConfig);

      if (faces && faces.length > 0) {
        const face = faces[0];
        const box = face.box as any;
        
        // Standardize different possible property names from MP/TFJS
        const x = box.xMin !== undefined ? box.xMin : (box.x ?? 0);
        const y = box.yMin !== undefined ? box.yMin : (box.y ?? 0);
        const width = box.width !== undefined ? box.width : ((box.xMax - box.xMin) || 0);
        const height = box.height !== undefined ? box.height : ((box.yMax - box.yMin) || 0);

        // Skip invalid/tiny boxes
        if (width < 20 || height < 20) return null;

        return {
          box: { x, y, width, height },
          landmarks: (face as any).keypoints || [],
          score: (face as any).score || face.box.score || 0.9 // Fallback to 0.9 if model doesn't provide it
        };
      }
    } catch (error) {
      console.error('Face Mesh detection error:', error);
    }
    return null;
  }
}
