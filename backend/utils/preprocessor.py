import tensorflow as tf
import numpy as np
from PIL import Image
import io

def preprocess_image(image_bytes, target_size=(224, 224)):
    """
    Preprocess image bytes for model prediction.
    
    Args:
        image_bytes: Raw image bytes
        target_size: Tuple of (height, width) to resize image to
        
    Returns:
        Preprocessed image array ready for model prediction
    """
    try:
        # Convert bytes to PIL Image
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize image
        img = img.resize(target_size, Image.LANCZOS)
        
        # Convert to array and preprocess
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        
        # Normalize pixel values
        img_array = img_array / 255.0
        
        return img_array
    except Exception as e:
        print(f"Error preprocessing image: {str(e)}")
        raise

def get_prediction_results(predictions, categories):
    """
    Process model predictions into a structured format.
    
    Args:
        predictions: Model prediction array
        categories: List of category names
        
    Returns:
        Dictionary containing prediction results
    """
    try:
        # Get the predictions array from the first (and only) batch item
        pred_array = predictions[0]
        
        # Get the highest confidence prediction
        max_confidence_idx = np.argmax(pred_array)
        max_confidence = float(pred_array[max_confidence_idx])
        predicted_category = categories[max_confidence_idx]
        
        # Create predictions dictionary
        predictions_dict = {}
        for idx, confidence in enumerate(pred_array):
            predictions_dict[categories[idx]] = float(confidence)
        
        # Format the response to match the frontend's expected format
        return {
            'category': predicted_category.lower(),  # Frontend expects lowercase
            'confidence': max_confidence,
            'predictions': predictions_dict,
            'source': 'trashnet',  # Required by frontend
            'timestamp': None  # Frontend will handle timestamp
        }
    
    except Exception as e:
        print(f"Error processing predictions: {str(e)}")
        raise
