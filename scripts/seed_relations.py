import json, os, secrets, urllib.request, urllib.error

BASE = "http://localhost:8090"

# Authenticate as superuser
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
        data=payload, headers=HEADERS, method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  ERROR: {e.read().decode()}")
        return None

def get_ids(collection):
    req = urllib.request.Request(
        f"{BASE}/api/collections/{collection}/records?perPage=200",
        headers=HEADERS
    )
    with urllib.request.urlopen(req) as resp:
        items = json.loads(resp.read())["items"]
        res = {}
        for r in items:
            if "name" not in r:
                print(f"DEBUG: missing name in {collection} record:", r)
            else:
                res[r["name"]] = r["id"]
        return res

def get_user_ids():
    req = urllib.request.Request(
        f"{BASE}/api/collections/users/records?perPage=200",
        headers=HEADERS
    )
    with urllib.request.urlopen(req) as resp:
        return {r["name"]: r["id"] for r in json.loads(resp.read())["items"]}

users = get_user_ids()
required_users = [
    "Sarah Chen", "Emily Nakamura", "Alex Kowalski", "Marcus Rodriguez", 
    "Aisha Patel", "Jake Thompson", "Priya Sharma", "David Kim"
]
for p in required_users:
    if p not in users:
        email = p.lower().replace(" ", ".") + "@example.com"
        print(f"Creating user {p}")
        secure_password = secrets.token_urlsafe(16)
        res = post("users", {"email": email, "emailVisibility": True, "password": secure_password, "passwordConfirm": secure_password, "name": p})
        if res:
            print(f"  → password: {secure_password}  (save this — cannot be retrieved later)")
            users[p] = res["id"]
products = get_ids("products")
print(f"Users: {len(users)}, Products: {len(products)}")

# --- REVIEWS ---
reviews = [
    {"product": products["Galaxy S24 Ultra"], "user": users["Sarah Chen"], "rating": 5, "title": "Best phone I've ever owned", "body": "The camera is insane and the S Pen is actually useful. Coming from an iPhone, I'm not looking back."},
    {"product": products["iPhone 16 Pro Max"], "user": users["Emily Nakamura"], "rating": 5, "title": "Apple nailed it again", "body": "The A18 Pro chip is ridiculously fast. Battery easily lasts a full day of heavy use."},
    {"product": products["Pixel 9 Pro"], "user": users["Alex Kowalski"], "rating": 4, "title": "Amazing camera, solid phone", "body": "Tensor G4 handles everything I throw at it. The AI photo features are genuinely useful."},
    {"product": products["MacBook Air M4"], "user": users["Sarah Chen"], "rating": 5, "title": "Perfect laptop for developers", "body": "Silent, fast, and the battery lasts through an entire workday plus evening Netflix."},
    {"product": products["ThinkPad X1 Carbon Gen 12"], "user": users["Emily Nakamura"], "rating": 4, "title": "Best keyboard on any laptop", "body": "The OLED screen is gorgeous and the keyboard is legendary. Only wish it had better battery life."},
    {"product": products["AirPods Pro 3"], "user": users["Marcus Rodriguez"], "rating": 5, "title": "ANC is on another level", "body": "Adaptive audio is brilliant. It automatically adjusts between transparency and noise cancellation."},
    {"product": products["Sony WH-1000XM6"], "user": users["Marcus Rodriguez"], "rating": 5, "title": "King of noise cancelling", "body": "40 hours of battery, LDAC support, and the most comfortable over-ear fit I've experienced."},
    {"product": products["Apple Watch Ultra 3"], "user": users["Aisha Patel"], "rating": 5, "title": "The fitness coach on your wrist", "body": "Accurate heart rate, great sleep tracking, and it survived my Ironman training no problem."},
    {"product": products["PS5 Pro"], "user": users["Jake Thompson"], "rating": 4, "title": "Ray tracing finally makes sense", "body": "4K with ray tracing at stable 60fps is finally a reality. Worth it if you have a good TV."},
    {"product": products["Steam Deck OLED"], "user": users["Jake Thompson"], "rating": 5, "title": "Best handheld gaming device", "body": "The OLED screen is gorgeous. Runs my entire Steam library. Battery life is surprisingly good."},
    {"product": products["JBL Charge 6"], "user": users["Priya Sharma"], "rating": 4, "title": "Great party speaker", "body": "Took it to the beach — waterproofing works great. Sound fills a big room easily."},
    {"product": products["Anker 737 Power Bank"], "user": users["David Kim"], "rating": 4, "title": "Charges my MacBook Pro!", "body": "140W output is no joke. Actually charges my laptop fast. A bit heavy but worth carrying."},
]

