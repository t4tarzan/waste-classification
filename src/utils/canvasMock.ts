// Mock canvas for environments where the canvas package isn't available
interface CanvasContext {
  drawImage: (image: HTMLVideoElement, x: number, y: number, width: number, height: number) => void;
  getImageData: (x: number, y: number, width: number, height: number) => ImageData;
  putImageData: (imageData: ImageData, x: number, y: number) => void;
  clearRect: (x: number, y: number, width: number, height: number) => void;
}

class CanvasMock {
  width = 640;
  height = 480;

  getContext(contextId: '2d'): CanvasContext | null {
    return {
      drawImage: () => {},
      getImageData: () => new ImageData(1, 1),
      putImageData: () => {},
      clearRect: () => {}
    };
  }

  toDataURL(type?: string): string {
    return '';
  }
}

/**
 * Creates a canvas element, either using the native canvas package if available,
 * or falling back to a mock implementation for environments where canvas isn't supported.
 * 
 * @returns A canvas instance or mock that implements the required canvas interface
 */
export const createCanvas = (): HTMLCanvasElement | CanvasMock => {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // In browser environment, use native canvas
    return document.createElement('canvas');
  }

  // In non-browser environment, return mock
  return new CanvasMock();
};

export default createCanvas;
