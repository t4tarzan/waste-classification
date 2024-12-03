from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from PIL import Image
from io import BytesIO
import os
import traceback
from datetime import datetime
from ml.taco_model import TACOModel
from ml.wastenet_model import WasteNetModel
from ml.trashnet_model import TrashNetModel

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:3001"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Categories from TrashNet dataset
CATEGORIES = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']

# Mock categories for TACO
TACO_CATEGORIES = ['food_waste', 'recyclable_container', 'plastic_bag', 'paper_product', 'metal_container']

# Mock categories for WasteNet
WASTENET_CATEGORIES = ['organic', 'recyclable', 'hazardous', 'electronic', 'construction']
MATERIAL_TYPES = ['plastic', 'metal', 'glass', 'paper', 'organic']
RECYCLABILITY = ['recyclable', 'non-recyclable', 'special-disposal']

# Mock model for testing
class MockModel:
    def predict(self, image):
        # Return random predictions for testing
        predictions = np.random.uniform(0, 1, len(CATEGORIES))
        # Normalize to make sum = 1
        predictions = predictions / np.sum(predictions)
        return np.array([predictions])
        
    def get_recyclability(self, category):
        return 'check-local-guidelines'

# Initialize models
model = None
taco_model = None
wastenet_model = None

def load_model():
    """Load all models"""
    global model, taco_model, wastenet_model
    try:
        # Load TrashNet model
        try:
            print("Loading TrashNet model from HuggingFace...")
            model = TrashNetModel()
            print("TrashNet model loaded successfully!")
        except Exception as e:
            print(f"Error loading TrashNet model: {str(e)}")
            print("Using mock model for TrashNet")
            model = MockModel()
            
        # Load TACO model from HuggingFace
        try:
            print("Loading TACO model from HuggingFace...")
            taco_model = TACOModel()
            print("TACO model loaded successfully!")
        except Exception as e:
            print(f"Error loading TACO model: {str(e)}")
            print("Using mock model for TACO")
            taco_model = None
            
        # Load WasteNet model from HuggingFace
        try:
            print("Loading WasteNet model from HuggingFace...")
            wastenet_model = WasteNetModel()
            print("WasteNet model loaded successfully!")
        except Exception as e:
            print(f"Error loading WasteNet model: {str(e)}")
            print("Using mock model for WasteNet")
            wastenet_model = None
            
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        traceback.print_exc()
        model = MockModel()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': model is not None
    })

