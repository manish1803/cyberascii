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
}

export class AIEngine {
  private detector: faceLandmarksDetection.FaceLandmarksDetector | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize TFJS Backend
      await tf.setBackend('webgl').catch(() => tf.setBackend('cpu'));
      await tf.ready();

      // Load the MediaPipe Face Mesh model
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshTfjsModelConfig = {
        runtime: 'tfjs',
        refineLandmarks: false, // Optimized for speed
        maxFaces: 1
      };

      this.detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
      this.isInitialized = true;
      console.log('AI Engine: Face Mesh Detector Initialized');
    } catch (error) {
      console.error('AI Engine Initialization Failed:', error);
      throw error;
    }
  }

  async detect(video: HTMLVideoElement): Promise<FaceData | null> {
    if (!this.detector) return null;

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
          landmarks: (face as any).keypoints || []
        };
      }
    } catch (error) {
      console.error('Face Mesh detection error:', error);
    }
    return null;
  }
}
