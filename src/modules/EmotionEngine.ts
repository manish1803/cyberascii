export type EmotionType = 'Neutral' | 'Happy' | 'Sad' | 'Angry' | 'Surprised' | 'Alert' | 'Unknown';

export interface EmotionResult {
  type: EmotionType;
  confidence: number;
}

export class EmotionEngine {
  /**
   * Classify emotion based on face landmark coordinates.
   * Expects an array of {x, y, z} objects from face-landmarks-detection.
   */
  classify(landmarks: any[]): EmotionResult {
    if (!landmarks || landmarks.length < 468) {
      return { type: 'Unknown', confidence: 0 };
    }

    // --- Key Point Indices (MediaPipe Face Mesh) ---
    // Upper Lip: 13, Lower Lip: 14
    // Mouth Left: 61, Mouth Right: 291
    // Left Eyebrow Top: 70, Right Eyebrow Top: 300
    // Left Eye Top: 159, Left Eye Bottom: 145
    // Right Eye Top: 386, Right Eye Bottom: 374

    try {
      const getDist = (p1: any, p2: any) => 
        Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

      // 1. Mouth Metrics
      const mouthWidth = getDist(landmarks[61], landmarks[291]);
      const mouthHeight = getDist(landmarks[13], landmarks[14]);
      const mouthRatio = mouthHeight / mouthWidth;

      // 2. Eyebrow Metrics (Distance to eyes)
      const leftEyeDist = getDist(landmarks[70], landmarks[159]);
      const rightEyeDist = getDist(landmarks[300], landmarks[386]);
      const avgEyebrowDist = (leftEyeDist + rightEyeDist) / 2;

      // 3. Eye Metrics
      const leftEyeOpen = getDist(landmarks[159], landmarks[145]);
      const rightEyeOpen = getDist(landmarks[386], landmarks[374]);
      const avgEyeOpen = (leftEyeOpen + rightEyeOpen) / 2;

      // --- Emotion Logic (Heuristics) ---
      
      // Happy: High mouth width, lower mouth height (unless laughing)
      if (mouthRatio > 0.05 && mouthRatio < 0.3 && mouthWidth > 0.45) {
        return { type: 'Happy', confidence: 0.85 };
      }

      // Surprised: High mouth height, high eyebrows
      if (mouthRatio > 0.5 && avgEyebrowDist > 0.1) {
        return { type: 'Surprised', confidence: 0.9 };
      }

      // Angry: Low eye openness, low eyebrow distance (tension)
      if (avgEyebrowDist < 0.04 && avgEyeOpen < 0.015) {
        return { type: 'Angry', confidence: 0.8 };
      }

      // Sad: Lower mouth corners (hard to detect with basic distance, but we can try mouthRatio)
      if (mouthRatio < 0.02 && avgEyebrowDist > 0.05) {
        return { type: 'Sad', confidence: 0.7 };
      }

      // Alert: Eyes wide open
      if (avgEyeOpen > 0.025) {
        return { type: 'Alert', confidence: 0.75 };
      }

      return { type: 'Neutral', confidence: 0.95 };

    } catch (err) {
      console.error('Emotion Classification Error:', err);
      return { type: 'Unknown', confidence: 0 };
    }
  }
}
