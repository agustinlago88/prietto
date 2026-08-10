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

# Grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Binarize lower half of image (from row 500 to 950)
y_min_search = int(h * 0.5)
y_max_search = int(h * 0.95)
lower_gray = gray[y_min_search:y_max_search, :]

# Invert threshold so black ink is white on black background
_, thresh = cv2.threshold(lower_gray, 120, 255, cv2.THRESH_BINARY_INV)

# Find contours
contours, hierarchy = cv2.findContours(thresh, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_TC89_L1)

if hierarchy is None or len(contours) == 0:
    print("No contours found in the lower half!")
    exit(1)

hierarchy = hierarchy[0]

# Let's find the large parent contours.
# The letters of "PRIETTO" should have very large areas.
# Let's print out the areas of top parent contours to find a good threshold.
parent_areas = []
for idx, cnt in enumerate(contours):
    parent_idx = hierarchy[idx][3]
    if parent_idx == -1: # It is a parent
        area = cv2.contourArea(cnt)
        parent_areas.append((idx, area))

parent_areas.sort(key=lambda x: x[1], reverse=True)
print("Top 15 parent contour areas in lower half:")
for idx, area in parent_areas[:15]:
    x, y, cw, ch = cv2.boundingRect(contours[idx])
    print(f"Index: {idx}, Area: {area:.1f}, Bounding Box: x={x}, y={y+y_min_search}, w={cw}, h={ch}")

# Looking at the dimensions, the letters "P", "R", "I", "E", "T", "T", "O" are massive and should all have area > 2000.
# Let's collect the indices of the letters. Since there are 7 letters:
# P, R, I, E, T, T, O.
# Let's select the 7 largest contours that look like letters (w > 20 and h > 100).
letter_indices = []
for idx, area in parent_areas:
    x, y, cw, ch = cv2.boundingRect(contours[idx])
    # A letter should be tall and reasonably wide
    if ch > 100 and ch < 300 and cw > 20 and cw < 200 and area > 1000:
        letter_indices.append(idx)
        print(f"Selected letter candidate: Index={idx}, Area={area:.1f}, Bounding Box: x={x}, y={y+y_min_search}, w={cw}, h={ch}")

if len(letter_indices) == 0:
    print("No letter candidates found! Falling back to top contours.")
    # Fallback to contours with area > 1500
    letter_indices = [idx for idx, area in parent_areas if area > 1500 and ch > 50]

# Let's find the bounding box of the whole logo (all selected letters combined)
all_pts = []
for idx in letter_indices:
    all_pts.append(contours[idx].reshape(-1, 2))

all_pts_flat = np.vstack(all_pts)
x_logo, y_logo_rel, w_logo, h_logo = cv2.boundingRect(all_pts_flat)
y_logo = y_logo_rel + y_min_search

print(f"Exact logo bounding box: x={x_logo}, y={y_logo}, w={w_logo}, h={h_logo}")

# Let's gather the letter outer contours and their corresponding holes (children)
logo_contour_indices = set()
for idx in letter_indices:
    logo_contour_indices.add(idx)
    # Find all children of this parent contour
    for c_idx, cnt in enumerate(contours):
        parent_idx = hierarchy[c_idx][3]
        if parent_idx == idx:
            logo_contour_indices.add(c_idx)

# Generate SVG paths relative to the exact logo bounding box
svg_paths = []
for idx in logo_contour_indices:
    cnt = contours[idx]
    
    # Simplify contour points
    epsilon = 0.55
    approx = cv2.approxPolyDP(cnt, epsilon, True)
    
    path_data = []
    for pt_idx, pt in enumerate(approx):
        x_pt, y_pt = pt[0]
        # Shift coordinate to be relative to the logo bounding box
        # Note: y_pt is relative to lower_gray, so actual y in image is y_pt + y_min_search
        x_rel = x_pt - x_logo
        y_rel = (y_pt + y_min_search) - y_logo
        
        if pt_idx == 0:
            path_data.append(f"M {x_rel} {y_rel}")
        else:
            path_data.append(f"L {x_rel} {y_rel}")
    path_data.append("Z")
    
    path_str = " ".join(path_data)
    svg_paths.append(f'<path d="{path_str}" fill="currentColor" />')

# Write SVG
svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w_logo} {h_logo}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <g fill-rule="evenodd" stroke="none">
    {"\n    ".join(svg_paths)}
  </g>
</svg>'''

with open(out_svg_path, "w", encoding="utf-8") as f:
    f.write(svg_content)

print(f"Saved precise logo SVG to {out_svg_path}")
