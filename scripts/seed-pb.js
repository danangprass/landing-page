import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

async function auth() {
  await pb.admins.authWithPassword('admin@example.com', 'password');
  console.log('Authenticated as admin');
}

async function createCollections() {
  const collections = [
    {
      name: 'categories',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, options: { max: 100 } },
        { name: 'description', type: 'text', required: false },
        { name: 'sort_order', type: 'number', required: true },
        { name: 'active', type: 'bool', required: true },
      ],
    },
    {
      name: 'products',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'description', type: 'text', required: false },
        { name: 'price', type: 'number', required: true },
        { name: 'compare_at_price', type: 'number', required: false },
        { name: 'category', type: 'relation', required: true, options: { collectionId: 'categories', maxSelect: 1 } },
        { name: 'featured', type: 'bool', required: true },
        { name: 'active', type: 'bool', required: true },
        { name: 'stock', type: 'number', required: true },
        { name: 'sku', type: 'text', required: true },
        { name: 'image', type: 'file', required: false, options: { maxSelect: 1, maxSize: 5242880, mimeTypes: ['image/*'] } },
      ],
    },
    {
      name: 'banners',
      type: 'base',
      schema: [
        { name: 'title', type: 'text', required: true },
        { name: 'subtitle', type: 'text', required: false },
        { name: 'link_url', type: 'text', required: false },
        { name: 'sort_order', type: 'number', required: true },
        { name: 'active', type: 'bool', required: true },
        { name: 'image', type: 'file', required: false },
      ],
    },
    {
      name: 'testimonials',
      type: 'base',
      schema: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text', required: false },
        { name: 'body', type: 'text', required: true },
        { name: 'rating', type: 'number', required: true },
        { name: 'sort_order', type: 'number', required: true },
        { name: 'active', type: 'bool', required: true },
        { name: 'avatar', type: 'file', required: false },
      ],
    },
    {
      name: 'cart_items',
      type: 'base',
      schema: [
        { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_' } },
        { name: 'product', type: 'relation', required: true, options: { collectionId: 'products' } },
        { name: 'quantity', type: 'number', required: true },
      ],
    },
    {
      name: 'wishlists',
      type: 'base',
      schema: [
        { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_' } },
        { name: 'product', type: 'relation', required: true, options: { collectionId: 'products' } },
      ],
    },
    {
      name: 'orders',
      type: 'base',
      schema: [
        { name: 'user', type: 'relation', required: true, options: { collectionId: '_pb_users_auth_' } },
        { name: 'status', type: 'select', required: true, options: { values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] } },
        { name: 'total', type: 'number', required: true },
        { name: 'shipping_address', type: 'text', required: false },
        { name: 'billing_address', type: 'text', required: false },
      ],
    },
    {
      name: 'order_items',
      type: 'base',
      schema: [
        { name: 'order', type: 'relation', required: true, options: { collectionId: 'orders' } },
        { name: 'product', type: 'relation', required: true, options: { collectionId: 'products' } },
        { name: 'quantity', type: 'number', required: true },
        { name: 'price', type: 'number', required: true },
      ],
    },
  ];

  for (const col of collections) {
    try {
      const existing = await pb.collections.getOne(col.name);
      console.log(`Collection '${col.name}' already exists, skipping.`);
      continue;
    } catch {
      // collection does not exist, create it
    }

    try {
      await pb.collections.create(col);
      console.log(`Created collection: ${col.name}`);
    } catch (err) {
      console.error(`Failed to create collection '${col.name}':`, err.message);
      throw err;
    }
  }
}

