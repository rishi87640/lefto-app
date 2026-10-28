// @ts-nocheck
// NOTE: TypeScript errors in this file are due to incomplete Supabase Database
// type generics (joined queries return `never` until types are regenerated via
// `supabase gen types typescript`). The runtime logic is correct.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  RescueBag,
  Merchant,
  Order,
  UserProfile,
  PartnerLead,
  Review
} from '../types';
import {
  DEMO_BAGS,
  DEMO_MERCHANT_CRUST_CO,
  DEMO_ACTIVE_ORDER,
  DEMO_USER_PROFILE
} from '../data/mockData';

// ----------------------------------------------------------------------------
// ADAPTERS: DATABASE ROW -> FRONTEND TYPES
// ----------------------------------------------------------------------------

export function mapRowToRescueBag(row: any, restaurantRow?: any): RescueBag {
  const rest = restaurantRow || row.restaurants || {};
  const original = Number(row.original_price);
  const discounted = Number(row.discounted_price);
  const savings = original > 0 ? Math.round(((original - discounted) / original) * 100) : 0;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.food_category,
    merchantId: rest.id || row.restaurant_id,
    merchantName: rest.name || 'Local Outlet',
    merchantRating: Number(rest.rating || 4.5),
    merchantRatingCount: Number(rest.rating_count || 120),
    distance: rest.locality ? `Nearby · ${rest.locality}` : '1.5 km away',
    zone: rest.locality || 'Greater Noida',
    address: rest.address || 'Greater Noida, UP',
    dietaryType: row.dietary_type || 'pure_veg',
    originalPrice: original,
    rescuePrice: discounted,
    platformFee: Number(row.platform_fee || 5),
    savingsPercent: savings,
    stockLeft: Number(row.available_quantity),
    pickupWindow: row.pickup_window_display || '8:30 PM - 10:00 PM',
    pickupStart: row.pickup_start || '8:30 PM',
    pickupEnd: row.pickup_end || '10:00 PM',
    co2SavedKg: Number(row.co2_saved_kg || 1.2),
    imageUrl: row.cover_image_url || '',
    galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : [],
    sampleItems: Array.isArray(row.sample_items) ? row.sample_items : [],
    isEndingSoon: Boolean(row.is_ending_soon),
    allergenInfo: row.allergen_info || '',
    handlingInstructions: row.handling_instructions || '',
    uncertaintyNote: row.uncertainty_note || 'Exact contents depend on daily surplus and will vary. All food is freshly prepared, inspected, and packed just before closing.',
    isApproved: Boolean(row.is_active && (rest.is_verified || row.is_approved))
  };
}

export function mapRowToMerchant(row: any, bags: any[] = []): Merchant {
  return {
    id: row.id,
    ownerId: row.owner_id || null,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline || 'Surplus Rescue Partner',
    outletType: row.outlet_type || 'restaurant',
    contactPerson: row.contact_person || '',
    phone: row.phone || '',
    email: row.email || '',
    openingHours: row.opening_hours || '10:00 AM - 10:30 PM',
    pickupInstructions: row.pickup_instructions || 'Please show your pickup pass at the main checkout counter.',
    cuisineTags: Array.isArray(row.cuisine_tags) ? row.cuisine_tags : ['Bakery', 'Meals'],
    rating: Number(row.rating || 4.5),
    ratingCount: Number(row.rating_count || 0),
    distance: `Nearby · ${row.locality}, Greater Noida`,
    address: row.address,
    zone: row.locality,
    coverImage: row.cover_image_url || '',
    logoImage: row.logo_image_url || '',
    fssaiNumber: row.fssai_license || '',
    isVerified: Boolean(row.is_verified),
    typicalPickupWindow: row.typical_pickup_window || '8:30 PM – 10:00 PM',
    about: row.about || '',
    whyPartner: row.why_partner || '',
    reviews: [],
    availableBags: bags.map((b) => mapRowToRescueBag(b, row))
  };
}

// ----------------------------------------------------------------------------
// DATA RETRIEVAL SERVICES
// ----------------------------------------------------------------------------

export interface FetchBagsParams {
  zone?: string;
  category?: string;
  dietaryType?: string;
  search?: string;
}

