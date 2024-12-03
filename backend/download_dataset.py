import os
import requests
import zipfile
from tqdm import tqdm
import shutil
from PIL import Image

def download_file(url, filename):
    """Download a file with progress bar"""
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    block_size = 1024
    progress_bar = tqdm(total=total_size, unit='iB', unit_scale=True)
    
    with open(filename, 'wb') as file:
        for data in response.iter_content(block_size):
            progress_bar.update(len(data))
            file.write(data)
    progress_bar.close()

def resize_and_organize_dataset(source_dir, target_dir, size=(224, 224)):
    """Resize images and organize them into class directories"""
    # Create target directory
    os.makedirs(target_dir, exist_ok=True)
    
    # Process each class directory
    for class_name in os.listdir(source_dir):
        class_dir = os.path.join(source_dir, class_name)
        if os.path.isdir(class_dir):
            # Create class directory in target
            target_class_dir = os.path.join(target_dir, class_name)
            os.makedirs(target_class_dir, exist_ok=True)
            
            # Process each image
            for img_name in tqdm(os.listdir(class_dir), desc=f"Processing {class_name}"):
                if img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                    img_path = os.path.join(class_dir, img_name)
                    target_path = os.path.join(target_class_dir, img_name)
                    
                    try:
                        # Open, resize, and save image
                        with Image.open(img_path) as img:
                            img = img.convert('RGB')
                            img = img.resize(size, Image.LANCZOS)
                            img.save(target_path, 'JPEG', quality=95)
                    except Exception as e:
                        print(f"Error processing {img_path}: {e}")

def main():
    # Create data directory
    data_dir = "data"
    os.makedirs(data_dir, exist_ok=True)
    
    # Download dataset
    dataset_url = "https://github.com/garythung/trashnet/raw/master/data/dataset-resized.zip"
    zip_path = os.path.join(data_dir, "dataset-resized.zip")
    
    print("Downloading dataset...")
    download_file(dataset_url, zip_path)
    
    # Extract dataset
    print("Extracting dataset...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(data_dir)
    
    # Remove zip file
    os.remove(zip_path)
    
    # Resize and organize dataset
    source_dir = os.path.join(data_dir, "dataset-resized")
    target_dir = os.path.join(data_dir, "dataset-processed")
    print("Processing images...")
    resize_and_organize_dataset(source_dir, target_dir)
    
    print("Dataset preparation completed!")

if __name__ == "__main__":
    main()
