import cv2
import numpy as np
import os

img_path = r"C:\Users\Compumax\.gemini\antigravity\brain\c589de57-f178-43fc-9db0-b2da014396d1\media__1780578544860.jpg"
out_svg_path = r"C:\Users\Compumax\Documents\Maxi Prietto\assets\motifs\logo-prietto.svg"

if not os.path.exists(img_path):
    print("Error: Image not found!")
    exit(1)

# Load image
img = cv2.imread(img_path)
h, w, c = img.shape

# Convert to grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Crop the PRIETTO band to focus on it (rows 680 to 910 is typical for the word "PRIETTO" in this 713x1024 poster)
# Let's inspect rows 685 to 905 which covers the text height perfectly
y_start = 700
y_end = 905
x_start = 20
x_end = w - 20

# Let's find contours in this crop
crop_gray = gray[y_start:y_end, x_start:x_end]

# Binarize (black text on white paper)
# Invert so text is white on black background
_, thresh = cv2.threshold(crop_gray, 100, 255, cv2.THRESH_BINARY_INV)

# Find contours with CCOMP to handle holes (like in P, R, O)
contours, hierarchy = cv2.findContours(thresh, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_TC89_L1)

if hierarchy is None:
    print("No contours found!")
    exit(1)

hierarchy = hierarchy[0]
svg_paths = []

# Crop dimensions
crop_h, crop_w = crop_gray.shape

print(f"Crop dimensions: {crop_w}x{crop_h}")
print(f"Total raw contours: {len(contours)}")

# We want to filter contours. The letters in "PRIETTO" are very large.
# Let's keep contours whose bounding box area is greater than 1000 square pixels, OR if they are children of a large contour.
valid_indices = set()
for idx, cnt in enumerate(contours):
    x, y, cw, ch = cv2.boundingRect(cnt)
    area = cv2.contourArea(cnt)
    parent_idx = hierarchy[idx][3]
    
    # If outer contour and large enough
    if parent_idx == -1 and area > 800:
        valid_indices.add(idx)
    # If it is a child (hole) of a valid parent
    elif parent_idx != -1:
        valid_indices.add(idx)

print(f"Valid contours after filtering: {len(valid_indices)}")

# Let's write them to SVG paths
for idx in valid_indices:
    cnt = contours[idx]
    parent_idx = hierarchy[idx][3]
    
    # Simplify contour points
    epsilon = 0.5
    approx = cv2.approxPolyDP(cnt, epsilon, True)
    
    path_data = []
    for pt_idx, pt in enumerate(approx):
        x, y = pt[0]
        # Shift back by the crop offset if needed, or keep relative to crop and set SVG viewBox to crop size!
        # Keeping relative to crop makes it a clean, standalone logo SVG file!
        if pt_idx == 0:
            path_data.append(f"M {x} {y}")
        else:
            path_data.append(f"L {x} {y}")
    path_data.append("Z")
    
    path_str = " ".join(path_data)
    
    # If child, we want it to be a subtraction (hole) - SVG evenodd handles this automatically
    svg_paths.append(f'<path d="{path_str}" fill="currentColor" />')

# Write SVG file
svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {crop_w} {crop_h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <g fill-rule="evenodd" stroke="none">
    {"\n    ".join(svg_paths)}
  </g>
</svg>'''

with open(out_svg_path, "w", encoding="utf-8") as f:
    f.write(svg_content)

print(f"Saved logo SVG to {out_svg_path}")
