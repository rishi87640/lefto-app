/* 
 * [Stitch Export Demo Data - Phase 1 Frontend Preview]
 * All listings, merchants, prices, and reviews below are exact reproductions
 * of the designs exported from Google Stitch for Greater Noida.
 * No claims, reviews, or businesses have been artificially invented.
 */

import { Merchant, RescueBag, Order, UserProfile, SavedPlace, NotificationPreferences } from '../types';

export const DEMO_BAGS: RescueBag[] = [
  {
    id: 'bag-pizza-box-1',
    slug: 'end-of-day-pizza-box',
    title: 'End-of-Day Gourmet Pizza Box',
    description: "A surprise selection of freshly prepared gourmet pizza and sides left over from today's evening dinner service. Guaranteed piping hot quality.",
    category: 'Pizza',
    merchantId: 'merchant-crust-co',
    merchantName: 'Crust & Co.',
    merchantRating: 4.7,
    merchantRatingCount: 1240,
    distance: '1.8 km away',
    zone: 'Alpha 1',
    address: 'Shop 14, Ground Floor, Central Market, Alpha 1 Commercial Belt, Greater Noida, UP 201310',
    dietaryType: 'mixed',
    originalPrice: 599,
    rescuePrice: 249,
    platformFee: 10,
    savingsPercent: 58,
    stockLeft: 2,
    pickupWindow: 'Tonight, 9:30 PM – 10:00 PM',
    pickupStart: '9:30 PM',
    pickupEnd: '10:00 PM',
    co2SavedKg: 1.4,
    imageUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1WoVEXuT174gJ0GzmqCPEHA6xyHSuhUV1SA-K7yal_xo2TN4BNAAGbPxdtb4SoeQcoaPx7HUYNdWjFh9AR-IAFxUDEmXk2OswtFu2qruJWH_cHt7VefrXhx6pZApy03reQk-XunKEL3ziSKX8_uJLG4iJRNysCC9es9PgjNJH8-I44veDFrs8I9lq79w1Qg2-POj2m6PmZy0sOrsam12-TBmraP5hzhlFkGZhtLwMd6WUsf3dQhMp8nKeFs',
    galleryImages: [
      'https://lh3.googleusercontent.com/aida/AEtjO1WoVEXuT174gJ0GzmqCPEHA6xyHSuhUV1SA-K7yal_xo2TN4BNAAGbPxdtb4SoeQcoaPx7HUYNdWjFh9AR-IAFxUDEmXk2OswtFu2qruJWH_cHt7VefrXhx6pZApy03reQk-XunKEL3ziSKX8_uJLG4iJRNysCC9es9PgjNJH8-I44veDFrs8I9lq79w1Qg2-POj2m6PmZy0sOrsam12-TBmraP5hzhlFkGZhtLwMd6WUsf3dQhMp8nKeFs',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB7tdDzn04FusOshqRsei_Tslt0kW7-GLDqb5RPih0frj26MpwtbJ574c7TWR4A2Dy99aR0FOcU7CYN4yNxizRDZlVPu7LwzoIWXUGfPt04Wx0FLL-2-Y8NwvcEdg-G3iKVWYOSihePY-ck2lRq75O0EdeDuFGPTF_nH3iwpaVvIvTna8q5e2kg1stAIco82TliGGxVtts_2Y33DXLCu_eIssfe3XQBxhKDF6fGuqFHzqEJWQiplKfenw',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCkRHXADb5QyWZkys1t_B_4VI1Xn33lNyIGjJLKiawac1PIWp-MUqW8uZ7PwnyZj-ORDzWz6L9qr6EzVu9mCVInUyoUsdBgQHtKYs_fJFG91O8BRKD0LLhLH-eemdXRY74CKwZyq44h28b7jQ37vH43WruuBXvXRH-R4vAIAShuPY7HewoReUxhRqoXCksrmP1E9xFEhAP7pekv1b_QEhImDLlLIYxYJ-oPurd54v-9J0H6wQO-Gp0U-g',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ4J7xe6SfiVWlnC6ZmfnvyiXhSKJod6eZ72SRrjDII1dJ5XNnQwdn5P-jC07KEciYvKKXwsUtW6W-mK5MrO_t9I-68NIkhDtnMbSgm6O5AsJ3hMCFKf-RNyZnsBPs1SeaA7lkL3E8hUx5PEbEfZje54iVzNQwKeBliK2ly56bAgGXQWiXQOS6BuJF8wG6EJDrKVoyNOYqww-fCHQWWteXQ1rnjOhKFVa90Y_P9nA67BktyusV-7aVfQ'
    ],
    sampleItems: [
      { title: 'Gourmet Slices (2–3)', subtitle: 'Margherita, Veggie, or Paneer BBQ', icon: 'local_pizza' },
      { title: 'Garlic Knots & Sticks', subtitle: 'Warm sourdough with herb dip', icon: 'bakery_dining' },
      { title: 'Savory Side or Dip', subtitle: 'Rich Marinara or Potato Wedges', icon: 'soup_kitchen' },
      { title: 'Surprise Item / Treat', subtitle: 'Choco lava cup or chilled drink', icon: 'cookie' }
    ]
  },
  {
    id: 'bag-bakery-box-2',
    slug: 'artisan-bakery-box',
    title: 'Surprise Artisan Bakery Bag',
    description: "Freshly baked sourdough, butter croissants, Danish pastries & cinnamon buns from today's oven batch.",
    category: 'Bakeries',
    merchantId: 'merchant-midnight-bakery',
    merchantName: 'Midnight Bakery',
    merchantRating: 4.6,
    merchantRatingCount: 184,
    distance: '1.2 km away',
    zone: 'Knowledge Park III',
    address: 'Ground Floor, G-Square Mall, Knowledge Park III, Greater Noida',
    dietaryType: 'pure_veg',
    originalPrice: 399,
    rescuePrice: 149,
    platformFee: 10,
    savingsPercent: 63,
    stockLeft: 2,
    pickupWindow: 'Today, 9:30 PM – 10:00 PM',
    pickupStart: '9:30 PM',
    pickupEnd: '10:00 PM',
    co2SavedKg: 1.1,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR8_wWamnpPzTjQQ6OacLODUASp8C4wkORZcwjkUhDBaE_HSluLTQRx_0pnpv1Ba2sKMyTuAmcKrK3DanGrIWkWXUyXcdMrUX4nvlPiN1OVItykppZ8RF-Fk7nhGVMY9vCLP7DbNPMhNa5hCY1vvHqWqbewejBZNoZRICGMHqMWZd9U2vGBouPYP8bf6WlZT4eVZEU5kWewTL667gcLOaPNmx4fbqP1tK17jwQLkjjpy2Puho_IKMK0w',
    isEndingSoon: true
  },
  {
    id: 'bag-mughlai-box-3',
    slug: 'mughlai-dinner-box',
    title: 'Mughlai Dinner Box & Biryani',
    description: 'Cozy evening restaurant box featuring fragrant basmati biryani, rich dal makhani, paneer tikka, and butter tandoori naan.',
    category: 'Full Meals',
    merchantId: 'merchant-urban-tandoor',
    merchantName: 'Urban Tandoor',
    merchantRating: 4.8,
    merchantRatingCount: 412,
    distance: '2.4 km away',
    zone: 'Pari Chowk',
    address: 'Shop 7, Block B, Pari Chowk Commercial Complex, Greater Noida',
    dietaryType: 'pure_veg',
    originalPrice: 499,
    rescuePrice: 199,
    platformFee: 10,
    savingsPercent: 60,
    stockLeft: 4,
    pickupWindow: 'Tonight, 10:00 PM – 10:30 PM',
    pickupStart: '10:00 PM',
    pickupEnd: '10:30 PM',
    co2SavedKg: 1.8,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDa3eGxiTa5q0qfj-jCt5zcvqH2PadAQvYI7bGTdr7URZ5UXPnfiv7qFjdJb6tBF4CogBgByd_fVOCOMAeryPm3omJa_Mz06vgy4kbq_UhxNlBPcGIu2L_ZkSilWBkxV9Hp6CbFwkzpfG6GSiLuHKm6EaUPJsO2D19WWnkQRZhAr3__-pE5D48_Gf_OuzY3X0Rae35RdXgI4n-oQvt8FzahSrNWEwj84P0GXA2JYGzCUh2BFdjgixcyRA'
  },
  {
    id: 'bag-slice-duo-4',
    slug: 'evening-slice-rescue',
    title: 'Evening Pizza Slice Duo',
    description: 'Freshly baked wood-fired Margherita pizza slices with dripping melted mozzarella, fresh basil, and blistered Neapolitan crust.',
    category: 'Pizza',
    merchantId: 'merchant-crust-co',
    merchantName: 'Crust & Co.',
    merchantRating: 4.7,
    merchantRatingCount: 1240,
    distance: '1.8 km away',
    zone: 'Alpha 1',
    address: 'Shop 14, Ground Floor, Central Market, Alpha 1 Commercial Belt, Greater Noida, UP 201310',
    dietaryType: 'pure_veg',
    originalPrice: 349,
    rescuePrice: 149,
    platformFee: 10,
    savingsPercent: 57,
    stockLeft: 3,
    pickupWindow: 'Today, 9:30 PM – 10:00 PM',
    pickupStart: '9:30 PM',
    pickupEnd: '10:00 PM',
    co2SavedKg: 0.9,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfhcF-OVBekBS5C3bGfgQUtm_hyZxuYSu79gNEDL-E5AuxBbJ0jW_j5Sx6jtbeFppBIRCg81TFF9Xb3DRk4EUnJGKKbpjNvL7kB73wQf8byHPCMr5dw5Uuulk0lwVB7_XQD1n_8JayeKNMTox71E_51zNsP85jt_xgYhvg49fYeIhbGU-2ugR8XRzv48zb5CS_pF6IVOstjKZN3gfoERqZI3knmjPy3wpT6Mv11ZMiUjAJxQ6wOo61hA'
  },
  {
    id: 'bag-chai-samosa-5',
    slug: 'chai-chutney-samosa-duo',
    title: 'Chai & Chutney Samosa Duo',
    description: 'Crisp golden samosas filled with spiced potatoes, accompanied by sweet tamarind chutney, mint dip, and masala evening chai.',
    category: 'Snacks',
    merchantId: 'merchant-chai-chutney',
    merchantName: 'Chai & Chutney',
    merchantRating: 4.5,
    merchantRatingCount: 290,
    distance: '0.9 km away',
    zone: 'Gamma 1',
    address: 'Stall 12, Jagat Farm Market, Gamma 1, Greater Noida',
    dietaryType: 'pure_veg',
    originalPrice: 199,
    rescuePrice: 79,
    platformFee: 10,
    savingsPercent: 60,
    stockLeft: 5,
    pickupWindow: 'Today, 8:30 PM – 9:15 PM',
    pickupStart: '8:30 PM',
    pickupEnd: '9:15 PM',
    co2SavedKg: 0.6,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBftIEi-XAm4XAmtVLdELGyOjxc93i6gvjEdZpw9dNUC4wbkAbfCOhBD7T3IULscXEpP1In9iZoSnHqtyVih4jHw3G3bfW6rtfWa_26C6_YHevLuYWl89wCFCDu6tFpsD42zayJ0ItkM-Acmp7mq6xSzdyC4VfRHtJoKqSRYnDWGxm9xHWAAXSlTP-6C_aTi4AVG5V2XwZzykmJzGlr-k70UWhnr6HajCffkNCArNJ82sz2i_0jwDxz5g'
  },
  {
    id: 'bag-bread-box-6',
    slug: 'artisanal-bread-garlic-knots',
    title: 'Artisanal Bread & Garlic Knot Box',
    description: 'Assorted warm garlic bread knots, herb butter baguettes, and dinner rolls baked fresh during afternoon shift.',
    category: 'Bakeries',
    merchantId: 'merchant-crust-co',
    merchantName: 'Crust & Co.',
    merchantRating: 4.7,
    merchantRatingCount: 1240,
    distance: '1.8 km away',
    zone: 'Alpha 1',
    address: 'Shop 14, Ground Floor, Central Market, Alpha 1 Commercial Belt, Greater Noida, UP 201310',
    dietaryType: 'pure_veg',
    originalPrice: 399,
    rescuePrice: 139,
    platformFee: 10,
    savingsPercent: 65,
    stockLeft: 1,
    pickupWindow: 'Today, 9:30 PM – 10:00 PM',
    pickupStart: '9:30 PM',
    pickupEnd: '10:00 PM',
    co2SavedKg: 1.2,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrDUa_gv-Un_iN0bmVtIFJ-1bPN0iDdoiA0SptHbKjL8cT1FrqDNmPpAR_wH0Bw8v5qPQO3IQU_yZFQb-NVP8aktTROtR-GRqfd0zCgdO1tdd0zK5Yu8RtAtUO_ysR4F7uX3guAnYpXpuKO7jVnhIMSQ3kW_tLrkP8y7FcF113dMVIsJ18cQ3qTmT6SA6Wt-1ogktKgAkvOoQ1iU7IxZHeqkwDkQKARjFL0QJ80reQN-ZHB0lqH3U9Sg'
  }
];

