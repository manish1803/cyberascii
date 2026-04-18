import * as blazeface from '@tensorflow-models/blazeface';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';

export interface FaceBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class AIEngine {
  private detector: blazeface.BlazeFaceModel | null = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    // Use WebGL for better performance, but Fallback to CPU if needed
    await tf.setBackend('webgl').catch(() => tf.setBackend('cpu'));
    await tf.ready();

    this.detector = await blazeface.load();
    this.isInitialized = true;
    console.log('AI Engine: BlazeFace Initialized');
  }

  async detect(video: HTMLVideoElement): Promise<FaceBox | null> {
    if (!this.detector) return null;

    try {
      // returnPredictions: true gives us the bounding box
      const returnPredictions = true;
      const predictions = await this.detector.estimateFaces(video, returnPredictions);
      
      if (predictions.length > 0) {
        const prediction = predictions[0] as any;
        // BlazeFace returns [topLeft, bottomRight] or [probability]
        // With returnPredictions: true, it returns objects with topLeft and bottomRight
        const start = prediction.topLeft as [number, number];
        const end = prediction.bottomRight as [number, number];
        
        return {
          x: start[0],
          y: start[1],
          width: end[0] - start[0],
          height: end[1] - start[1]
        };
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }
    return null;
  }
}
