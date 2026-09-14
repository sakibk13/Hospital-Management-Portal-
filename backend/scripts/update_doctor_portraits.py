import os
import urllib.request
import json
from PIL import Image, ImageOps

UPLOAD_DIR = r"E:\Projects\Hospital Management Portal\backend\uploads\doctors"
API_BASE = "http://localhost:5000/api/doctors"

os.makedirs(UPLOAD_DIR, exist_ok=True)

DOCTORS = [
    {
        "id": "6aa2586933f5e531c6025530",
        "name": "Dr_Ned_Stark",
        "url": "https://commons.wikimedia.org/wiki/Special:FilePath/AV0A6306_Sean_Bean.jpg",
        "crop_box": (0.1, 0.05, 0.9, 0.75) # (left, top, right, bottom) fraction
    },
    {
        "id": "6aa2586933f5e531c6025533",
        "name": "Dr_Tyrion_Lannister",
        "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Peter_Dinklage_by_Gage_Skidmore_2.jpg",
        "crop_box": (0.15, 0.05, 0.85, 0.75)
    },
    {
        "id": "6aa2586933f5e531c6025534",
        "name": "Dr_Polly_Gray",
        "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Helen_McCrory_2017_(Extract).jpg",
        "crop_box": (0.05, 0.05, 0.95, 0.95)
    },
    {
        "id": "6aa2586933f5e531c6025535",
        "name": "Dr_Ragnar_Lothbrok",
        "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Travis_Fimmel_by_Gage_Skidmore.jpg",
        "crop_box": (0.15, 0.05, 0.85, 0.75)
    },
    {
        "id": "6aa2586933f5e531c6025536",
        "name": "Dr_Arthur_Shelby",
        "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Paul_Anderson_2026_(55268093833)_(cropped).jpg",
        "crop_box": (0.05, 0.05, 0.95, 0.95)
    },
    {
        "id": "6aa2586933f5e531c6025537",
        "name": "Dr_Kaleen_Bhaiya",
        "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Pankaj_Tripathi_World_Premiere_Newton_Zoopalast_Berlinale_2017_06.jpg",
        "crop_box": (0.1, 0.05, 0.9, 0.85)
    },
    {
        "id": "6aa2586933f5e531c6025538",
        "name": "Dr_Srikant_Tiwari",
        "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Manoj_Bajpai_at_52nd_IFFI.jpg",
        "crop_box": (0.15, 0.05, 0.85, 0.85)
    },
    {
        "id": "6aa2586933f5e531c6025539",
        "name": "Dr_Mike_Ehrmantraut",
        "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Jonathan_Banks_2012_2.jpg",
        "crop_box": (0.1, 0.05, 0.9, 0.85)
    },
    {
        "id": "6aa2586933f5e531c602553a",
        "name": "Dr_Lagertha_Lothbrok",
        "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Katheryn_Winnick_Toronto_2023.jpg",
        "crop_box": (0.1, 0.05, 0.9, 0.85)
    },
    {
        "id": "6aa2586933f5e531c602553b",
        "name": "Dr_Daenerys_Targaryen",
        "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Emilia_Clarke_at_the_2023_Harper's_Bazaar_Women_of_the_Year_Awards.jpg",
        "crop_box": (0.1, 0.05, 0.9, 0.85)
    },
    {
        "id": "6aa2586933f5e531c602553c",
        "name": "Dr_Chellam_Sir",
        "url": "https://starsunfolded.com/wp-content/uploads/2021/07/Uday-Mahesh.jpg",
        "crop_box": (0.05, 0.05, 0.95, 0.95)
    },
    {
        "id": "6aa2586933f5e531c602553d",
        "name": "Dr_Hank_Schrader",
        "url": "https://commons.wikimedia.org/wiki/Special:FilePath/Dean_Norris_by_Gage_Skidmore_4.jpg",
        "crop_box": (0.15, 0.05, 0.85, 0.75)
    }
]

def process_and_save(item):
    filename = f"{item['name']}.jpg"
    target_path = os.path.join(UPLOAD_DIR, filename)
    
    print(f"Downloading {item['name']}...")
    req = urllib.request.Request(
        item['url'],
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    )
    
    temp_path = os.path.join(UPLOAD_DIR, f"temp_{filename}")
    with urllib.request.urlopen(req) as resp, open(temp_path, 'wb') as out:
        out.write(resp.read())
        
    # Open and process image into square headshot
    with Image.open(temp_path) as img:
        img = ImageOps.exif_transpose(img)
        img = img.convert('RGB')
        
        w, h = img.size
        # Apply custom crop box if given
        c_left, c_top, c_right, c_bottom = item.get('crop_box', (0, 0, 1, 1))
        crop_rect = (int(w * c_left), int(h * c_top), int(w * c_right), int(h * c_bottom))
        img = img.crop(crop_rect)
        
        # Center crop to square
        w, h = img.size
        min_dim = min(w, h)
        left = (w - min_dim) // 2
        top = max(0, int((h - min_dim) * 0.2)) # prioritize head
        if top + min_dim > h:
            top = h - min_dim
        img = img.crop((left, top, left + min_dim, top + min_dim))
        
        # Resize to standard 600x600 portrait
        img = img.resize((600, 600), Image.Resampling.LANCZOS)
        img.save(target_path, "JPEG", quality=92)
        
    if os.path.exists(temp_path):
        os.remove(temp_path)
        
    print(f"Saved: {target_path}")
    
    # Update Doctor in MongoDB via API
    doc_url = f"{API_BASE}/{item['id']}"
    req = urllib.request.Request(doc_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        doc = json.loads(resp.read().decode())
        
    doc['profilePicture'] = f"/uploads/doctors/{filename}"
    update_data = json.dumps(doc).encode('utf-8')
    
    put_req = urllib.request.Request(
        doc_url, 
        data=update_data, 
        headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0'},
        method='PUT'
    )
    with urllib.request.urlopen(put_req) as resp:
        res = json.loads(resp.read().decode())
        print(f"Updated {doc['firstName']} {doc['lastName']} with profilePicture: {doc['profilePicture']}")

for doc in DOCTORS:
    try:
        process_and_save(doc)
    except Exception as e:
        print(f"Error processing {doc['name']}: {e}")
