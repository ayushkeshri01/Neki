import sys
from rembg import remove
from PIL import Image

try:
    input_path = 'public/logo.png'
    output_path = 'public/logo_transparent.png'

    input_image = Image.open(input_path)
    # Using rembg to cleanly remove the background
    output_image = remove(input_image)
    output_image.save(output_path)
    
    print("Background removed perfectly using AI!")
except Exception as e:
    print(f"Error: {e}")
