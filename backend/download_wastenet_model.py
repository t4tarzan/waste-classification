import os
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model

def create_wastenet_model():
    """Create and save a pre-trained WasteNet model"""
    # Create model directory if it doesn't exist
    model_dir = os.path.join(os.path.dirname(__file__), 'models', 'wastenet')
    os.makedirs(model_dir, exist_ok=True)
    
    # Create a base model from MobileNetV2
    base_model = MobileNetV2(weights='imagenet', include_top=False)
    
    # Add custom layers
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(1024, activation='relu')(x)
    predictions = Dense(9, activation='softmax')(x)  # 9 WasteNet categories
    
    # Create the model
    model = Model(inputs=base_model.input, outputs=predictions)
    
    # Compile the model
    model.compile(optimizer='adam',
                 loss='categorical_crossentropy',
                 metrics=['accuracy'])
    
    # Save the model
    model_path = os.path.join(model_dir, 'model.h5')
    model.save(model_path)
    print(f"WasteNet model saved to {model_path}")

if __name__ == '__main__':
    create_wastenet_model()
