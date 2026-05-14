from PIL import Image

try:
    img = Image.open("public/logo.png")
    img = img.convert("RGBA")
    data = img.getdata()
    transparent_pixels = sum(1 for item in data if item[3] < 255)
    print(f"Total pixels: {len(data)}")
    print(f"Transparent pixels: {transparent_pixels}")
except Exception as e:
    print(f"Error: {e}")
