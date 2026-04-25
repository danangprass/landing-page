export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice?: number;
  description: string;
  shortDescription: string;
  images: string[];
  colors?: { name: string; hex: string }[];
  storage?: string[];
  rating: number;
  reviewCount: number;
  badge?: 'new' | 'sale' | 'limited';
  specs: { label: string; value: string }[];
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    slug: 'prophone-16-pro',
    name: 'ProPhone 16 Pro',
    category: 'Phones',
    categorySlug: 'phones',
    price: 1199,
    description: 'The most advanced ProPhone ever. Featuring a titanium design, the A18 Pro chip, and a groundbreaking camera system for next-level photos and videos.',
    shortDescription: 'Titanium. So strong. So light. So Pro.',
    images: ['/images/phone-1.webp', '/images/phone-1-back.webp'],
    colors: [
      { name: 'Natural Titanium', hex: '#8A8A8F' },
      { name: 'Blue Titanium', hex: '#394252' },
      { name: 'White Titanium', hex: '#E3E0DC' },
      { name: 'Black Titanium', hex: '#1D1D1F' }
    ],
    storage: ['256GB', '512GB', '1TB'],
    rating: 4.8,
    reviewCount: 2847,
    badge: 'new',
    specs: [
      { label: 'Display', value: '6.7" Super Retina XDR' },
      { label: 'Chip', value: 'A18 Pro' },
      { label: 'Camera', value: '48MP Main + 12MP Ultra Wide + 12MP Telephoto' },
      { label: 'Battery', value: 'Up to 29 hours video playback' },
      { label: 'Weight', value: '199g' }
    ],
    inStock: true
  },
  {
    id: '2',
    slug: 'prophone-16',
    name: 'ProPhone 16',
    category: 'Phones',
    categorySlug: 'phones',
    price: 899,
    originalPrice: 999,
    description: 'A total powerhouse. Camera Control gives you an easier way to quickly access camera tools. The A18 chip delivers big performance. And Battery life is significantly extended.',
    shortDescription: 'Built for Apple Intelligence.',
    images: ['/images/phone-2.webp', '/images/phone-2-back.webp'],
    colors: [
      { name: 'Ultramarine', hex: '#3B5DAE' },
      { name: 'Teal', hex: '#5A8F7B' },
      { name: 'Pink', hex: '#D4A0A0' },
      { name: 'White', hex: '#F5F5F0' },
      { name: 'Black', hex: '#1D1D1F' }
    ],
    storage: ['128GB', '256GB', '512GB'],
    rating: 4.6,
    reviewCount: 1523,
    badge: 'sale',
    specs: [
      { label: 'Display', value: '6.1" Super Retina XDR' },
      { label: 'Chip', value: 'A18' },
      { label: 'Camera', value: '48MP Main + 12MP Ultra Wide' },
      { label: 'Battery', value: 'Up to 22 hours video playback' },
      { label: 'Weight', value: '170g' }
    ],
    inStock: true
  },
  {
    id: '3',
    slug: 'probook-air-m4',
    name: 'ProBook Air M4',
    category: 'Laptops',
    categorySlug: 'laptops',
    price: 1299,
    description: 'Strikingly thin. Incredibly powerful. The ProBook Air with M4 brings next-level performance and all-day battery life to the world\'s most popular laptop.',
    shortDescription: 'Lean. Mean. M4 machine.',
    images: ['/images/laptop-1.webp', '/images/laptop-1-open.webp'],
    colors: [
      { name: 'Midnight', hex: '#1D1D1F' },
      { name: 'Starlight', hex: '#F0E4D4' },
      { name: 'Sky Blue', hex: '#89B4C8' },
      { name: 'Space Gray', hex: '#6E6E73' }
    ],
    storage: ['256GB', '512GB', '1TB'],
    rating: 4.9,
    reviewCount: 3102,
    badge: 'new',
    specs: [
      { label: 'Display', value: '13.6" Liquid Retina' },
      { label: 'Chip', value: 'M4' },
      { label: 'Memory', value: '16GB unified' },
      { label: 'Battery', value: 'Up to 18 hours' },
      { label: 'Weight', value: '1.24 kg' }
    ],
    inStock: true
  },
  {
    id: '4',
    slug: 'probook-pro-m4',
    name: 'ProBook Pro M4',
    category: 'Laptops',
    categorySlug: 'laptops',
    price: 1999,
    description: 'The most advanced ProBook Pro ever. Powered by M4 Pro and M4 Max, designed for the most demanding workflows.',
    shortDescription: 'The ultimate pro laptop.',
    images: ['/images/laptop-2.webp', '/images/laptop-2-open.webp'],
    colors: [
      { name: 'Space Black', hex: '#1D1D1F' },
      { name: 'Silver', hex: '#C0C0C0' }
    ],
    storage: ['512GB', '1TB', '2TB'],
    rating: 4.7,
    reviewCount: 1845,
    specs: [
      { label: 'Display', value: '14.2" Liquid Retina XDR' },
      { label: 'Chip', value: 'M4 Pro' },
      { label: 'Memory', value: '24GB unified' },
      { label: 'Battery', value: 'Up to 17 hours' },
      { label: 'Weight', value: '1.55 kg' }
    ],
    inStock: true
  },
  {
    id: '5',
    slug: 'prowatch-ultra-3',
    name: 'ProWatch Ultra 3',
    category: 'Wearables',
    categorySlug: 'wearables',
    price: 799,
    description: 'The most rugged and capable ProWatch ever. Designed for endurance athletes, outdoor adventurers, and water sports enthusiasts.',
    shortDescription: 'Adventure awaits.',
    images: ['/images/watch-1.webp', '/images/watch-1-side.webp'],
    colors: [
      { name: 'Natural', hex: '#C2A66B' },
      { name: 'Black', hex: '#1D1D1F' }
    ],
    rating: 4.8,
    reviewCount: 987,
    badge: 'limited',
    specs: [
      { label: 'Case', value: '49mm titanium' },
      { label: 'Display', value: 'OLED always-on' },
      { label: 'Battery', value: 'Up to 72 hours' },
      { label: 'Water', value: '100m depth rating' },
      { label: 'Weight', value: '62g' }
    ],
    inStock: true
  },
  {
    id: '6',
    slug: 'prowatch-10',
    name: 'ProWatch 10',
    category: 'Wearables',
    categorySlug: 'wearables',
    price: 449,
    description: 'Thinner. Lighter. Tougher. The ProWatch 10 features a stunning new design and powerful health features.',
    shortDescription: 'Thinner. Lighter. Smarter.',
    images: ['/images/watch-2.webp', '/images/watch-2-side.webp'],
    colors: [
      { name: 'Jet Black', hex: '#1D1D1F' },
      { name: 'Rose Gold', hex: '#B76E79' },
      { name: 'Silver', hex: '#C0C0C0' }
    ],
    rating: 4.5,
    reviewCount: 2134,
    specs: [
      { label: 'Case', value: '42mm or 46mm aluminum' },
      { label: 'Display', value: 'OLED always-on' },
      { label: 'Battery', value: 'Up to 18 hours' },
      { label: 'Water', value: '50m depth rating' },
      { label: 'Weight', value: '36g' }
    ],
    inStock: true
  },
  {
    id: '7',
    slug: 'probuds-pro-3',
    name: 'ProBuds Pro 3',
    category: 'Audio',
    categorySlug: 'audio',
    price: 299,
    description: 'Adaptive Audio. Personalized Spatial Audio. And an industry-leading hearing health experience. The ultimate ProBuds.',
    shortDescription: 'Intelligent noise control.',
    images: ['/images/buds-1.webp', '/images/buds-1-case.webp'],
    colors: [
      { name: 'White', hex: '#F5F5F0' },
      { name: 'Black', hex: '#1D1D1F' }
    ],
    rating: 4.7,
    reviewCount: 3567,
    specs: [
      { label: 'Chip', value: 'H3' },
      { label: 'ANC', value: 'Active Noise Cancellation' },
      { label: 'Battery', value: '6 hours (30 with case)' },
      { label: 'Spatial Audio', value: 'Personalized with head tracking' },
      { label: 'Weight', value: '5.3g per bud' }
    ],
    inStock: true
  },
  {
    id: '8',
    slug: 'probuds-4',
    name: 'ProBuds 4',
    category: 'Audio',
    categorySlug: 'audio',
    price: 139,
    originalPrice: 179,
    description: 'Rebuilt from the sound up. Featuring an updated design, enhanced bass, and up to 6 hours of listening time.',
    shortDescription: 'New sound. New shape. New price.',
    images: ['/images/buds-2.webp', '/images/buds-2-case.webp'],
    colors: [
      { name: 'White', hex: '#F5F5F0' },
      { name: 'Yellow', hex: '#F5D04E' },
      { name: 'Purple', hex: '#9B6FAE' }
    ],
    rating: 4.3,
    reviewCount: 1234,
    badge: 'sale',
    specs: [
      { label: 'Chip', value: 'H2' },
      { label: 'ANC', value: 'Active Noise Cancellation' },
      { label: 'Battery', value: '5 hours (24 with case)' },
      { label: 'Spatial Audio', value: 'Yes' },
      { label: 'Weight', value: '4.3g per bud' }
    ],
    inStock: true
  },
  {
    id: '9',
    slug: 'protv-4k',
    name: 'ProTV 4K',
    category: 'Audio',
    categorySlug: 'audio',
    price: 199,
    description: 'The icons of home cinema. Stream it all in 4K Dolby Vision and Dolby Atmos.',
    shortDescription: 'The icons of home cinema.',
    images: ['/images/tv-1.webp'],
    rating: 4.4,
    reviewCount: 892,
    specs: [
      { label: 'Resolution', value: '4K HDR with Dolby Vision' },
      { label: 'Audio', value: 'Dolby Atmos' },
      { label: 'Storage', value: '128GB' },
      { label: 'Connectivity', value: 'Wi-Fi 6, Gigabit Ethernet' }
    ],
    inStock: true
  },
  {
    id: '10',
    slug: 'procharger-30w',
    name: 'ProCharger 30W',
    category: 'Accessories',
    categorySlug: 'accessories',
    price: 49,
    description: 'Compact and powerful. Fast charge your ProPhone or ProBook with GaN technology.',
    shortDescription: 'Fast. Compact. Efficient.',
    images: ['/images/charger-1.webp'],
    rating: 4.6,
    reviewCount: 567,
    specs: [
      { label: 'Power', value: '30W USB-C' },
      { label: 'Tech', value: 'GaN II' },
      { label: 'Weight', value: '62g' },
      { label: 'Ports', value: '1x USB-C' }
    ],
    inStock: true
  }
];

export const categories = [
  { name: 'Phones', slug: 'phones' },
  { name: 'Laptops', slug: 'laptops' },
  { name: 'Audio', slug: 'audio' },
  { name: 'Wearables', slug: 'wearables' },
  { name: 'Accessories', slug: 'accessories' }
] as const;

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter(p => p.categorySlug === categorySlug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.badge === 'new' || p.badge === 'limited');
}