import os
from PIL import Image, ImageDraw

brain_dir = r"C:\Users\Compumax\.gemini\antigravity\brain\c589de57-f178-43fc-9db0-b2da014396d1"
dice_path = os.path.join(brain_dir, "media__1780593882554.jpg")
output_path = r"C:\Users\Compumax\Documents\Maxi Prietto\assets\motifs\dados.png"

with Image.open(dice_path) as img:
    img = img.convert("RGBA")
    width, height = img.size
    
    # 1. Create a mask image of the same size, initialized to 0 (black/transparent)
    mask = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask)
    
    # 2. Define the polygon vertices that tightly wrap only the two dice cubes.
    # Coordinates are estimated to surround the two cubes and cut off the speed lines.
    polygon = [
        (108, 102),  # Top corner of left die
        (220, 140),  # Top notch between dice
        (374, 142),  # Top corner of right die
        (405, 235),  # Right corner of right die
        (368, 390),  # Bottom corner of right die
        (205, 390),  # Bottom notch between dice
        (95, 395),   # Bottom corner of left die
        (10, 260),   # Left corner of left die
        (10, 180)    # Left edge of left die
    ]
    
    # Fill the polygon with 255 (white/opaque)
    draw.polygon(polygon, fill=255)
    
    # 3. Process pixels
    pixels = img.load()
    mask_pixels = mask.load()
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            gray = int(0.299 * r + 0.587 * g + 0.114 * b)
            
            # Check if this pixel is inside our polygon mask
            in_mask = mask_pixels[x, y] == 255
            
            if in_mask:
                # White parts of the dice (dots and faces) should be white (255, 255, 255, 255).
                # Black ink lines of the dice should be black (12, 12, 12, 255).
                # This ensures the dice are opaque white cubes with black ink lines/dots,
                # so they look solid and don't show background text through their bodies!
                # If gray < 130, it is black ink.
                if gray < 130:
                    pixels[x, y] = (12, 12, 12, 255)
                else:
                    # White parts of the dice - keep them opaque white!
                    pixels[x, y] = (255, 255, 255, 255)
            else:
                # Outside the mask (speed lines / rays) - make fully transparent!
                pixels[x, y] = (0, 0, 0, 0)
                
    img.save(output_path, "PNG")
    print("Dice extracted successfully without rays, saved to:", output_path)