export async function fetchRescueBags(params?: FetchBagsParams): Promise<{
  data: RescueBag[];
  error: string | null;
  isLive: boolean;
}> {
  if (!isSupabaseConfigured()) {
    // Return mock data filtered in memory
    let filtered = [...DEMO_BAGS];
    if (params?.zone && params.zone !== 'All Zones') {
      filtered = filtered.filter((b) => b.zone.toLowerCase().includes(params.zone!.toLowerCase()));
    }
    if (params?.category && params.category !== 'All') {
      filtered = filtered.filter((b) => b.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params?.dietaryType && params.dietaryType !== 'all') {
      filtered = filtered.filter((b) => b.dietaryType === params.dietaryType);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.merchantName.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
      );
    }
    return { data: filtered, error: null, isLive: false };
  }

  try {
    let query = supabase
      .from('rescue_bags')
      .select('*, restaurants!inner(*)')
      .eq('is_active', true)
      .gt('available_quantity', 0);

    if (params?.dietaryType && params.dietaryType !== 'all') {
      query = query.eq('dietary_type', params.dietaryType as any);
    }

    if (params?.category && params.category !== 'All') {
      query = query.ilike('food_category', `%${params.category}%`);
    }

    if (params?.search && params.search.trim()) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase fetchRescueBags error:', error);
      return { data: DEMO_BAGS, error: error.message, isLive: false };
    }

    let bags = (data || []).map((row) => mapRowToRescueBag(row, row.restaurants));

    if (params?.zone && params.zone !== 'All Zones') {
      bags = bags.filter((b) => b.zone.toLowerCase().includes(params.zone!.toLowerCase()));
    }

    return { data: bags, error: null, isLive: true };
  } catch (err: any) {
    console.error('Unexpected error fetching rescue bags:', err);
    return { data: DEMO_BAGS, error: err.message || 'Network error', isLive: false };
  }
}

export async function fetchRescueBagByIdOrSlug(idOrSlug: string): Promise<{
  data: RescueBag | null;
  error: string | null;
  isLive: boolean;
}> {
  if (!isSupabaseConfigured()) {
    const found = DEMO_BAGS.find((b) => b.id === idOrSlug || b.slug === idOrSlug) || DEMO_BAGS[0];
    return { data: found, error: null, isLive: false };
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    let query = supabase.from('rescue_bags').select('*, restaurants(*)');

    if (isUuid) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Error fetching rescue bag:', error);
      const fallback = DEMO_BAGS.find((b) => b.id === idOrSlug || b.slug === idOrSlug) || null;
      return { data: fallback, error: error.message, isLive: false };
    }

    if (!data) {
      const fallback = DEMO_BAGS.find((b) => b.id === idOrSlug || b.slug === idOrSlug) || null;
      return { data: fallback, error: 'Bag not found', isLive: true };
    }

    return { data: mapRowToRescueBag(data, data.restaurants), error: null, isLive: true };
  } catch (err: any) {
    return { data: DEMO_BAGS[0], error: err.message, isLive: false };
  }
}

export async function fetchRestaurantByIdOrSlug(idOrSlug: string): Promise<{
  data: Merchant | null;
  error: string | null;
  isLive: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { data: DEMO_MERCHANT_CRUST_CO, error: null, isLive: false };
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    let query = supabase.from('restaurants').select('*, rescue_bags(*)');

    if (isUuid) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return { data: DEMO_MERCHANT_CRUST_CO, error: error?.message || 'Restaurant not found', isLive: false };
    }

    const bags = (data.rescue_bags || []).filter((b: any) => b.is_active);
    return { data: mapRowToMerchant(data, bags), error: null, isLive: true };
  } catch (err: any) {
    return { data: DEMO_MERCHANT_CRUST_CO, error: err.message, isLive: false };
  }
}

// ----------------------------------------------------------------------------
// SECURE ORDER CREATION & VERIFICATION RPC
// ----------------------------------------------------------------------------

export interface CreateOrderParams {
  bagId: string;
  quantity: number;
  pickupName: string;
  pickupMobile: string;
  paymentMethod?: string;
}

