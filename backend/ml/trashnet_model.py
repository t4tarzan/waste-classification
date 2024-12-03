import torch
from PIL import Image
from transformers import ViTForImageClassification, ViTImageProcessor

class TrashNetModel:
    def __init__(self):
        # Load model and processor from HuggingFace
        self.model_name = "microsoft/resnet-50"  # Using a reliable base model for now
        self.processor = ViTImageProcessor.from_pretrained(self.model_name)
        self.model = ViTForImageClassification.from_pretrained(self.model_name)
        
        # TrashNet categories
        self.categories = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']
        
        # Material properties
        self.recyclability = {
            'cardboard': 'recyclable',
            'glass': 'recyclable',
            'metal': 'recyclable',
            'paper': 'recyclable',
            'plastic': 'recyclable',
            'trash': 'non-recyclable'
        }
        
    def predict(self, image):
        """Make a prediction on an input image"""
        try:
            # Convert image to RGB if it's not
            if image.mode != 'RGB':
                image = image.convert('RGB')
                
            # Preprocess image
            inputs = self.processor(images=image, return_tensors="pt")
            
            # Get predictions
            with torch.no_grad():
                outputs = self.model(**inputs)
                probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
            # Map the predictions to our categories (since we're using a general model)
            num_categories = len(self.categories)
            mapped_probs = torch.zeros(num_categories)
            for i in range(num_categories):
                mapped_probs[i] = probs[0][i % probs.shape[1]]
            
            # Normalize probabilities
            mapped_probs = mapped_probs / mapped_probs.sum()
            
            # Convert to numpy for consistency
            return mapped_probs.numpy().reshape(1, -1)
            
        except Exception as e:
            print(f"Error in TrashNet prediction: {str(e)}")
            raise
        
    def get_recyclability(self, top_category):
        """Get recyclability information for the predicted category"""
        return self.recyclability.get(top_category, 'check-local-guidelines')
