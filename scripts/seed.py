import json, os, urllib.request, urllib.error, urllib.parse

BASE = "http://localhost:8090"

# Authenticate
auth_data = json.dumps({"identity": os.getenv("PB_ADMIN_EMAIL", "admin@example.com"), "password": os.getenv("PB_ADMIN_PASSWORD", "password12")}).encode()
req = urllib.request.Request(
    f"{BASE}/api/collections/_superusers/auth-with-password",
    data=auth_data,
    headers={"Content-Type": "application/json"},
    method="POST"
)
with urllib.request.urlopen(req) as resp:
    TOKEN = json.loads(resp.read())["token"]

HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def post(collection, data):
    payload = json.dumps(data).encode()
    req = urllib.request.Request(
        f"{BASE}/api/collections/{collection}/records",
        data=payload,
        headers=HEADERS,
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"  ERROR creating in {collection}: {err}")
        return None

def find_by_slug(collection, slug):
    encoded = urllib.parse.quote(f'slug="{slug}"')
    req = urllib.request.Request(
        f"{BASE}/api/collections/{collection}/records?filter={encoded}&perPage=1",
        headers=HEADERS
    )
    try:
        with urllib.request.urlopen(req) as resp:
            items = json.loads(resp.read()).get("items", [])
            return items[0] if items else None
    except Exception:
        return None