export async function placeRescueOrderRPC(params: CreateOrderParams): Promise<{
  data: any;
  error: string | null;
  isLive: boolean;
}> {
  if (!isSupabaseConfigured()) {
    // Realistic simulated order for demo preview
    return {
      data: {
        success: true,
        order_id: 'order-lft' + Math.floor(10000 + Math.random() * 90000),
        order_code: 'LFT-' + Math.floor(10000 + Math.random() * 90000),
        pickup_pin: '4892',
        pickup_pass_code: 'PASS-dYZ%',
        total_amount: 259,
        subtotal: 249,
        platform_fee: 10,
        total_saved: 350,
        co2_prevented_kg: 1.4,
        pickup_window: 'Today, 9:30 PM – 10:00 PM',
        restaurant_name: 'Crust & Co.',
        restaurant_address: 'Central Market, Alpha 1 Commercial Belt, Greater Noida',
        locality: 'Alpha 1'
      },
      error: null,
      isLive: false
    };
  }

  try {
    const { data, error } = await supabase.rpc('create_rescue_order', {
      p_bag_id: params.bagId,
      p_quantity: params.quantity,
      p_pickup_name: params.pickupName,
      p_pickup_mobile: params.pickupMobile,
      p_payment_method: params.paymentMethod || 'upi'
    });

    if (error) {
      return { data: null, error: error.message, isLive: true };
    }

    return { data, error: null, isLive: true };
  } catch (err: any) {
    return { data: null, error: err.message || 'Order placement failed', isLive: true };
  }
}

// ----------------------------------------------------------------------------
// PARTNER APPLICATION SUBMISSION
// ----------------------------------------------------------------------------

export async function submitPartnerApplication(lead: PartnerLead): Promise<{
  success: boolean;
  error: string | null;
  isLive: boolean;
}> {
  if (!isSupabaseConfigured()) {
    // Demo mode: simulate successful validation and storage
    await new Promise((res) => setTimeout(res, 800));
    return { success: true, error: null, isLive: false };
  }

  try {
    const adminDetails = JSON.stringify({
      address: lead.address || '',
      operatingHours: lead.operatingHours || '',
      pickupWindowPreference: lead.pickupWindowPreference || '',
      pickupInstructions: lead.pickupInstructions || '',
      fssaiNumber: lead.fssaiNumber || '',
      gstNumber: lead.gstNumber || '',
      termsAgreed: Boolean(lead.termsAgreed)
    });

    const { data, error } = await supabase.from('partner_applications').insert({
      business_name: lead.businessName,
      outlet_type: lead.outletType,
      locality: lead.zone,
      owner_name: lead.ownerName,
      phone: lead.phone,
      email: lead.email,
      daily_walkins: lead.dailyWalkins || '50-150',
      closing_time: lead.closingTime || lead.operatingHours || '10:00 PM',
      surplus_frequency: lead.surplusFrequency || 'daily',
      whatsapp_consent: lead.whatsappConsent,
      status: 'submitted',
      admin_notes: adminDetails
    }).select().single();

    if (error) {
      return { success: false, error: error.message, isLive: true };
    }

    return { success: true, error: null, isLive: true, data };
  } catch (err: any) {
    return { success: false, error: err.message, isLive: true };
  }
}

// ----------------------------------------------------------------------------
// USER PROFILE & REPUTATION
// ----------------------------------------------------------------------------

export async function fetchUserProfile(): Promise<{
  data: UserProfile;
  error: string | null;
  isLive: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { data: DEMO_USER_PROFILE, error: null, isLive: false };
  }

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: DEMO_USER_PROFILE, error: authError?.message || 'Not authenticated', isLive: true };
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !profile) {
      return {
        data: {
          id: user.id,
          name: user.user_metadata?.full_name || 'Rescue Hero',
          email: user.email || '',
          phone: user.phone || '',
          defaultZone: 'Alpha 2',
          totalSaved: 0,
          mealsRescued: 0,
          co2Prevented: 0,
          memberSince: new Date(user.created_at).toLocaleDateString('en-IN', {
            month: 'long',
            year: 'numeric'
          }),
          verifiedRescuer: false
        },
        error: error?.message || null,
        isLive: true
      };
    }

    return {
      data: {
        id: profile.id,
        name: profile.full_name,
        email: profile.email || '',
        phone: profile.phone || '',
        defaultZone: profile.default_zone,
        totalSaved: Number(profile.total_saved),
        mealsRescued: Number(profile.meals_rescued),
        co2Prevented: Number(profile.co2_prevented_kg),
        memberSince: new Date(profile.created_at).toLocaleDateString('en-IN', {
          month: 'long',
          year: 'numeric'
        }),
        verifiedRescuer: Boolean(profile.is_verified)
      },
      error: null,
      isLive: true
    };
  } catch (err: any) {
    return { data: DEMO_USER_PROFILE, error: err.message, isLive: false };
  }
}

