import os
from PIL import Image

# Input paths
brain_dir = r"C:\Users\Compumax\.gemini\antigravity\brain\c589de57-f178-43fc-9db0-b2da014396d1"
skeletons_path = os.path.join(brain_dir, "media__1780593882558.jpg")
dice_path = os.path.join(brain_dir, "media__1780593882554.jpg")

# Output paths
output_dir = r"C:\Users\Compumax\Documents\Maxi Prietto\assets\motifs"
os.makedirs(output_dir, exist_ok=True)
skeletons_out = os.path.join(output_dir, "calaveras.png")
dice_out = os.path.join(output_dir, "dados.png")

print("Processing skeletons with high fidelity alpha mapping...")
with Image.open(skeletons_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Mask out the "Alto Valle" logo at the top right
            if x > 520 and y < 100:
                pixels[x, y] = (0, 0, 0, 0)
                continue
                
            # Compute alpha based on red channel intensity (background is dark, lines are bright red)
            val = max(0, r - 30)
            alpha = min(255, int(val * 1.6))
            
            if alpha > 0:
                pixels[x, y] = (12, 12, 12, alpha)
            else:
                pixels[x, y] = (0, 0, 0, 0)
                
    img.save(skeletons_out, "PNG")
    print("Skeletons saved to:", skeletons_out)

print("\nProcessing dice with high fidelity alpha mapping...")
with Image.open(dice_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            
            # Grayscale intensity
            gray = int(0.299 * r + 0.587 * g + 0.114 * b)
            
            # White background is gray = 255. Black lines are gray = 0.
            # If gray > 220, fully transparent.
            # If gray < 100, fully opaque black.
            # In between, smooth linear transition.
            if gray > 220:
                alpha = 0
            elif gray < 100:
                alpha = 255
            else:
                alpha = int(255 * (220 - gray) / 120)
                
            if alpha > 0:
                pixels[x, y] = (12, 12, 12, alpha)
            else:
                pixels[x, y] = (0, 0, 0, 0)
                
    img.save(dice_out, "PNG")
    print("Dice saved to:", dice_out)

print("\nAsset extraction completed successfully!")
