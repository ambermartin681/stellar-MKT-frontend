import type { Listing, PaginatedListings } from '../types';

export const MOCK_LISTINGS: Listing[] = [
  // ── Electronics ──────────────────────────────────────────────────────────
  {
    id: 'mock-1',
    title: 'Sony WH-1000XM5 Headphones',
    description:
      'Industry-leading noise cancelling wireless headphones with 30-hour battery life and crystal-clear hands-free calling.',
    priceXLM: 850,
    seller: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQR',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
    category: 'Electronics',
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-5',
    title: 'MacBook Pro M3 14"',
    description:
      'Apple MacBook Pro 14-inch with M3 chip, 16GB RAM, 512GB SSD. Space Gray. AppleCare+ until 2026. Barely used.',
    priceXLM: 12000,
    seller: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQR',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
    category: 'Electronics',
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-9',
    title: 'DJI Mini 4 Pro Drone',
    description:
      'Compact 4K/60fps drone with tri-directional obstacle sensing, 34-min flight time, and RC-N2 remote. Flown under 5 hours.',
    priceXLM: 4200,
    seller: 'GXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNO',
    imageUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=300&fit=crop',
    category: 'Electronics',
    isActive: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-10',
    title: 'Samsung 65" OLED 4K TV',
    description:
      'Samsung S95C 65-inch QD-OLED TV. Infinite contrast, 144Hz gaming mode, Dolby Atmos. Purchased 6 months ago.',
    priceXLM: 9500,
    seller: 'GMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABC',
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=400&h=300&fit=crop',
    category: 'Electronics',
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-11',
    title: 'iPad Pro 12.9" M2 + Apple Pencil',
    description:
      'iPad Pro 12.9-inch M2, 256GB WiFi + Cellular, Space Gray. Includes Apple Pencil 2nd gen and Magic Keyboard folio.',
    priceXLM: 7800,
    seller: 'GHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWX',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop',
    category: 'Electronics',
    isActive: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-12',
    title: 'Mechanical Keyboard — Keychron Q1',
    description:
      'Keychron Q1 Pro QMK/VIA wireless mechanical keyboard. Gateron G Pro Red switches, aluminum body, RGB backlight.',
    priceXLM: 620,
    seller: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQR',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',
    category: 'Electronics',
    isActive: true,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-13',
    title: 'GoPro HERO12 Black',
    description:
      'GoPro HERO12 Black action camera. 5.3K60 video, HyperSmooth 6.0 stabilisation, waterproof to 10m. Includes 3 mounts.',
    priceXLM: 1450,
    seller: 'GXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNO',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=300&fit=crop',
    category: 'Electronics',
    isActive: true,
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ── Clothing ─────────────────────────────────────────────────────────────
  {
    id: 'mock-2',
    title: 'Vintage Leather Jacket',
    description:
      'Genuine brown leather biker jacket, size M. Lightly worn, excellent condition. Classic 80s style with modern fit.',
    priceXLM: 420,
    seller: 'GXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNO',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop',
    category: 'Clothing',
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-7',
    title: 'Nike Air Jordan 1 Retro High',
    description:
      'Nike Air Jordan 1 Retro High OG "Chicago" colorway. Size US 10. Deadstock, never worn. Original box included.',
    priceXLM: 1100,
    seller: 'GMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABC',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
    category: 'Clothing',
    isActive: true,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-14',
    title: 'Supreme Box Logo Hoodie FW23',
    description:
      'Supreme Box Logo Hooded Sweatshirt, Fall/Winter 2023. Size L, Black. Brand new with tags, never worn.',
    priceXLM: 1800,
    seller: 'GHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWX',
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&h=300&fit=crop',
    category: 'Clothing',
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-15',
    title: 'Rolex Submariner Watch',
    description:
      'Rolex Submariner Date 41mm, Oystersteel, black dial and bezel. Ref. 126610LN. Full set with box and papers, 2022.',
    priceXLM: 55000,
    seller: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQR',
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=300&fit=crop',
    category: 'Clothing',
    isActive: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-16',
    title: 'Levi\'s 501 Original Jeans Bundle',
    description:
      'Bundle of 3 pairs of Levi\'s 501 Original jeans. Sizes 32×32. Colors: indigo, black, stone wash. Worn twice each.',
    priceXLM: 280,
    seller: 'GXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNO',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop',
    category: 'Clothing',
    isActive: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-17',
    title: 'Adidas Yeezy Boost 350 V2',
    description:
      'Adidas Yeezy Boost 350 V2 "Zebra" colorway. Size US 9.5. Worn once, excellent condition. Comes with original box.',
    priceXLM: 950,
    seller: 'GMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABC',
    imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=300&fit=crop',
    category: 'Clothing',
    isActive: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ── Art ───────────────────────────────────────────────────────────────────
  {
    id: 'mock-3',
    title: 'Abstract Digital Art Print',
    description:
      'Original digital artwork — "Cosmic Drift" series. High-resolution file (4K) delivered as PNG + PDF certificate of authenticity.',
    priceXLM: 200,
    seller: 'GMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABC',
    imageUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=300&fit=crop',
    category: 'Art',
    isActive: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-6',
    title: 'Hand-Painted Watercolour Set',
    description:
      'Set of 5 original watercolour paintings, 20×30cm each. Nature-inspired series. Signed and ready to frame.',
    priceXLM: 650,
    seller: 'GXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNO',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=300&fit=crop',
    category: 'Art',
    isActive: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-18',
    title: 'Oil Portrait Commission',
    description:
      'Custom oil portrait on canvas (50×70cm). Based on your photo. 3–4 week turnaround. Includes shipping worldwide.',
    priceXLM: 1200,
    seller: 'GHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWX',
    imageUrl: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=300&fit=crop',
    category: 'Art',
    isActive: true,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-19',
    title: 'Generative NFT Collection Pack',
    description:
      '10-piece generative art collection minted on Stellar. Each piece is unique, algorithmically generated from 200+ traits.',
    priceXLM: 3000,
    seller: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQR',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
    category: 'Art',
    isActive: true,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-20',
    title: 'Street Photography Print Bundle',
    description:
      'Bundle of 8 fine-art street photography prints, A3 size, printed on Hahnemühle Photo Rag 308gsm. Signed and numbered.',
    priceXLM: 480,
    seller: 'GXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNO',
    imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop',
    category: 'Art',
    isActive: true,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-21',
    title: 'Ceramic Sculpture — "Flow"',
    description:
      'Hand-thrown stoneware sculpture, 35cm tall. Glazed in ocean blue and white. One-of-a-kind piece, signed on the base.',
    priceXLM: 900,
    seller: 'GMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABC',
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=300&fit=crop',
    category: 'Art',
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ── Services ──────────────────────────────────────────────────────────────
  {
    id: 'mock-4',
    title: 'Full-Stack Web Development',
    description:
      'Professional web development service. React + Node.js + PostgreSQL. Includes design, development, and 30-day support.',
    priceXLM: 3500,
    seller: 'GHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWX',
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
    category: 'Services',
    isActive: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-8',
    title: 'Smart Home Setup Consultation',
    description:
      'Professional smart home installation and configuration. Covers lighting, security cameras, thermostats, and voice assistant integration.',
    priceXLM: 500,
    seller: 'GHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWX',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    category: 'Services',
    isActive: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-22',
    title: 'Logo & Brand Identity Design',
    description:
      'Complete brand identity package: logo (3 concepts), color palette, typography, business card, and brand guidelines PDF.',
    priceXLM: 1800,
    seller: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQR',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop',
    category: 'Services',
    isActive: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-23',
    title: 'Stellar Smart Contract Audit',
    description:
      'Professional security audit for Soroban smart contracts. Includes static analysis, manual review, and detailed report with remediation steps.',
    priceXLM: 6000,
    seller: 'GXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNO',
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop',
    category: 'Services',
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-24',
    title: 'Video Editing & Post-Production',
    description:
      'Professional video editing up to 10 minutes. Color grading, motion graphics, sound design, and subtitle export included.',
    priceXLM: 750,
    seller: 'GMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABC',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop',
    category: 'Services',
    isActive: true,
    createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-25',
    title: 'SEO & Content Strategy',
    description:
      'Full SEO audit + 3-month content strategy. Keyword research, competitor analysis, on-page optimisation, and monthly reporting.',
    priceXLM: 2200,
    seller: 'GHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWX',
    imageUrl: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=300&fit=crop',
    category: 'Services',
    isActive: true,
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-26',
    title: 'Personal Finance Coaching',
    description:
      '4-session personal finance coaching package. Budgeting, crypto portfolio strategy, DeFi basics, and Stellar ecosystem deep-dive.',
    priceXLM: 1100,
    seller: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQR',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
    category: 'Services',
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // ── Other ─────────────────────────────────────────────────────────────────
  {
    id: 'mock-27',
    title: 'Rare Pokémon Card Collection',
    description:
      'Collection of 50 holographic Pokémon cards from Base Set and Jungle. Includes Charizard 1st Edition (PSA 7 graded).',
    priceXLM: 8500,
    seller: 'GXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNO',
    imageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400&h=300&fit=crop',
    category: 'Other',
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-28',
    title: 'Vintage Vinyl Record Bundle',
    description:
      'Bundle of 20 original vinyl records from the 70s and 80s. Rock, jazz, and soul. All in VG+ condition with original sleeves.',
    priceXLM: 600,
    seller: 'GMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABC',
    imageUrl: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=400&h=300&fit=crop',
    category: 'Other',
    isActive: true,
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-29',
    title: 'Lego Technic Bugatti Chiron',
    description:
      'Lego Technic 42083 Bugatti Chiron. Complete set, 3,599 pieces, fully built. Includes original box and instructions.',
    priceXLM: 1350,
    seller: 'GHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWX',
    imageUrl: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=300&fit=crop',
    category: 'Other',
    isActive: true,
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-30',
    title: 'Espresso Machine — De\'Longhi La Specialista',
    description:
      'De\'Longhi La Specialista Arte EC9155MB. Built-in grinder, 15-bar pressure, steam wand. 8 months old, immaculate condition.',
    priceXLM: 2400,
    seller: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQR',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
    category: 'Other',
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-31',
    title: 'Mountain Bike — Trek Marlin 7',
    description:
      'Trek Marlin 7 hardtail mountain bike, size M. 29" wheels, 1×12 drivetrain, hydraulic disc brakes. 2023 model, excellent condition.',
    priceXLM: 3200,
    seller: 'GXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNO',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    category: 'Other',
    isActive: true,
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mock-32',
    title: 'Signed Football — Lionel Messi',
    description:
      'Official match ball signed by Lionel Messi during the 2023 Inter Miami season. Comes with certificate of authenticity.',
    priceXLM: 15000,
    seller: 'GMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZABC',
    imageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&h=300&fit=crop',
    category: 'Other',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function getMockListings(params?: { category?: string }): PaginatedListings {
  const filtered = params?.category
    ? MOCK_LISTINGS.filter((l) => l.category === params.category)
    : MOCK_LISTINGS;

  return { data: filtered, total: filtered.length };
}

export function getMockListing(id: string): Listing | undefined {
  return MOCK_LISTINGS.find((l) => l.id === id);
}