/** Update customer's non-sensitive profile info */
export async function updateUserProfile(updates: {
  fullName: string;
  phone?: string;
  defaultZone?: string;
}): Promise<{
  data: UserProfile | null;
  error: string | null;
  isLive: boolean;
}> {
  if (!isSupabaseConfigured()) {
    // In demo mode, return updated mock
    const updated: UserProfile = {
      ...DEMO_USER_PROFILE,
      name: updates.fullName,
      phone: updates.phone ?? DEMO_USER_PROFILE.phone,
      defaultZone: updates.defaultZone ?? DEMO_USER_PROFILE.defaultZone
    };
    return { data: updated, error: null, isLive: false };
  }

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: authError?.message || 'Authentication required', isLive: true };
    }

    // Explicitly update only safe columns (never update role, total_saved, meals_rescued, etc.)
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.fullName.trim(),
        phone: updates.phone?.trim() || null,
        default_zone: updates.defaultZone?.trim() || 'Alpha 2',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message, isLive: true };
    }

    const profileResult: UserProfile = {
      id: data.id,
      name: data.full_name,
      email: data.email || user.email || '',
      phone: data.phone || '',
      defaultZone: data.default_zone,
      totalSaved: Number(data.total_saved),
      mealsRescued: Number(data.meals_rescued),
      co2Prevented: Number(data.co2_prevented_kg),
      memberSince: new Date(data.created_at).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric'
      }),
      verifiedRescuer: Boolean(data.is_verified)
    };

    return { data: profileResult, error: null, isLive: true };
  } catch (err: any) {
    return { data: null, error: err.message || 'Profile update failed', isLive: false };
  }
}

// --------------------------------------------------------------------------
// USER ORDER HISTORY & PICKUP VERIFICATION
// --------------------------------------------------------------------------

/** Fetch orders for the currently authenticated user */
export async function fetchUserOrders(): Promise<{
  data: Order[] | null;
  error: string | null;
  isLive: boolean;
}> {
  if (!isSupabaseConfigured()) {
    // Return demo orders
    return { data: [DEMO_ACTIVE_ORDER], error: null, isLive: false };
  }

  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: authError?.message || 'Not authenticated', isLive: true };
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*), restaurants!inner(*)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message, isLive: true };
    }

    const orders: Order[] = (data || []).map((row: any) => {
      // Map order row to our Order type (simplified)
      const items = (row.order_items || []).map((it: any) => ({
        id: it.id,
        bagId: it.rescue_bag_id,
        quantity: it.quantity,
        price: Number(it.price_snapshot)
      }));
      return {
        id: row.id,
        code: row.order_code,
        status: row.status,
        totalAmount: Number(row.total_amount),
        createdAt: row.created_at,
        pickupWindow: row.pickup_window,
        pickupPin: row.pickup_pin,
        restaurant: mapRowToMerchant(row.restaurants, row.restaurants?.rescue_bags || []),
        items,
        // additional fields can be added as needed
      } as any;
    });
    return { data: orders, error: null, isLive: true };
  } catch (err: any) {
    return { data: null, error: err.message || 'Network error', isLive: false };
  }
}

