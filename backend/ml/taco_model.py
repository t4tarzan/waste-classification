import torch
from PIL import Image
from transformers import ViTForImageClassification, ViTImageProcessor

class TACOModel:
    def __init__(self):
        # Load model and processor from HuggingFace
        self.model_name = "microsoft/resnet-50"  # Using a general image classification model
        self.processor = ViTImageProcessor.from_pretrained(self.model_name)
        self.model = ViTForImageClassification.from_pretrained(self.model_name)
        
        # TACO categories mapping
        self.categories = [
            'food_waste', 'recyclable_container', 'plastic_bag', 
            'paper_product', 'metal_container', 'glass_bottle',
            'cardboard', 'trash', 'organic_waste', 'electronic'
        ]
        
    def preprocess_image(self, image):
        # Resize image to match model input size
        image = image.resize((224, 224))
        return image
        
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
