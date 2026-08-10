import os
from PIL import Image

assets_dirs = [
    r"C:\Users\Compumax\Documents\Maxi Prietto\assets",
    r"C:\Users\Compumax\Documents\Maxi Prietto\assets\archivo"
]

print("--- STARTING IMAGE OPTIMIZATION ---")

total_saved = 0

for directory in assets_dirs:
    if not os.path.exists(directory):
        print(f"Directory {directory} does not exist. Skipping.")
        continue
        
    print(f"\nScanning directory: {directory}")
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        
        # Only process files
        if not os.path.isfile(filepath):
            continue
            
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ['.jpg', '.jpeg', '.png']:
            continue
            
        original_size = os.path.getsize(filepath)
        
        # We don't want to optimize small placeholder images if they are already optimized (e.g. < 40KB)
        if original_size < 40 * 1024 and not filename.startswith("album-") and filename != "home-bg.jpg":
            # skip small files to save time, unless they are album covers we want to standardize
            continue
            
        try:
            with Image.open(filepath) as img:
                width, height = img.size
                
                # Determine max dimension based on file type/name
                if filename.startswith("album-"):
                    max_dim = 800
                elif filename == "home-bg.jpg" or filename == "hero-bg.jpg":
                    max_dim = 1920
                else:
                    max_dim = 1600
                
                # Resize if larger than max_dim
                if width > max_dim or height > max_dim:
                    if width > height:
                        new_width = max_dim
                        new_height = int(height * (max_dim / width))
                    else:
                        new_height = max_dim
                        new_width = int(width * (max_dim / height))
                    
                    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                    print(f"Resizing {filename} from {width}x{height} to {new_width}x{new_height}")
                
                # Convert RGBA to RGB for JPEG saving if needed
                if img.mode in ('RGBA', 'LA'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[3]) # 3 is alpha
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Temp save to see if we actually reduce size
                temp_path = filepath + ".tmp"
                img.save(temp_path, "JPEG", quality=82, optimize=True)
                
                new_size = os.path.getsize(temp_path)
                
                if new_size < original_size:
                    os.replace(temp_path, filepath)
                    saved = original_size - new_size
                    total_saved += saved
                    print(f"Optimized {filename}: {original_size/1024:.1f}KB -> {new_size/1024:.1f}KB (Saved {saved/1024:.1f}KB)")
                else:
                    os.remove(temp_path)
                    print(f"Skipped {filename} (optimization did not reduce file size)")
                    
        except Exception as e:
            print(f"Error optimizing {filename}: {e}")

print(f"\n--- OPTIMIZATION COMPLETED. Total space saved: {total_saved / 1024 / 1024:.2f} MB ---")
