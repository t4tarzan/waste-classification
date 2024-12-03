from PIL import Image, ImageDraw
import os

def create_test_image():
    # Create directory if it doesn't exist
    os.makedirs('test_images', exist_ok=True)
    
    # Create a new image with a white background
    width = 224
    height = 224
    image = Image.new('RGB', (width, height), 'white')
    
    # Get a drawing context
    draw = ImageDraw.Draw(image)
    
    # Draw a simple bottle shape
    draw.rectangle([90, 50, 140, 180], fill='lightblue', outline='blue')
    draw.ellipse([85, 30, 145, 70], fill='lightblue', outline='blue')
    
    # Save the image
    image.save('test_images/plastic_bottle.jpg', 'JPEG')
    print("Created test image at: test_images/plastic_bottle.jpg")

if __name__ == '__main__':
    create_test_image()