for r in reviews:
    result = post("reviews", r)
    if result:
        print(f"  Review: {r['title']}")

# --- ORDERS + ORDER ITEMS ---
orders_data = [
    {"user": users["Sarah Chen"], "status": "delivered", "total": 1548,
     "shipping_address": "123 Maple St, San Francisco, CA 94102",
     "billing_address": "123 Maple St, San Francisco, CA 94102",
     "items": [("MacBook Air M4", 1299, 1), ("AirPods Pro 3", 249, 1)]},
    {"user": users["Marcus Rodriguez"], "status": "delivered", "total": 349,
     "shipping_address": "456 Oak Ave, Austin, TX 78701",
     "billing_address": "456 Oak Ave, Austin, TX 78701",
     "items": [("Sony WH-1000XM6", 349, 1)]},
    {"user": users["Aisha Patel"], "status": "shipped", "total": 799,
     "shipping_address": "789 Elm Dr, Denver, CO 80201",
     "billing_address": "789 Elm Dr, Denver, CO 80201",
     "items": [("Apple Watch Ultra 3", 799, 1)]},
    {"user": users["Jake Thompson"], "status": "processing", "total": 1248,
     "shipping_address": "321 Pine Ln, Seattle, WA 98101",
     "billing_address": "321 Pine Ln, Seattle, WA 98101",
     "items": [("PS5 Pro", 699, 1), ("Steam Deck OLED", 549, 1)]},
    {"user": users["Emily Nakamura"], "status": "delivered", "total": 1649,
     "shipping_address": "654 Birch Rd, Portland, OR 97201",
     "billing_address": "654 Birch Rd, Portland, OR 97201",
     "items": [("ThinkPad X1 Carbon Gen 12", 1649, 1)]},
    {"user": users["Priya Sharma"], "status": "pending", "total": 557,
     "shipping_address": "987 Cedar Blvd, Chicago, IL 60601",
     "billing_address": "987 Cedar Blvd, Chicago, IL 60601",
     "items": [("JBL Charge 6", 179, 1), ("Galaxy Watch 7", 329, 1), ("Nomad Leather Case", 49, 1)]},
    {"user": users["David Kim"], "status": "delivered", "total": 1299,
     "shipping_address": "111 Walnut Ct, NYC, NY 10001",
     "billing_address": "111 Walnut Ct, NYC, NY 10001",
     "items": [("Galaxy S24 Ultra", 1299, 1)]},
    {"user": users["Alex Kowalski"], "status": "shipped", "total": 1148,
     "shipping_address": "222 Spruce Way, Boston, MA 02101",
     "billing_address": "222 Spruce Way, Boston, MA 02101",
     "items": [("Pixel 9 Pro", 999, 1), ("Anker 737 Power Bank", 149, 1), ("MagSafe Charger 3-in-1", 129, 1)]},
]

for o in orders_data:
    result = post("orders", {
        "user": o["user"], "status": o["status"], "total": o["total"],
        "shipping_address": o["shipping_address"], "billing_address": o["billing_address"]
    })
    if result:
        order_id = result["id"]
        print(f"  Order: {o['status']} ${o['total']} -> {order_id}")
        for item_name, price, qty in o["items"]:
            if item_name in products:
                post("order_items", {"order": order_id, "product": products[item_name], "quantity": qty, "price": price})

# --- CART ITEMS ---
cart_data = [
    (users["Sarah Chen"], "Oura Ring 4", 1),
    (users["Jake Thompson"], "Xbox Elite Controller Series 3", 2),
    (users["Priya Sharma"], "MacBook Air M4", 1),
    (users["David Kim"], "Sony WH-1000XM6", 1),
]

for user, prod, qty in cart_data:
    result = post("cart_items", {"user": user, "product": products[prod], "quantity": qty})
    if result:
        print(f"  Cart: {prod} x{qty}")

# --- WISHLISTS ---
wishlist_data = [
    (users["Sarah Chen"], "Steam Deck OLED"),
    (users["Marcus Rodriguez"], "MacBook Air M4"),
    (users["Aisha Patel"], "Galaxy S24 Ultra"),
    (users["Jake Thompson"], "ASUS ROG Zephyrus G16"),
    (users["Emily Nakamura"], "AirPods Pro 3"),
    (users["David Kim"], "PS5 Pro"),
]

for user, prod in wishlist_data:
    result = post("wishlists", {"user": user, "product": products[prod]})
    if result:
        print(f"  Wishlist: {prod}")

print("\n=== ALL SEED DATA COMPLETE ===")