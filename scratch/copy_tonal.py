import shutil
import os

sources = [
    r"C:\Users\Compumax\.gemini\antigravity\brain\c589de57-f178-43fc-9db0-b2da014396d1\media__1780579353921.jpg",
    r"C:\Users\Compumax\.gemini\antigravity\brain\c589de57-f178-43fc-9db0-b2da014396d1\media__1780579354114.jpg",
    r"C:\Users\Compumax\.gemini\antigravity\brain\c589de57-f178-43fc-9db0-b2da014396d1\media__1780579354117.jpg",
    r"C:\Users\Compumax\.gemini\antigravity\brain\c589de57-f178-43fc-9db0-b2da014396d1\media__1780579354185.jpg"
]

dest_dir = r"C:\Users\Compumax\Documents\Maxi Prietto\assets\archivo"

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

for i, src in enumerate(sources):
    dest_name = f"tonal{i+1}.jpg"
    dest_path = os.path.join(dest_dir, dest_name)
    if os.path.exists(src):
        shutil.copy2(src, dest_path)
        print(f"Copied {src} -> {dest_path}")
    else:
        print(f"Source not found: {src}")
