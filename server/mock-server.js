const express = require('express');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const port = 5001;

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3001', // Allow only our React app
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Enable CORS with options
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());

// Mock responses
const mockResponses = {
  trashnet: {
    category: 'plastic',
    confidence: 0.92,
    predictions: {
      'plastic': 0.92,
      'metal': 0.05,
      'glass': 0.03
    }
  },
  taco: {
    category: 'plastic_bottle',
    subcategory: 'PET',
    confidence: 0.88,
    disposalRecommendation: 'Recycle in plastic container',
    locationBasedSuggestion: 'Nearest recycling center: 123 Green St'
  },
  wastenet: {
    category: 'plastic',
    materialType: 'PET',
    recyclability: 'recyclable',
    confidenceScore: 0.95,
    alternativeMaterials: [
      { type: 'HDPE', confidence: 0.15 },
      { type: 'PVC', confidence: 0.05 }
    ]
  }
};

// TrashNet endpoints
app.post('/mock/trashnet/analyze', upload.single('image'), (req, res) => {
  console.log('TrashNet analyze request received');
  res.json(mockResponses.trashnet);
});

app.get('/mock/trashnet/categories', (req, res) => {
  console.log('TrashNet categories request received');
  res.json({
    categories: ['glass', 'paper', 'cardboard', 'plastic', 'metal', 'trash']
  });
});

// TACO endpoints
app.post('/mock/taco/analyze', upload.single('image'), (req, res) => {
  console.log('TACO analyze request received');
  res.json(mockResponses.taco);
});

app.get('/mock/taco/categories', (req, res) => {
  console.log('TACO categories request received');
  res.json({
    categories: ['plastic_bottle', 'glass_bottle', 'paper', 'cardboard', 'metal_can', 'food_waste']
  });
});

// WasteNet endpoints
app.post('/mock/wastenet/analyze', upload.single('image'), (req, res) => {
  console.log('WasteNet analyze request received');
  res.json(mockResponses.wastenet);
});

app.get('/mock/wastenet/categories', (req, res) => {
  console.log('WasteNet categories request received');
  res.json({
    categories: ['plastic', 'glass', 'paper', 'metal', 'organic', 'electronic']
  });
});

app.get('/mock/wastenet/metrics', (req, res) => {
  res.json({
    accuracy: 0.92,
    precision: 0.89,
    recall: 0.90,
    f1Score: 0.895,
    lastUpdated: new Date(),
    totalPredictions: 15000
  });
});

app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
  console.log('CORS enabled for http://localhost:3001');
});