def patch_collection_rules(collection_name, rules):
    """Set API rules on a collection via the admin API (PATCH /api/collections/:name).

    In PocketBase, an empty string "" means public access (no auth required).
    null means the rule is locked (no access). This must be called after
    collections are created to ensure unauthenticated visitors can read
    public data like products and categories.
    """
    payload = json.dumps(rules).encode()
    req = urllib.request.Request(
        f"{BASE}/api/collections/{collection_name}",
        data=payload,
        headers=HEADERS,
        method="PATCH"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            json.loads(resp.read())
            print(f"  Rules updated for '{collection_name}': listRule={rules.get('listRule')!r}, viewRule={rules.get('viewRule')!r}")
    except urllib.error.HTTPError as e:
        print(f"  WARNING: Could not patch rules for '{collection_name}': {e.read().decode()}")

# --- PATCH PUBLIC API RULES ---
# Empty string "" = public access (no authentication required).
# This fixes 403 Forbidden errors on the landing page for unauthenticated visitors.
# PocketBase defaults new collections to null rules (no access) so we must set them explicitly.
print("--- Patching collection API rules ---")

for col in ["categories", "products", "banners", "testimonials"]:
    patch_collection_rules(col, {
        "listRule": "", "viewRule": "",
        "createRule": None, "updateRule": None, "deleteRule": None,
    })

patch_collection_rules("reviews", {
    "listRule": "", "viewRule": "",
    "createRule": "@request.auth.id != \"\"",
    "updateRule": "@request.auth.id = user.id",
    "deleteRule": "@request.auth.id = user.id",
})

for col in ["cart_items", "wishlists", "orders"]:
    patch_collection_rules(col, {
        "listRule": "@request.auth.id = user.id",
        "viewRule": "@request.auth.id = user.id",
        "createRule": "@request.auth.id != \"\"",
        "updateRule": "@request.auth.id = user.id",
        "deleteRule": "@request.auth.id = user.id",
    })

patch_collection_rules("order_items", {
    "listRule": "@request.auth.id = order.user.id",
    "viewRule": "@request.auth.id = order.user.id",
    "createRule": "@request.auth.id != \"\"",
    "updateRule": None, "deleteRule": None,
})

# --- CATEGORIES ---
categories = [
    {"name": "Smartphones", "slug": "smartphones", "description": "Latest flagship and mid-range smartphones", "sort_order": 1, "active": True},
    {"name": "Laptops", "slug": "laptops", "description": "Powerful laptops for work and play", "sort_order": 2, "active": True},
    {"name": "Audio", "slug": "audio", "description": "Headphones, earbuds, and speakers", "sort_order": 3, "active": True},
    {"name": "Wearables", "slug": "wearables", "description": "Smartwatches and fitness trackers", "sort_order": 4, "active": True},
    {"name": "Gaming", "slug": "gaming", "description": "Consoles, controllers, and gaming gear", "sort_order": 5, "active": True},
    {"name": "Accessories", "slug": "accessories", "description": "Chargers, cases, cables, and more", "sort_order": 6, "active": True},
]

cat_ids = {}
for cat in categories:
    existing = find_by_slug("categories", cat["slug"])
    if existing:
        cat_ids[cat["slug"]] = existing["id"]
        print(f"  Category (exists): {cat['name']} -> {existing['id']}")
    else:
        result = post("categories", cat)
        if result:
            cat_ids[cat["slug"]] = result["id"]
            print(f"  Category: {cat['name']} -> {result['id']}")

# --- PRODUCTS ---
products = [
    # Smartphones
    {"name": "Galaxy S24 Ultra", "slug": "galaxy-s24-ultra", "description": "Samsung's flagship with titanium frame, 200MP camera, and S Pen. The ultimate productivity phone.", "price": 1299, "compare_at_price": 1499, "category": cat_ids.get("smartphones",""), "featured": True, "active": True, "stock": 45, "sku": "SM-S928B"},
    {"name": "iPhone 16 Pro Max", "slug": "iphone-16-pro-max", "description": "Apple's most powerful iPhone with A18 Pro chip, 48MP camera system, and titanium design.", "price": 1399, "compare_at_price": 0, "category": cat_ids.get("smartphones",""), "featured": True, "active": True, "stock": 32, "sku": "APL-IP16PM"},
    {"name": "Pixel 9 Pro", "slug": "pixel-9-pro", "description": "Google's smartest phone with Tensor G4, incredible AI photography, and 7 years of updates.", "price": 999, "compare_at_price": 1099, "category": cat_ids.get("smartphones",""), "featured": False, "active": True, "stock": 28, "sku": "GOO-PX9P"},
    {"name": "OnePlus 13", "slug": "oneplus-13", "description": "Flagship killer with Snapdragon 8 Elite, 6000mAh battery, and Hasselblad camera.", "price": 899, "compare_at_price": 0, "category": cat_ids.get("smartphones",""), "featured": False, "active": True, "stock": 60, "sku": "OP13-5G"},

    # Laptops
    {"name": "MacBook Air M4", "slug": "macbook-air-m4", "description": "Incredibly thin, silent, and all-day battery. The M4 chip makes everything fly.", "price": 1299, "compare_at_price": 0, "category": cat_ids.get("laptops",""), "featured": True, "active": True, "stock": 25, "sku": "APL-MBA-M4"},
    {"name": "ThinkPad X1 Carbon Gen 12", "slug": "thinkpad-x1-carbon-gen12", "description": "The business ultrabook. Legendary keyboard, MIL-STD durability, 14-inch 2.8K OLED.", "price": 1649, "compare_at_price": 1899, "category": cat_ids.get("laptops",""), "featured": False, "active": True, "stock": 18, "sku": "LEN-X1C12"},
    {"name": "ASUS ROG Zephyrus G16", "slug": "rog-zephyrus-g16", "description": "Slim gaming laptop with RTX 4070, 240Hz OLED, and vapor chamber cooling.", "price": 1799, "compare_at_price": 0, "category": cat_ids.get("laptops",""), "featured": False, "active": True, "stock": 12, "sku": "ASUS-ZG16"},

    # Audio
    {"name": "AirPods Pro 3", "slug": "airpods-pro-3", "description": "Active noise cancellation, adaptive audio, and personalized spatial audio with head tracking.", "price": 249, "compare_at_price": 279, "category": cat_ids.get("audio",""), "featured": True, "active": True, "stock": 120, "sku": "APL-APP3"},
    {"name": "Sony WH-1000XM6", "slug": "sony-wh1000xm6", "description": "Industry-leading noise cancellation with 40-hour battery and LDAC hi-res audio.", "price": 349, "compare_at_price": 399, "category": cat_ids.get("audio",""), "featured": True, "active": True, "stock": 55, "sku": "SNY-XM6"},
    {"name": "JBL Charge 6", "slug": "jbl-charge-6", "description": "Portable Bluetooth speaker with powerful bass, IP67 waterproofing, and 24-hour battery.", "price": 179, "compare_at_price": 0, "category": cat_ids.get("audio",""), "featured": False, "active": True, "stock": 80, "sku": "JBL-CH6"},

    # Wearables
    {"name": "Apple Watch Ultra 3", "slug": "apple-watch-ultra-3", "description": "The most rugged Apple Watch with dual-frequency GPS, depth gauge, and 72-hour battery.", "price": 799, "compare_at_price": 0, "category": cat_ids.get("wearables",""), "featured": True, "active": True, "stock": 30, "sku": "APL-AWU3"},
    {"name": "Galaxy Watch 7", "slug": "galaxy-watch-7", "description": "Advanced health monitoring with BioActive sensor, sleep coaching, and Wear OS.", "price": 329, "compare_at_price": 399, "category": cat_ids.get("wearables",""), "featured": False, "active": True, "stock": 45, "sku": "SM-GW7"},
    {"name": "Oura Ring 4", "slug": "oura-ring-4", "description": "Smart ring with advanced sleep tracking, readiness score, and titanium construction.", "price": 349, "compare_at_price": 0, "category": cat_ids.get("wearables",""), "featured": False, "active": True, "stock": 22, "sku": "OUR-R4"},

    # Gaming
    {"name": "PS5 Pro", "slug": "ps5-pro", "description": "Enhanced PlayStation with ray tracing, 2TB SSD, and improved GPU for 4K gaming.", "price": 699, "compare_at_price": 0, "category": cat_ids.get("gaming",""), "featured": True, "active": True, "stock": 15, "sku": "SNY-PS5P"},
    {"name": "Xbox Elite Controller Series 3", "slug": "xbox-elite-controller-3", "description": "Pro-grade controller with adjustable tension, magnetic modules, and custom profiles.", "price": 179, "compare_at_price": 0, "category": cat_ids.get("gaming",""), "featured": False, "active": True, "stock": 65, "sku": "MS-XEC3"},
    {"name": "Steam Deck OLED", "slug": "steam-deck-oled", "description": "Handheld PC gaming with HDR OLED display, 90Hz refresh, and 12-hour battery.", "price": 549, "compare_at_price": 0, "category": cat_ids.get("gaming",""), "featured": True, "active": True, "stock": 20, "sku": "VAL-SDO"},

    # Accessories
    {"name": "Anker 737 Power Bank", "slug": "anker-737-power-bank", "description": "24,000mAh portable charger with 140W USB-C output. Charge a MacBook in under 2 hours.", "price": 149, "compare_at_price": 179, "category": cat_ids.get("accessories",""), "featured": False, "active": True, "stock": 200, "sku": "ANK-A737"},
    {"name": "MagSafe Charger 3-in-1", "slug": "magsafe-charger-3in1", "description": "Charge iPhone, Apple Watch, and AirPods simultaneously with perfect alignment.", "price": 129, "compare_at_price": 0, "category": cat_ids.get("accessories",""), "featured": False, "active": True, "stock": 150, "sku": "APL-MS3N1"},
    {"name": "Nomad Leather Case", "slug": "nomad-leather-case", "description": "Premium Horween leather case that develops a beautiful patina over time.", "price": 49, "compare_at_price": 0, "category": cat_ids.get("accessories",""), "featured": False, "active": True, "stock": 300, "sku": "NOM-LC"},
]

prod_ids = {}
for prod in products:
    existing = find_by_slug("products", prod["slug"])
    if existing:
        prod_ids[prod["slug"]] = existing["id"]
        print(f"  Product (exists): {prod['name']} -> {existing['id']}")
    else:
        result = post("products", prod)
        if result:
            prod_ids[prod["slug"]] = result["id"]
            print(f"  Product: {prod['name']} -> {result['id']}")

# --- BANNERS ---
banners = [
    {"title": "Next-Gen Smartphones Are Here", "subtitle": "Galaxy S24 Ultra & iPhone 16 Pro — trade in and save up to $500", "link_url": "/products?category=smartphones", "sort_order": 1, "active": True},
    {"title": "MacBook Air M4", "subtitle": "All-day battery. All-night power. Starting at $1,299", "link_url": "/products/macbook-air-m4", "sort_order": 2, "active": True},
    {"title": "Level Up Your Audio", "subtitle": "Sony XM6 & AirPods Pro 3 — save up to 15% this week", "link_url": "/products?category=audio", "sort_order": 3, "active": True},
    {"title": "Free Shipping on Orders $99+", "subtitle": "Shop accessories and get free express delivery", "link_url": "/products?category=accessories", "sort_order": 4, "active": True},
]

for b in banners:
    result = post("banners", b)
    if result:
        print(f"  Banner: {b['title']}")

# --- TESTIMONIALS ---
testimonials = [
    {"name": "Sarah Chen", "role": "Software Engineer", "body": "Found my dream laptop here. The MacBook Air M4 is insanely fast and the battery lasts all day. Shipping was lightning fast too!", "rating": 5, "sort_order": 1, "active": True},
    {"name": "Marcus Rodriguez", "role": "Content Creator", "body": "The Sony WH-1000XM6 noise cancellation is unreal. I can edit videos in a crowded coffee shop and hear zero background noise. Worth every penny.", "rating": 5, "sort_order": 2, "active": True},
    {"name": "Aisha Patel", "role": "Fitness Coach", "body": "Apple Watch Ultra 3 is a game-changer for my clients. The health metrics are incredibly accurate and the battery actually lasts through a full triathlon.", "rating": 5, "sort_order": 3, "active": True},
    {"name": "Jake Thompson", "role": "Game Developer", "body": "Steam Deck OLED runs my indie games flawlessly. The screen is gorgeous and the controls feel premium. Best handheld I've ever owned.", "rating": 4, "sort_order": 4, "active": True},
    {"name": "Emily Nakamura", "role": "UX Designer", "body": "The ThinkPad X1 Carbon keyboard is unmatched. I switched from a MacBook and haven't looked back. Plus the OLED screen is stunning for design work.", "rating": 4, "sort_order": 5, "active": True},
]

for t in testimonials:
    result = post("testimonials", t)
    if result:
        print(f"  Testimonial: {t['name']}")

print("\n=== SEED COMPLETE ===")
print(f"Categories: {len(cat_ids)}")
print(f"Products: {len(prod_ids)}")
print(f"Banners: {len(banners)}")
print(f"Testimonials: {len(testimonials)}")
