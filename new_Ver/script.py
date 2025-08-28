import os
import requests
from tqdm import tqdm
import img2pdf
from glob import glob
import re

def download_image(url, filename):
    """
    Download an image from a URL and save it to the specified filename
    """
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        with open(filename, 'wb') as file:
            for chunk in response.iter_content(chunk_size=1024):
                if chunk:
                    file.write(chunk)
        return True
    else:
        print(f"Failed to download {url}. Status code: {response.status_code}")
        return False

def create_pdf_from_images(image_dir, pdf_path):
    """
    Create a PDF from a directory of images in sequential order
    """
    # Get all png files in the directory
    image_files = glob(os.path.join(image_dir, "*.png"))
    
    # Sort images by number in filename (image_001.png, image_002.png, etc.)
    def get_image_number(filename):
        match = re.search(r'image_(\d+)\.png', filename)
        if match:
            return int(match.group(1))
        return 0
    
    image_files.sort(key=get_image_number)
    
    # Check if we have images to process
    if not image_files:
        print("No images found to convert to PDF.")
        return False
    
    print(f"Creating PDF from {len(image_files)} images...")
    
    # Convert images to PDF
    try:
        with open(pdf_path, "wb") as pdf_file:
            pdf_file.write(img2pdf.convert(image_files))
        print(f"PDF created successfully: {os.path.abspath(pdf_path)}")
        return True
    except Exception as e:
        print(f"Error creating PDF: {str(e)}")
        return False

def main():
    # Create output directory if it doesn't exist
    output_dir = os.path.join(os.path.dirname(__file__), "downloaded_images")
    os.makedirs(output_dir, exist_ok=True)
    
    # Path to the file with URLs
    urls_file = os.path.join(os.path.dirname(__file__), "temp.txtt")
    
    # Read URLs from the file
    with open(urls_file, 'r') as file:
        lines = file.readlines()
    
    # Process each line (URL)
    successful_downloads = 0
    failed_downloads = 0
    
    print(f"Starting to download {len(lines)} images...")
    
    for line in tqdm(lines, desc="Downloading images"):
        # Extract the number and URL from each line
        parts = line.strip().split('. ', 1)
        if len(parts) != 2:
            print(f"Skipping invalid line: {line.strip()}")
            continue
            
        number, url = parts
        
        # Create a filename with proper numbering (ensuring leading zeros for proper sorting)
        filename = os.path.join(output_dir, f"image_{number.zfill(3)}.png")
        
        # Download the image
        if download_image(url, filename):
            successful_downloads += 1
        else:
            failed_downloads += 1
    
    # Print summary
    print(f"\nDownload complete!")
    print(f"Successfully downloaded: {successful_downloads} images")
    print(f"Failed downloads: {failed_downloads} images")
    print(f"Images saved to: {os.path.abspath(output_dir)}")
    
    # Create PDF from downloaded images
    pdf_path = os.path.join(os.path.dirname(__file__), "behance_images.pdf")
    create_pdf_from_images(output_dir, pdf_path)

if __name__ == "__main__":
    main()
