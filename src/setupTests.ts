// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import 'whatwg-fetch'; // Add fetch polyfill

// Mock window if it doesn't exist
if (typeof window === 'undefined') {
  global.window = {} as any;
}

// Mock document if it doesn't exist
if (typeof document === 'undefined') {
  global.document = {
    createElement: (tagName: string) => {
      if (tagName === 'video') {
        return {
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          play: jest.fn(),
          pause: jest.fn(),
          load: jest.fn(),
          remove: jest.fn(),
          removeAttribute: jest.fn(),
          playsInline: false,
          muted: false,
          autoplay: false,
          currentTime: 0,
          duration: 2,
          videoWidth: 640,
          videoHeight: 360,
          src: ''
        };
      }
      if (tagName === 'canvas') {
        return {
          getContext: () => ({
            drawImage: jest.fn(),
            scale: jest.fn(),
            translate: jest.fn(),
            fillText: jest.fn(),
            measureText: jest.fn(() => ({ width: 0 })),
            fillRect: jest.fn(),
            clearRect: jest.fn()
          }),
          toDataURL: jest.fn(() => 'data:image/jpeg;base64,mockImageData'),
          width: 640,
          height: 360,
          remove: jest.fn()
        };
      }
      return null;
    }
  } as any;
}

// Mock URL API
if (!window.URL) {
  window.URL = {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
  } as any;
}

// Mock ResizeObserver
if (!global.ResizeObserver) {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Mock Response if it doesn't exist
if (!global.Response) {
  global.Response = class Response {
    ok: boolean;
    status: number;
    statusText: string;
    headers: Headers;
    body: any;

    constructor(body: any, init: any = {}) {
      this.body = body;
      this.ok = init.status ? init.status >= 200 && init.status < 300 : true;
      this.status = init.status || 200;
      this.statusText = init.statusText || 'OK';
      this.headers = new Headers(init.headers);
    }

    json() {
      return Promise.resolve(JSON.parse(this.body));
    }

    text() {
      return Promise.resolve(this.body);
    }
  } as any;
}

// Mock Headers if it doesn't exist
if (!global.Headers) {
  global.Headers = class Headers {
    private headers: Record<string, string> = {};

    constructor(init?: Record<string, string>) {
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this.headers[key.toLowerCase()] = value;
        });
      }
    }

    append(name: string, value: string) {
      this.headers[name.toLowerCase()] = value;
    }

    get(name: string) {
      return this.headers[name.toLowerCase()];
    }
  } as any;
}
