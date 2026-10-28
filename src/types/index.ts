export type DietaryType = 'pure_veg' | 'non_veg' | 'mixed';

export interface RescueBag {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  merchantId: string;
  merchantName: string;
  merchantRating: number;
  merchantRatingCount: number;
  distance: string;
  zone: string;
  address: string;
  dietaryType: DietaryType;
  originalPrice: number;
  rescuePrice: number;
  platformFee: number;
  savingsPercent: number;
  stockLeft: number;
  pickupWindow: string;
  pickupStart: string;
  pickupEnd: string;
  co2SavedKg: number;
  imageUrl: string;
  galleryImages?: string[];
  sampleItems?: Array<{ title: string; subtitle: string; icon: string }>;
  isEndingSoon?: boolean;
  allergenInfo?: string;
  handlingInstructions?: string;
  uncertaintyNote?: string;
  isApproved?: boolean;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  date: string;
  text: string;
  photoUrl?: string;
}

export interface Merchant {
  id: string;
  ownerId?: string | null;
  slug: string;
  name: string;
  tagline: string;
  outletType?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  pickupInstructions?: string;
  cuisineTags: string[];
  rating: number;
  ratingCount: number;
  distance: string;
  address: string;
  zone: string;
  coverImage: string;
  logoImage: string;
  fssaiNumber: string;
  isVerified: boolean;
  typicalPickupWindow: string;
  about: string;
  whyPartner: string;
  reviews: Review[];
  availableBags: RescueBag[];
}

export interface CartItem {
  bag: RescueBag;
  quantity: number;
  reservedAt: number;
  expiresAt: number;
}

export type OrderStatus = 'placed' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  orderCode: string; // e.g. LFT28491
  bag: RescueBag;
  quantity: number;
  subtotal: number;
  platformFee: number;
  totalAmount: number;
  totalSaved: number;
  co2Prevented: number;
  status: OrderStatus;
  pickupPersonName: string;
  pickupPersonMobile: string;
  pickupPin: string; // e.g. 4892
  pickupPassCode: string; // e.g. dYZ%
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallets';
  paymentDetails: string;
  placedAt: string;
  pickupWindow: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  defaultZone: string;
  totalSaved: number;
  mealsRescued: number;
  co2Prevented: number;
  memberSince: string;
  verifiedRescuer: boolean;
}

export interface SavedPlace {
  id: string;
  label: string;
  address: string;
  zone: string;
  radius: string;
  activeNearbyStores: number;
  isDefault: boolean;
}

export interface NotificationPreferences {
  bagAlerts: boolean;
  pickupReminders: boolean;
  orderUpdates: boolean;
  offers: boolean;
  ecoSummary: boolean;
}

export interface PartnerLead {
  businessName: string;
  outletType: string;
  address?: string;
  zone: string;
  ownerName: string;
  contactRole?: string;
  phone: string;
  email: string;
  operatingHours?: string;
  pickupWindowPreference?: string;
  pickupInstructions?: string;
  fssaiNumber?: string;
  gstNumber?: string;
  dailyWalkins?: string;
  closingTime?: string;
  surplusFrequency?: string;
  whatsappConsent: boolean;
  termsAgreed?: boolean;
}

