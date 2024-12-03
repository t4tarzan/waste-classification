import requests
import json
from PIL import Image
import io
import os

def test_endpoint(endpoint, image_path):
    # Format the endpoint URL
    endpoint_url = f'http://localhost:5001/api/{endpoint}/classify' if endpoint != 'trashnet' else 'http://localhost:5001/api/classify'
    print(f"\nTesting {endpoint.upper()} endpoint with image: {image_path}")
    
    try:
        # Verify the image can be opened with PIL first
        with Image.open(image_path) as img:
            print(f"Image size: {img.size}")
            print(f"Image mode: {img.mode}")
            
            # Convert to RGB if needed
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Save to bytes
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG')
            img_byte_arr.seek(0)
            
            # Create files dictionary
            files = {
                'image': ('image.jpg', img_byte_arr, 'image/jpeg')
            }
            
            # Send request to endpoint
            print(f"Sending request to: {endpoint_url}")
            response = requests.post(endpoint_url, files=files)
            
            # Print results
            print(f"\n=== {endpoint.upper()} Results ===")
            if response.status_code == 200:
                result = response.json()
                print(json.dumps(result, indent=2))
            else:
                print(f"Error: {response.status_code}")
                print(response.text)
                
    except Exception as e:
        print(f"Error processing image: {str(e)}")

def main():
    # Test image path
    test_image = "test_images/plastic_bottle.jpg"
    
    # Verify file exists
    if not os.path.exists(test_image):
        print(f"Error: Test image not found at {test_image}")
        return
        
    # Test all endpoints
    test_endpoint('trashnet', test_image)
    test_endpoint('taco', test_image)
    test_endpoint('wastenet', test_image)

if __name__ == "__main__":
    main()
