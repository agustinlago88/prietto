import urllib.request
import re
import ssl
import os

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# List of new albums to fetch
albums_to_fetch = [
    # Solista
    ("https://prietto.bandcamp.com/album/boleros-canciones", "solista", "album-boleros-canciones.jpg"),
    ("https://prietto.bandcamp.com/album/ba-o-de-bosque", "solista", "album-bano-de-bosque.jpg"),
    ("https://prietto.bandcamp.com/album/hogo-sound", "solista", "album-hogo-sound.jpg"),
    ("https://prietto.bandcamp.com/album/la-ultima-noche", "solista", "album-la-ultima-noche.jpg"),
    ("https://prietto.bandcamp.com/album/playa-nocturna-vol-2", "solista", "album-playa-nocturna-vol-2.jpg"),
    ("https://prietto.bandcamp.com/album/playa-nocturna-vol-3", "solista", "album-playa-nocturna-vol-3.jpg"),
    ("https://prietto.bandcamp.com/album/playa-nocturna-vol-4", "solista", "album-playa-nocturna-vol-4.jpg"),
    ("https://prietto.bandcamp.com/album/una-velada-de-blues-boleros", "solista", "album-una-velada-blues-boleros.jpg"),
    ("https://prietto.bandcamp.com/album/pin-de-fartie-soundtrack", "solista", "album-pin-de-fartie.jpg"),
    
    # Los Espiritus
    ("https://losespiritus.bandcamp.com/album/hacele-caso-a-tu-espiritu", "espiritus", "album-hacele-caso-a-tu-espiritu.jpg"),
    ("https://losespiritus.bandcamp.com/album/sancocho-stereo", "espiritus", "album-sancocho-stereo.jpg"),
    ("https://losespiritus.bandcamp.com/album/lo-echaron-del-bar-ep", "espiritus", "album-lo-echaron-del-bar-ep.jpg"),
    ("https://losespiritus.bandcamp.com/album/el-gato-ep", "espiritus", "album-el-gato-ep.jpg"),
    
    # Cosmos
    ("https://priettoviajaalcosmosconmariano.bandcamp.com/album/experiencias-del-sal-n-c-smico", "cosmos", "album-experiencias-salon-cosmico.jpg"),
    ("https://priettoviajaalcosmosconmariano.bandcamp.com/album/le-pri-t-vaha-chosmos-e-ba-con-maourian", "cosmos", "album-le-priet-vaha-chosmos.jpg"),
    ("https://priettoviajaalcosmosconmariano.bandcamp.com/album/lou-fai-home-sessions-vol-ii", "cosmos", "album-lou-fai-home-sessions-ii.jpg"),
    ("https://priettoviajaalcosmosconmariano.bandcamp.com/album/prietto-viaja-al-cosmos-con-mariano-ep", "cosmos", "album-prietto-viaja-cosmos-ep.jpg")
]

assets_dir = r"C:\Users\Compumax\Documents\Maxi Prietto\assets"

metadata_extracted = []

for url, cat, filename in albums_to_fetch:
    print(f"\nFetching {url}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx) as response:
            html = response.read().decode('utf-8')
        
        # Find og:image (cover image)
        og_img_match = re.search(r'<meta property="og:image" content="([^"]*)"', html)
        # Find title
        title_match = re.search(r'<meta property="og:title" content="([^"]*)"', html)
        # Find album release date / year
        year_match = re.search(r'released\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+,\s+(\d{4})', html, re.IGNORECASE)
        if not year_match:
            year_match = re.search(r'released\s+\d+\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})', html, re.IGNORECASE)
        if not year_match:
            # Fallback to copyright or meta years
            year_match = re.search(r'copyright\s+(\d{4})', html, re.IGNORECASE)
            
        album_year = year_match.group(1) if year_match else "2020" # fallback
        album_title = title_match.group(1) if title_match else "Album"
        
        # Clean title (Bandcamp titles are formatted like "Album Title by Artist")
        album_title = re.sub(r'\s+by\s+.*$', '', album_title).strip()
        
        # Find tracks or description
        tracks = re.findall(r'<span class="track-title"[^>]*>\s*(.*?)\s*</span>', html, re.DOTALL)
        if not tracks:
            # try meta description or schema tracks
            tracks_match = re.findall(r'"name"\s*:\s*"([^"]*)"', html)
            if tracks_match:
                tracks = [t for t in tracks_match if t != album_title and len(t) > 2][:3]
        
        track_list_str = ", ".join(tracks[:3])
        if not track_list_str:
            track_list_str = "Canciones y registros instrumentales."
            
        print(f"Parsed Title: {album_title} | Year: {album_year} | Tracks: {track_list_str}")
        
        if og_img_match:
            img_url = og_img_match.group(1)
            # Make sure it's high res (often _23.jpg or _10.jpg)
            img_url = re.sub(r'_\d+\.jpg', '_10.jpg', img_url) # _10.jpg is standard 1200x1200px or similar
            
            # Download image
            dest_path = os.path.join(assets_dir, filename)
            print(f"Downloading cover {img_url} to {dest_path}...")
            urllib.request.urlretrieve(img_url, dest_path)
            print("Download completed.")
        else:
            print("Cover image URL not found.")
            
        metadata_extracted.append({
            "url": url,
            "cat": cat,
            "filename": filename,
            "title": album_title,
            "year": album_year,
            "desc": track_list_str
        })
        
    except Exception as e:
        print(f"Error: {e}")

print("\n--- EXTRACTED METADATA FOR HTML ---")
for meta in metadata_extracted:
    print(f'        <article class="album" data-cat="{meta["cat"]}"><div class="cover"><img src="assets/{meta["filename"]}" alt="{meta["title"]} ({meta["year"]})" loading="lazy"/></div><span class="meta-line">{meta["cat"].capitalize()} · {meta["year"]}</span><span class="a-title">{meta["title"]}</span><span class="a-desc">{meta["desc"]}</span><a class="btn-buy" href="{meta["url"]}" target="_blank" rel="noopener">Comprar</a></article>')
