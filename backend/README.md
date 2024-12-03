# Waste Classification Backend

This is the backend service for the waste classification application, which uses the TrashNet model to classify waste images into different categories.

## Setup

1. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Download the model:
```bash
python utils/download_model.py
```

4. Start the server:
```bash
python app.py
```

The server will start on port 5001 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/categories` - Get list of supported waste categories
- `POST /api/classify` - Classify a waste image
  - Accepts multipart form data with an 'image' field
  - Returns classification results with confidence scores

## Supported Categories

- Cardboard
- Glass
- Metal
- Paper
- Plastic
- Trash (Other)
