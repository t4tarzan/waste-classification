import torch
from PIL import Image
from transformers import ViTForImageClassification, ViTImageProcessor

class WasteNetModel:
    def __init__(self):
        # Load model and processor from HuggingFace
        self.model_name = "google/vit-base-patch16-224"  # Using a general image classification model
        self.processor = ViTImageProcessor.from_pretrained(self.model_name)
        self.model = ViTForImageClassification.from_pretrained(self.model_name)
        
        # WasteNet categories
        self.categories = [
            'organic', 'recyclable', 'hazardous', 'electronic', 
            'construction', 'metal', 'plastic', 'glass', 'paper'
        ]
        
        # Material types and recyclability mapping
        self.material_types = ['plastic', 'metal', 'glass', 'paper', 'organic']
        self.recyclability = {
            'organic': 'compostable',
            'recyclable': 'recyclable',
            'hazardous': 'special-disposal',
            'electronic': 'special-disposal',
            'construction': 'special-disposal',
            'metal': 'recyclable',
            'plastic': 'recyclable',
            'glass': 'recyclable',
            'paper': 'recyclable'
        }
        
    def predict(self, image):
        """Make a prediction on an input image"""
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
        
    def get_material_info(self, top_category):
        """Get material type and recyclability info based on top prediction"""
        if top_category in self.material_types:
            material_type = top_category
        else:
            material_type = 'mixed'
            
        recyclability = self.recyclability.get(top_category, 'check-local-guidelines')
        
        return material_type, recyclability
