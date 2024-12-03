import os
import requests
from tqdm import tqdm

def download_file(url, filename):
    """
    Download a file from a URL with progress bar
    """
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(filename, 'wb') as file, tqdm(
        desc=filename,
        total=total_size,
        unit='iB',
        unit_scale=True,
        unit_divisor=1024,
    ) as progress_bar:
        for data in response.iter_content(chunk_size=1024):
            size = file.write(data)
            progress_bar.update(size)

def main():
    # Create models directory if it doesn't exist
    os.makedirs('models/trashnet', exist_ok=True)
    
    # URL for the pre-trained model (we'll host this on a reliable service)
    model_url = "https://storage.googleapis.com/trashnet/model.h5"  # This is a placeholder URL
    model_path = "models/trashnet/model.h5"
    
    print(f"Downloading TrashNet model to {model_path}...")
    try:
        download_file(model_url, model_path)
        print("Model downloaded successfully!")
    except Exception as e:
        print(f"Error downloading model: {str(e)}")
        print("Please manually download the model and place it in the models/trashnet directory")

if __name__ == "__main__":
    main()
