import os
import json
import shutil
from PIL import Image, ImageOps
import pymongo

BACKEND_DIR = r"E:\Projects\Hospital Management Portal\backend"

ASSETS_DIR = r"E:\Projects\Hospital Management Portal\frontend\src\assets"
BACKEND_UPLOADS = r"E:\Projects\Hospital Management Portal\backend\uploads\doctors"
FRONTEND_UPLOADS = r"E:\Projects\Hospital Management Portal\frontend\public\uploads\doctors"

os.makedirs(BACKEND_UPLOADS, exist_ok=True)
os.makedirs(FRONTEND_UPLOADS, exist_ok=True)

MAPPINGS = [
    {
        "file": "ned stark.jpg",
        "first": "Ned",
        "last": "Stark",
        "target_name": "Dr_Ned_Stark.jpg"
    },
    {
        "file": "Tyrion_Lannister.jpg",
        "first": "Tyrion",
        "last": "Lannister",
        "target_name": "Dr_Tyrion_Lannister.jpg"
    },
    {
        "file": "arthur shelby.jpg",
        "first": "Arthur",
        "last": "Shelby",
        "target_name": "Dr_Arthur_Shelby.jpg"
    },
    {
        "file": "polly.jpg",
        "first": "Polly",
        "last": "Gray",
        "target_name": "Dr_Polly_Gray.jpg"
    },
    {
        "file": "ragnar lothbrok.jpg",
        "first": "Ragnar",
        "last": "Lothbrok",
        "target_name": "Dr_Ragnar_Lothbrok.jpg"
    },
    {
        "file": "kaleen.jpg",
        "first": "Kaleen",
        "last": "Bhaiya",
        "target_name": "Dr_Kaleen_Bhaiya.jpg"
    },
    {
        "file": "srikant.jpg",
        "first": "Srikant",
        "last": "Tiwari",
        "target_name": "Dr_Srikant_Tiwari.jpg"
    }
]

# Resolve MongoDB connection string dynamically from appsettings.json or environment
def get_mongo_uri():
    if os.environ.get("MONGODB_URI"):
        return os.environ.get("MONGODB_URI")
    appsettings_path = os.path.join(BACKEND_DIR, "appsettings.json")
    if os.path.exists(appsettings_path):
        try:
            with open(appsettings_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("MongoDB", {}).get("ConnectionString")
        except Exception:
            pass
    return "mongodb://localhost:27017/hospital_db"

client = pymongo.MongoClient(get_mongo_uri())
db = client["hospital_db"]
doctors_col = db["doctors"]

print("--- Processing Images & Updating MongoDB ---")

for m in MAPPINGS:
    src_path = os.path.join(ASSETS_DIR, m["file"])
    if not os.path.exists(src_path):
        print(f"ERROR: File not found: {src_path}")
        continue
        
    backend_dest = os.path.join(BACKEND_UPLOADS, m["target_name"])
    frontend_dest = os.path.join(FRONTEND_UPLOADS, m["target_name"])
    
    # Process with PIL to ensure proper RGB encoding & high quality (1024x1024)
    with Image.open(src_path) as img:
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")
        img.save(backend_dest, "JPEG", quality=95)
        img.save(frontend_dest, "JPEG", quality=95)
        
        # Also copy with raw filename to both destinations so any URL format resolves
        raw_name = os.path.basename(m["file"])
        img.save(os.path.join(BACKEND_UPLOADS, raw_name), "JPEG", quality=95)
        img.save(os.path.join(FRONTEND_UPLOADS, raw_name), "JPEG", quality=95)
        
    print(f"Processed & Saved: {m['target_name']} and {raw_name}")
    
    # Update doctor in MongoDB
    prof_pic_url = f"/uploads/doctors/{m['target_name']}"
    res = doctors_col.update_one(
        {"$or": [
            {"firstName": m["first"], "lastName": m["last"]},
            {"firstName": {"$regex": m["first"], "$options": "i"}, "lastName": {"$regex": m["last"], "$options": "i"}}
        ]},
        {"$set": {"profilePicture": prof_pic_url}}
    )
    print(f"DB Update for {m['first']} {m['last']}: matched={res.matched_count}, modified={res.modified_count}, url={prof_pic_url}")

print("\n--- Verification: Current Doctors in DB ---")
for d in doctors_col.find({}, {"firstName": 1, "lastName": 1, "profilePicture": 1}):
    print(f"{d.get('firstName')} {d.get('lastName')}: {d.get('profilePicture')}")

print("\nAll doctor portraits successfully updated!")
