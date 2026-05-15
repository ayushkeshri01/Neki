import sys
from PIL import Image
import os

def resize_icon(image_path, sizes):
    try:
        img = Image.open(image_path)
        for name, size in sizes.items():
            resized_img = img.resize(size, Image.Resampling.LANCZOS)
            output_path = os.path.join("public", name)
            resized_img.save(output_path, "PNG" if not name.endswith(".ico") else "ICO")
            print(f"Generated {output_path} ({size[0]}x{size[1]})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    sizes = {
        "favicon-16x16.png": (16, 16),
        "favicon-32x32.png": (32, 32),
        "favicon.ico": (32, 32),
        "apple-touch-icon.png": (180, 180),
        "android-chrome-192x192.png": (192, 192),
        "android-chrome-512x512.png": (512, 512),
        "icon.png": (512, 512)
    }
    resize_icon("public/logo.png", sizes)
    print("Generated all icons from public/logo.png")

    # Create og-image centered on a 1200x630 white background
    img = Image.open("public/logo.png")
    og_img = Image.new("RGBA", (1200, 630), (255, 255, 255, 255))
    
    aspect = img.width / img.height
    new_h = 400
    new_w = int(new_h * aspect)
    logo_resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    x = (1200 - new_w) // 2
    y = (630 - new_h) // 2
    og_img.paste(logo_resized, (x, y), logo_resized)
    og_img.save("public/og-image.png", "PNG")
    print("Generated og-image.png")
