import re
import html
import json

log_html_path = r"C:\Users\Compumax\.gemini\antigravity\brain\c589de57-f178-43fc-9db0-b2da014396d1\.system_generated\steps\1413\content.md"

try:
    with open(log_html_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Search for data-client-items attribute
    matches = re.findall(r'data-client-items="([^"]+)"', content)
    if matches:
        escaped_json = matches[0]
        # Unescape HTML entities
        unescaped_json = html.unescape(escaped_json)
        items = json.loads(unescaped_json)
        
        print("--- EXTRACTED ALBUMS FROM data-client-items ---")
        for item in items:
            # item usually has 'id', 'title', 'url', 'type' (e.g. 'album')
            print(f"ID: {item.get('id')} | Title: {item.get('title')} | Type: {item.get('type')} | URL: {item.get('url')}")
            
    else:
        print("No data-client-items attribute found. Searching for other patterns...")
        # Search for track/album ID pattern, e.g. "album=12345" or "tralbum_id: 12345"
        ids = re.findall(r'id:\s*(\d+)', content)
        print("Found numeric IDs:", ids[:10])

except Exception as e:
    print(f"Error: {e}")