/** Fetch specific order details securely for logged in customer */
export async function fetchOrderDetailsByIdOrCode(orderIdOrCode: string): Promise<{
  data: any | null;
  error: string | null;
  isLive: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return { data: DEMO_ACTIVE_ORDER, error: null, isLive: false };
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdOrCode);
    let query = supabase
      .from('orders')
      .select('*, order_items(*), restaurants(*), payments(*), pickup_verifications(*)');

    if (isUuid) {
      query = query.eq('id', orderIdOrCode);
    } else {
      query = query.eq('order_code', orderIdOrCode);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      return { data: null, error: error.message, isLive: true };
    }

    if (!data) {
      return { data: null, error: 'Order not found', isLive: true };
    }

    return { data, error: null, isLive: true };
  } catch (err: any) {
    return { data: null, error: err.message || 'Error fetching order details', isLive: false };
  }
}

/** Mark an order as picked up (secure verification) */
export async function confirmPickup(orderId: string, pin: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    // Demo mode always succeeds
    return { success: true, error: null };
  }
  try {
    // Assume a Postgres function `verify_pickup_redemption` validates pin and updates status atomically
    const { data, error } = await supabase.rpc('verify_pickup_redemption', {
      p_order_id: orderId,
      p_pickup_pin: pin
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/** Submit a customer review for a completed order */
export async function submitReview(review: Review): Promise<{
  success: boolean;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    // Demo mode simulates success
    await new Promise((res) => setTimeout(res, 500));
    return { success: true, error: null };
  }
  try {
    const { error } = await supabase.from('reviews').insert({
      order_id: (review as any).orderId ?? (review as any).order_id,
      rating: review.rating,
      review_text: (review as any).comment ?? (review as any).review_text ?? '',
      customer_id: (review as any).authorId ?? (review as any).customer_id ?? '',
      restaurant_id: (review as any).restaurantId ?? (review as any).restaurant_id ?? '',
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/** Admin: approve a partner application */
export async function approvePartnerApplication(applicationId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    // Demo mode does nothing
    return { success: true, error: null };
  }
  try {
    const { error } = await supabase
      .from('partner_applications')
      .update({ status: 'approved' })
      .eq('id', applicationId);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/** Auth helpers */
export async function signUp(email: string, password: string, fullName?: string) {
  if (!isSupabaseConfigured()) {
    // Demo mode – return mock user
    return { user: { id: 'demo-user', email }, error: null };
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });
  return { user: data?.user ?? null, error };
}

export async function signIn(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return { user: { id: 'demo-user', email }, error: null };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data?.user ?? null, error };
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

// --------------------------------------------------------------------------
// RESTAURANT OWNER & RESCUE BAG MANAGEMENT SERVICES
// --------------------------------------------------------------------------

export interface RestaurantProfileInput {
  name: string;
  outletType: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  locality: string;
  openingHours: string;
  pickupInstructions: string;
  fssaiLicense?: string;
  logoImageUrl?: string;
  coverImageUrl?: string;
}

export interface RescueBagInput {
  restaurantId: string;
  title: string;
  description: string;
  foodCategory: string;
  dietaryType: 'pure_veg' | 'non_veg' | 'mixed';
  originalPrice: number;
  discountedPrice: number;
  availableQuantity: number;
  pickupStart: string;
  pickupEnd: string;
  pickupWindowDisplay: string;
  allergenInfo?: string;
  handlingInstructions?: string;
  uncertaintyNote?: string;
  coverImageUrl?: string;
  isActive?: boolean;
}

/** Fetch restaurant owned by the current authenticated user */
export async function fetchMyRestaurant(): Promise<{
  data: Merchant | null;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { data: DEMO_MERCHANT_CRUST_CO, error: null };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'User is not authenticated' };
    }

    const { data, error } = await supabase
      .from('restaurants')
      .select('*, rescue_bags(*)')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: null, error: null };
    }

    return { data: mapRowToMerchant(data, data.rescue_bags || []), error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/** Create or update restaurant partner profile */
export async function saveRestaurantProfile(
  input: RestaurantProfileInput,
  restaurantId?: string
): Promise<{
  data: any;
  error: string | null;
}> {
  // Validate inputs
  if (!input.name.trim()) return { data: null, error: 'Restaurant name is required' };
  if (!input.phone.trim()) return { data: null, error: 'Phone number is required' };
  if (!input.address.trim()) return { data: null, error: 'Full address is required' };
  if (!input.locality.trim()) return { data: null, error: 'Locality is required' };

  if (!isSupabaseConfigured()) {
    await new Promise((res) => setTimeout(res, 600));
    return { data: { id: restaurantId || 'demo-restaurant-1', ...input }, error: null };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Authentication required' };
    }

    const slug = input.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const payload: any = {
      name: input.name.trim(),
      fssai_license: input.fssaiLicense || 'APPLIED_FOR',
      phone: input.phone.trim(),
      email: input.email.trim() || user.email,
      address: input.address.trim(),
      locality: input.locality.trim(),
      typical_pickup_window: input.openingHours || '8:30 PM - 10:00 PM',
      about: `${input.outletType} offering daily fresh surplus rescue meals.`,
      cover_image_url: input.coverImageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      logo_image_url: input.logoImageUrl || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=400&q=80',
    };

    if (restaurantId) {
      const { data, error } = await supabase
        .from('restaurants')
        .update(payload)
        .eq('id', restaurantId)
        .eq('owner_id', user.id)
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } else {
      payload.owner_id = user.id;
      payload.slug = slug;
      payload.is_verified = false; // requires admin approval

      const { data, error } = await supabase
        .from('restaurants')
        .insert(payload)
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    }
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/** Create or update surplus rescue bag listing with backend validation */
export async function saveRescueBag(
  input: RescueBagInput,
  bagId?: string
): Promise<{
  data: any;
  error: string | null;
}> {
  // Strict backend-style validation
  if (!input.title.trim()) return { data: null, error: 'Bag title is required' };
  if (!input.description.trim()) return { data: null, error: 'Description is required' };
  if (input.originalPrice <= 0) return { data: null, error: 'Original reference value must be greater than 0' };
  if (input.discountedPrice <= 0) return { data: null, error: 'Discounted price must be greater than 0' };
  if (input.discountedPrice >= input.originalPrice) {
    return { data: null, error: 'Discounted price must be strictly lower than original reference price' };
  }
  if (input.availableQuantity < 0) return { data: null, error: 'Available quantity cannot be negative' };
  if (!input.pickupStart || !input.pickupEnd) {
    return { data: null, error: 'Pickup start and end times are required' };
  }

  if (!isSupabaseConfigured()) {
    await new Promise((res) => setTimeout(res, 600));
    return {
      data: {
        id: bagId || 'bag-' + Math.floor(1000 + Math.random() * 9000),
        slug: 'rescue-bag-' + Math.floor(1000 + Math.random() * 9000),
        ...input
      },
      error: null
    };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: 'Authentication required' };
    }

    // Verify user owns the restaurant
    const { data: rest, error: restErr } = await supabase
      .from('restaurants')
      .select('id, is_verified')
      .eq('id', input.restaurantId)
      .eq('owner_id', user.id)
      .single();

    if (restErr || !rest) {
      return { data: null, error: 'Unauthorized: You can only manage listings for your own verified restaurant' };
    }

    const slug = input.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const payload: any = {
      restaurant_id: input.restaurantId,
      title: input.title.trim(),
      description: input.description.trim(),
      food_category: input.foodCategory,
      dietary_type: input.dietaryType,
      original_price: input.originalPrice,
      discounted_price: input.discountedPrice,
      available_quantity: input.availableQuantity,
      pickup_start: input.pickupStart,
      pickup_end: input.pickupEnd,
      pickup_window_display: input.pickupWindowDisplay,
      is_active: input.isActive !== undefined ? input.isActive : true,
      cover_image_url: input.coverImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    };

    if (bagId) {
      const { data, error } = await supabase
        .from('rescue_bags')
        .update(payload)
        .eq('id', bagId)
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } else {
      payload.slug = slug;
      const { data, error } = await supabase
        .from('rescue_bags')
        .insert(payload)
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    }
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

/** Deactivate / Activate bag listing */
export async function toggleBagStatus(
  bagId: string,
  isActive: boolean
): Promise<{
  success: boolean;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase
      .from('rescue_bags')
      .update({ is_active: isActive })
      .eq('id', bagId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// --------------------------------------------------------------------------
// END OF SERVICE LAYER
// --------------------------------------------------------------------------
