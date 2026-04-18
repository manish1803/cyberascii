import type { FaceBox } from './AIEngine';

export interface ASCIIOptions {
  width: number;
  height: number;
  chars: string;
  gain: number;
  contrast: number;
  faceBox?: FaceBox | null;
}

export class ASCIIEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
  }

  process(video: HTMLVideoElement, options: ASCIIOptions): string {
    const { width, height, chars, gain, contrast, faceBox } = options;
    
    this.canvas.width = width;
    this.canvas.height = height;

    // Draw video frame to hidden canvas
    this.ctx.drawImage(video, 0, 0, width, height);

    // Get pixel data
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    
    // Scale face box to ASCII grid coordinates if it exists
    let faceMinX = -1, faceMaxX = -1, faceMinY = -1, faceMaxY = -1;
    if (faceBox && video.videoWidth > 0 && video.videoHeight > 0) {
      const vWidth = video.videoWidth;
      const vHeight = video.videoHeight;
      faceMinX = (faceBox.x / vWidth) * width;
      faceMaxX = ((faceBox.x + faceBox.width) / vWidth) * width;
      faceMinY = (faceBox.y / vHeight) * height;
      faceMaxY = ((faceBox.y + faceBox.height) / vHeight) * height;
    }

    let ascii = '';

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * 4;
        const r = pixels[offset];
        const g = pixels[offset + 1];
        const b = pixels[offset + 2];

        // determine if this pixel is in the face region
        const isFace = x >= faceMinX && x <= faceMaxX && y >= faceMinY && y <= faceMaxY;

        // Grayscale conversion
        let gray = (0.299 * r + 0.587 * g + 0.114 * b);

        // Apply Gain and Contrast
        gray = ((gray - 128) * contrast + 128) * gain;
        gray = Math.max(0, Math.min(255, gray));

        // Thresholding to prevent sensor noise from filling dark areas with '0'
        if (gray < 25) gray = 0; 

        // Use a different charset or detail level for face vs background
        // If no faceBox is provided, use the full charset for the entire frame
        // Background uses a reduced subset of the *same* charset for consistency
        const bgCharset = chars.substring(0, Math.max(1, Math.floor(chars.length / 3)));
        const activeCharset = (!faceBox || isFace) ? chars : bgCharset;
        
        const charIdx = Math.floor((gray / 256) * activeCharset.length);
        ascii += activeCharset[charIdx];
      }
      ascii += '\n';
    }

    return ascii;
  }
}
