import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import WasteAnalyzer from '../../components/WasteAnalyzer/WasteAnalyzer';
import { act } from 'react-dom/test-utils';

// Mock the Firebase services
jest.mock('../../services/firebase', () => ({
  storage: {
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn(),
  },
  firestore: {
    collection: jest.fn(),
    addDoc: jest.fn(),
  },
}));

// Mock the ML services
jest.mock('../../services/ml', () => ({
  analyzeImage: jest.fn(),
  getWasteNetPrediction: jest.fn(),
  getTrashNetPrediction: jest.fn(),
  getTacoPrediction: jest.fn(),
}));

describe('WasteAnalyzer Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<WasteAnalyzer />);
    expect(screen.getByText(/Upload Image/i)).toBeInTheDocument();
  });

  it('shows upload button in initial state', () => {
    render(<WasteAnalyzer />);
    const uploadButton = screen.getByRole('button', { name: /upload image/i });
    expect(uploadButton).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    render(<WasteAnalyzer />);
    
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    expect(screen.getByText(/Analyzing/i)).toBeInTheDocument();
  });

  it('calls onAnalysisComplete callback when analysis is done', async () => {
    const mockCallback = jest.fn();
    render(<WasteAnalyzer onAnalysisComplete={mockCallback} />);

    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
    const input = screen.getByTestId('file-input');

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
    });
  });
});