@app.route('/api/classify', methods=['POST'])
def classify_waste():
    """Classify waste images using the TrashNet model"""
    try:
        # Get the image from the request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
            
        image_file = request.files['image']
        # Read the image file into bytes
        image_bytes = image_file.read()
        # Create a BytesIO object
        image_buffer = BytesIO(image_bytes)
        # Open the image using PIL
        image = Image.open(image_buffer)
        
        # Ensure model is loaded
        if model is None:
            return jsonify({
                'error': 'Model not loaded'
            }), 500
        
        # Get predictions
        try:
            predictions = model.predict(image)[0]
            
            # Get prediction results as a dictionary
            prediction_dict = {
                cat: float(prob)
                for cat, prob in zip(CATEGORIES, predictions)
            }
            
            # Sort predictions by probability
            sorted_predictions = sorted(
                prediction_dict.items(),
                key=lambda x: x[1],
                reverse=True
            )
            
            # Get top prediction
            top_category = sorted_predictions[0][0]
            top_confidence = sorted_predictions[0][1]
            
            # Get recyclability information
            recyclability = model.get_recyclability(top_category)
            
            return jsonify({
                'category': top_category,
                'confidence': float(top_confidence),
                'predictions': prediction_dict,
                'recyclability': recyclability,
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            return jsonify({
                'error': f'Prediction error: {str(e)}',
                'traceback': traceback.format_exc()
            }), 500
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/taco/classify', methods=['POST'])
def taco_classify():
    """Classify waste images using the TACO model"""
    try:
        # Get the image from the request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
            
        image_file = request.files['image']
        # Read the image file into bytes
        image_bytes = image_file.read()
        # Create a BytesIO object
        image_buffer = BytesIO(image_bytes)
        # Open the image using PIL
        image = Image.open(image_buffer)
        
        # Get predictions
        predictions = taco_model.predict(image)[0]
        
        # Get prediction results as a dictionary
        prediction_dict = {
            cat: float(prob)
            for cat, prob in zip(TACO_CATEGORIES, predictions)
        }
        
        # Sort predictions by probability
        sorted_predictions = sorted(
            prediction_dict.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        # Get top prediction
        top_category = sorted_predictions[0][0]
        top_confidence = sorted_predictions[0][1]
        
        # Determine material type and recyclability
        material_type = 'mixed'
        if 'plastic' in top_category:
            material_type = 'plastic'
        elif 'metal' in top_category:
            material_type = 'metal'
        elif 'paper' in top_category:
            material_type = 'paper'
        
        is_recyclable = any(word in top_category for word in ['container', 'metal', 'paper', 'recyclable'])
        
        return jsonify({
            'category': top_category,
            'confidence': float(top_confidence),
            'predictions': prediction_dict,
            'metadata': {
                'material': material_type,
                'recyclable': is_recyclable
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/wastenet/classify', methods=['POST'])
def wastenet_classify():
    """Classify waste images using the WasteNet model"""
    try:
        # Get the image from the request
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
            
        image_file = request.files['image']
        # Read the image file into bytes
        image_bytes = image_file.read()
        # Create a BytesIO object
        image_buffer = BytesIO(image_bytes)
        # Open the image using PIL
        image = Image.open(image_buffer)
        
        # Get predictions
        predictions = wastenet_model.predict(image)[0]
        
        # Get prediction results as a dictionary
        prediction_dict = {
            cat: float(prob)
            for cat, prob in zip(WASTENET_CATEGORIES, predictions)
        }
        
        # Sort predictions by probability
        sorted_predictions = sorted(
            prediction_dict.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        # Get top prediction
        top_category = sorted_predictions[0][0]
        top_confidence = sorted_predictions[0][1]
        
        # Get material type and recyclability info
        material_type, recyclability = wastenet_model.get_material_info(top_category)
        
        return jsonify({
            'category': top_category,
            'confidence': float(top_confidence),
            'predictions': prediction_dict,
            'metadata': {
                'material': material_type,
                'recyclable': recyclability == 'recyclable'
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/mock/taco', methods=['POST'])
def mock_taco_classify():
    """Mock TACO API endpoint"""
    print(f"Received TACO request from {request.remote_addr}")
    try:
        # Generate mock TACO results
        category = random.choice(TACO_CATEGORIES)
        confidence = random.uniform(0.6, 0.95)
        
        results = {
            'category': category,
            'confidence': confidence,
            'predictions': [
                {'category': cat, 'confidence': random.uniform(0.1, 0.3)} 
                for cat in TACO_CATEGORIES if cat != category
            ],
            'timestamp': datetime.now().isoformat(),
            'source': 'taco',
            'disposalRecommendation': f'Please dispose of {category} in appropriate bin',
            'locationBasedSuggestion': 'Nearest recycling center: 123 Green St'
        }
        print("TACO results:", results)
        return jsonify(results)
    except Exception as e:
        print(f"Error in TACO endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/mock/wastenet', methods=['POST'])
def mock_wastenet_classify():
    """Mock WasteNet API endpoint"""
    print(f"Received WasteNet request from {request.remote_addr}")
    try:
        # Generate mock WasteNet results
        category = random.choice(WASTENET_CATEGORIES)
        material = random.choice(MATERIAL_TYPES)
        recyclability = random.choice(RECYCLABILITY)
        confidence = random.uniform(0.6, 0.95)
        
        results = {
            'category': category,
            'confidence': confidence,
            'predictions': [
                {'category': cat, 'confidence': random.uniform(0.1, 0.3)} 
                for cat in WASTENET_CATEGORIES if cat != category
            ],
            'material_type': material,
            'recyclability': recyclability,
            'timestamp': datetime.now().isoformat(),
            'source': 'wastenet'
        }
        print("WasteNet results:", results)
        return jsonify(results)
    except Exception as e:
        print(f"Error in WasteNet endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Load the model before starting the server
    load_model()
    # Run the app on port 5001
    print("Starting server on http://localhost:5001")
    app.run(debug=True, port=5001, host='localhost')