export const DEMO_MERCHANT_CRUST_CO: Merchant = {
  id: 'merchant-crust-co',
  slug: 'crust-and-co',
  name: 'Crust & Co.',
  tagline: 'Artisanal Kitchen & Wood-Fired Pizzeria',
  cuisineTags: ['Pizza', 'Italian', 'Café'],
  rating: 4.7,
  ratingCount: 1240,
  distance: '1.8 km away · Alpha 1, Greater Noida',
  address: 'Shop 14, Ground Floor, Central Market, Alpha 1 Commercial Belt, Greater Noida, UP 201310',
  zone: 'Alpha 1',
  coverImage: 'https://lh3.googleusercontent.com/aida/AEtjO1UF3jXz1Q1upHQkXD3c9LeTL9-6uZE77-mqdWqbD_3hDKdXbN1wu88cPUkwylKgsMd',
  logoImage: 'https://lh3.googleusercontent.com/aida/AEtjO1WoVEXuT174gJ0GzmqCPEHA6xyHSuhUV1SA-K7yal_xo2TN4BNAAGbPxdtb4SoeQcoaPx7HUYNdWjFh9AR-IAFxUDEmXk2OswtFu2qruJWH_cHt7VefrXhx6pZApy03reQk-XunKEL3ziSKX8_uJLG4iJRNysCC9es9PgjNJH8-I44veDFrs8I9lq79w1Qg2-POj2m6PmZy0sOrsam12-TBmraP5hzhlFkGZhtLwMd6WUsf3dQhMp8nKeFs',
  fssaiNumber: '22723105000412',
  isVerified: true,
  typicalPickupWindow: 'Today · 9:00 PM – 10:30 PM',
  about: "Crust & Co. is a beloved Greater Noida artisanal kitchen specializing in slow-fermented Neapolitan sourdough pizzas, hand-crafted pastas, and golden bakery sides. We partner with LEFTO to ensure our day's freshly prepped ingredients never go to waste.",
  whyPartner: 'Every evening our kitchen bakes batches with precision, but walk-in variance means surplus slices remain at closing. LEFTO gives these gourmet batches a second chance with conscious foodies in Greater Noida.',
  reviews: [
    {
      id: 'rev-1',
      authorName: 'Priya Sharma',
      rating: 5,
      date: 'Yesterday',
      text: 'Rescued the pizza box last night. Got 3 fresh slices of sourdough margherita and 4 garlic breadsticks still warm! Unbelievable value for ₹249.'
    },
    {
      id: 'rev-2',
      authorName: 'Arjun Nambiar',
      rating: 5,
      date: '3 days ago',
      text: 'Super quick counter pickup. Walked into the Alpha 1 outlet, gave my 4-digit PIN, and got my freshly packed box in 30 seconds.'
    },
    {
      id: 'rev-3',
      authorName: 'Kavita Roy',
      rating: 4,
      date: 'Last week',
      text: 'Great food quality. 100% genuine restaurant surplus and hygienic packaging.'
    }
  ],
  availableBags: [
    DEMO_BAGS[0], // End-of-Day Gourmet Pizza Box
    DEMO_BAGS[3], // Evening Slice Duo
    DEMO_BAGS[5]  // Artisanal Bread & Garlic Knot Box
  ]
};