async function seedCategories() {
  const list = await pb.collection('categories').getFullList();
  if (list.length > 0) {
    console.log('Categories already seeded, skipping.');
    return;
  }

  const data = [
    { name: 'Smartphones', slug: 'smartphones', description: 'Latest smartphones', sort_order: 1, active: true },
    { name: 'Laptops', slug: 'laptops', description: 'Powerful laptops', sort_order: 2, active: true },
    { name: 'Audio', slug: 'audio', description: 'Headphones and speakers', sort_order: 3, active: true },
    { name: 'Wearables', slug: 'wearables', description: 'Smartwatches and fitness trackers', sort_order: 4, active: true },
    { name: 'Gaming', slug: 'gaming', description: 'Gaming gear', sort_order: 5, active: true },
    { name: 'Accessories', slug: 'accessories', description: 'Cables, chargers, and more', sort_order: 6, active: true },
  ];

  for (const item of data) {
    await pb.collection('categories').create(item);
  }
  console.log('Seeded categories');
}

async function seedProducts() {
  const list = await pb.collection('products').getFullList();
  if (list.length > 0) {
    console.log('Products already seeded, skipping.');
    return;
  }

  const categories = await pb.collection('categories').getFullList();
  const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]));

  const data = [
    { name: 'iPhone 15 Pro', slug: 'iphone-15-pro', description: 'Titanium design. A17 Pro chip. Advanced camera system.', price: 99900, compare_at_price: 109900, category: catMap['smartphones'], featured: true, active: true, stock: 25, sku: 'APL-IP15P-001' },
    { name: 'MacBook Air M3', slug: 'macbook-air-m3', description: 'Light. Speed. M3 chip. Up to 18 hours battery life.', price: 129900, compare_at_price: 0, category: catMap['laptops'], featured: true, active: true, stock: 15, sku: 'APL-MBA3-001' },
    { name: 'AirPods Pro 2', slug: 'airpods-pro-2', description: 'Adaptive Audio. Personalized Volume. Conversation Awareness.', price: 24900, compare_at_price: 29900, category: catMap['audio'], featured: true, active: true, stock: 50, sku: 'APL-APP2-001' },
    { name: 'Apple Watch Ultra 2', slug: 'apple-watch-ultra-2', description: 'The most rugged and capable Apple Watch ever.', price: 79900, compare_at_price: 0, category: catMap['wearables'], featured: true, active: true, stock: 10, sku: 'APL-AWU2-001' },
    { name: 'Samsung Galaxy S24', slug: 'samsung-galaxy-s24', description: 'Galaxy AI is here. Intelligent camera. Epic display.', price: 89900, compare_at_price: 0, category: catMap['smartphones'], featured: false, active: true, stock: 20, sku: 'SAM-GS24-001' },
    { name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', description: 'Industry-leading noise cancellation. 30-hour battery.', price: 39900, compare_at_price: 0, category: catMap['audio'], featured: false, active: true, stock: 30, sku: 'SNY-WH5-001' },
  ];

  for (const item of data) {
    await pb.collection('products').create(item);
  }
  console.log('Seeded products');
}

async function seedBanners() {
  const list = await pb.collection('banners').getFullList();
  if (list.length > 0) return;

  await pb.collection('banners').create({
    title: 'New Arrivals',
    subtitle: 'Discover the latest tech',
    link_url: '/products',
    sort_order: 1,
    active: true,
  });
  console.log('Seeded banners');
}

async function seedTestimonials() {
  const list = await pb.collection('testimonials').getFullList();
  if (list.length > 0) return;

  const data = [
    { name: 'Sarah M.', role: 'Verified Buyer', body: 'Fast shipping and the product arrived in perfect condition. Highly recommend!', rating: 5, sort_order: 1, active: true },
    { name: 'James L.', role: 'Tech Enthusiast', body: 'Best prices I found online. The customer service was outstanding.', rating: 5, sort_order: 2, active: true },
    { name: 'Emily R.', role: 'Repeat Customer', body: 'This is my third order. Consistently great experience every time.', rating: 4, sort_order: 3, active: true },
  ];

  for (const item of data) {
    await pb.collection('testimonials').create(item);
  }
  console.log('Seeded testimonials');
}

async function main() {
  try {
    await auth();
    await createCollections();
    await seedCategories();
    await seedProducts();
    await seedBanners();
    await seedTestimonials();
    console.log('\n✅ Seed complete!');
  } catch (err) {
    console.error('\n❌ Seed failed:', err.message);
    process.exit(1);
  }
}

main();