export const DEMO_ACTIVE_ORDER: Order = {
  id: 'order-lft28491',
  orderCode: 'LFT28491',
  bag: DEMO_BAGS[0],
  quantity: 1,
  subtotal: 249,
  platformFee: 10,
  totalAmount: 259,
  totalSaved: 350,
  co2Prevented: 1.4,
  status: 'confirmed',
  pickupPersonName: 'Aarohi Verma',
  pickupPersonMobile: '+91 98765 43210',
  pickupPin: '4892',
  pickupPassCode: 'dYZ%',
  paymentMethod: 'upi',
  paymentDetails: 'UPI (aarohi.verma@okhdfcbank)',
  placedAt: 'Today, 8:42 PM',
  pickupWindow: 'Today, 9:30 PM – 10:00 PM'
};

export const DEMO_USER_PROFILE: UserProfile = {
  id: 'user-rishi',
  name: 'Rishi',
  email: 'rishi@example.com',
  phone: '+91 98XXXXXX42',
  defaultZone: 'Knowledge Park III / Pari Chowk',
  totalSaved: 2340,
  mealsRescued: 8,
  co2Prevented: 11.2,
  memberSince: 'August 2024',
  verifiedRescuer: true
};

export const DEMO_SAVED_PLACES: SavedPlace[] = [
  {
    id: 'place-home',
    label: 'Home',
    address: 'Flat 402, Tower B, ATS Dolce, Alpha 1, Greater Noida, UP 201308',
    zone: 'Alpha 1',
    radius: '< 3.5 km',
    activeNearbyStores: 12,
    isDefault: true
  }
];

export const DEMO_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  bagAlerts: true,
  pickupReminders: true,
  orderUpdates: true,
  offers: false,
  ecoSummary: true
};

export const GREATER_NOIDA_ZONES = [
  'Knowledge Park III',
  'Pari Chowk',
  'Alpha 1',
  'Alpha 2',
  'Beta 1',
  'Beta 2',
  'Gamma 1 & 2',
  'Delta 1 & 2',
  'Omega / Chi-Phi',
  'Noida-Greater Noida Expressway'
];
