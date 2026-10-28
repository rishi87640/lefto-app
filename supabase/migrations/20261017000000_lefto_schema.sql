-- ============================================================================
-- LEFTO - Food Surplus Rescue Marketplace (Greater Noida, India)
-- Supabase PostgreSQL Schema Migration
-- Migration: 20261017000000_lefto_schema.sql
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ENUMS & DOMAINS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'restaurant_owner', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE dietary_type AS ENUM ('pure_veg', 'non_veg', 'mixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('placed', 'confirmed', 'ready_for_pickup', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'authorized', 'captured', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'expired', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE partner_application_status AS ENUM ('submitted', 'in_review', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE restaurant_status AS ENUM ('active', 'paused', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 2. PROFILES TABLE
-- Handles customers, restaurant owners, and administrators
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'customer',
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    default_zone TEXT DEFAULT 'Alpha 2',
    total_saved NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_saved >= 0),
    meals_rescued INTEGER NOT NULL DEFAULT 0 CHECK (meals_rescued >= 0),
    co2_prevented_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (co2_prevented_kg >= 0),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 3. RESTAURANTS TABLE
-- Details, FSSAI verification, operating hours, and locality
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tagline TEXT,
    fssai_license TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    locality TEXT NOT NULL, -- Greater Noida sectors: Alpha 1, Alpha 2, Beta 1, Pari Chowk, Knowledge Park, etc.
    city TEXT NOT NULL DEFAULT 'Greater Noida',
    state TEXT NOT NULL DEFAULT 'Uttar Pradesh',
    pincode TEXT NOT NULL DEFAULT '201310',
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    cuisine_tags TEXT[] NOT NULL DEFAULT '{}',
    cover_image_url TEXT,
    logo_image_url TEXT,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 4.50 CHECK (rating >= 1.00 AND rating <= 5.00),
    rating_count INTEGER NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
    operating_status restaurant_status NOT NULL DEFAULT 'active',
    is_verified BOOLEAN NOT NULL DEFAULT false, -- Only admins can verify
    typical_pickup_window TEXT NOT NULL DEFAULT '8:30 PM - 10:00 PM',
    about TEXT,
    why_partner TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 4. RESCUE_BAGS TABLE
-- Surprise surplus inventory bags
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rescue_bags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    food_category TEXT NOT NULL,
    dietary_type dietary_type NOT NULL DEFAULT 'pure_veg',
    original_price NUMERIC(10, 2) NOT NULL CHECK (original_price > 0),
    discounted_price NUMERIC(10, 2) NOT NULL CHECK (discounted_price > 0 AND discounted_price < original_price),
    platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 5.00 CHECK (platform_fee >= 0),
    available_quantity INTEGER NOT NULL DEFAULT 0 CHECK (available_quantity >= 0),
    pickup_start TIME NOT NULL,
    pickup_end TIME NOT NULL,
    pickup_window_display TEXT NOT NULL, -- e.g. "8:30 PM - 9:30 PM"
    co2_saved_kg NUMERIC(6, 2) NOT NULL DEFAULT 1.20 CHECK (co2_saved_kg >= 0),
    cover_image_url TEXT NOT NULL,
    gallery_images TEXT[] NOT NULL DEFAULT '{}',
    sample_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_ending_soon BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 5. ORDERS TABLE
-- High-integrity order header
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code TEXT UNIQUE NOT NULL, -- e.g. LFT-28491
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    status order_status NOT NULL DEFAULT 'placed',
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 5.00 CHECK (platform_fee >= 0),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    total_saved NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_saved >= 0),
    co2_prevented_kg NUMERIC(6, 2) NOT NULL DEFAULT 0.00 CHECK (co2_prevented_kg >= 0),
    pickup_person_name TEXT NOT NULL,
    pickup_person_mobile TEXT NOT NULL,
    pickup_window TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 6. ORDER_ITEMS TABLE
-- Line items with immutable pricing & bag snapshots
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    rescue_bag_id UUID NOT NULL REFERENCES public.rescue_bags(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    bag_title_snapshot TEXT NOT NULL,
    unit_price_snapshot NUMERIC(10, 2) NOT NULL CHECK (unit_price_snapshot >= 0),
    original_price_snapshot NUMERIC(10, 2) NOT NULL CHECK (original_price_snapshot >= 0),
    dietary_type_snapshot dietary_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 7. PAYMENTS TABLE
-- Payment status, provider reference, and audit records
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'mock_upi', -- 'razorpay', 'upi', 'mock_upi'
    provider_reference TEXT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status payment_status NOT NULL DEFAULT 'pending',
    payment_method TEXT NOT NULL DEFAULT 'upi',
    payment_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 8. PICKUP_VERIFICATIONS TABLE
-- Two-factor pickup verification with PIN and cryptographic QR pass
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pickup_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    pickup_pin TEXT NOT NULL CHECK (length(pickup_pin) = 4),
    pickup_pass_code TEXT NOT NULL,
    qr_data TEXT NOT NULL,
    redemption_status verification_status NOT NULL DEFAULT 'pending',
    verified_at TIMESTAMPTZ,
    verified_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 9. PARTNER_APPLICATIONS TABLE
-- B2B onboarding pipeline for restaurants in Greater Noida
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partner_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    outlet_type TEXT NOT NULL,
    locality TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    daily_walkins TEXT,
    closing_time TEXT,
    surplus_frequency TEXT,
    whatsapp_consent BOOLEAN NOT NULL DEFAULT true,
    status partner_application_status NOT NULL DEFAULT 'submitted',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 10. REVIEWS TABLE
-- Verified customer feedback on completed orders
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 11. INDEXES FOR PERFORMANCE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_restaurants_locality ON public.restaurants(locality);
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON public.restaurants(operating_status, is_verified);
CREATE INDEX IF NOT EXISTS idx_rescue_bags_restaurant ON public.rescue_bags(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_rescue_bags_active ON public.rescue_bags(is_active, available_quantity);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_code ON public.orders(order_code);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_pickup_verifications_order ON public.pickup_verifications(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON public.reviews(restaurant_id);

-- ----------------------------------------------------------------------------
-- 12. TRIGGERS: AUTO-UPDATE updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_restaurants_updated_at ON public.restaurants;
CREATE TRIGGER set_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_rescue_bags_updated_at ON public.rescue_bags;
CREATE TRIGGER set_rescue_bags_updated_at
    BEFORE UPDATE ON public.rescue_bags
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_payments_updated_at ON public.payments;
CREATE TRIGGER set_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_partner_applications_updated_at ON public.partner_applications;
CREATE TRIGGER set_partner_applications_updated_at
    BEFORE UPDATE ON public.partner_applications
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- 13. AUTH TRIGGER: AUTO-CREATE PROFILE ON SIGNUP
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Rescue Hero'),
        NEW.email,
        COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'::user_role)
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        updated_at = timezone('utc'::text, now());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rescue_bags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public can view basic merchant profile info" ON public.profiles;
CREATE POLICY "Public can view basic merchant profile info"
    ON public.profiles FOR SELECT
    USING (role = 'restaurant_owner');

DROP POLICY IF EXISTS "Users can update own non-sensitive profile info" ON public.profiles;
CREATE POLICY "Users can update own non-sensitive profile info"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- RESTAURANTS POLICIES
DROP POLICY IF EXISTS "Public can view active restaurants" ON public.restaurants;
CREATE POLICY "Public can view active restaurants"
    ON public.restaurants FOR SELECT
    USING (operating_status = 'active');

DROP POLICY IF EXISTS "Owners can view and manage their restaurant" ON public.restaurants;
CREATE POLICY "Owners can view and manage their restaurant"
    ON public.restaurants FOR ALL
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

-- RESCUE_BAGS POLICIES
DROP POLICY IF EXISTS "Public can view active rescue bags" ON public.rescue_bags;
CREATE POLICY "Public can view active rescue bags"
    ON public.rescue_bags FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Restaurant owners can manage their rescue bags" ON public.rescue_bags;
CREATE POLICY "Restaurant owners can manage their rescue bags"
    ON public.rescue_bags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = rescue_bags.restaurant_id
            AND r.owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = rescue_bags.restaurant_id
            AND r.owner_id = auth.uid()
        )
    );

-- ORDERS POLICIES
-- Read: Customers see own orders; Restaurant owners see orders for their restaurant
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
CREATE POLICY "Customers can view their own orders"
    ON public.orders FOR SELECT
    USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Restaurant owners can view orders for their restaurant" ON public.orders;
CREATE POLICY "Restaurant owners can view orders for their restaurant"
    ON public.orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.restaurants r
            WHERE r.id = orders.restaurant_id
            AND r.owner_id = auth.uid()
        )
    );

-- Restrict Direct INSERT/UPDATE on orders from client to prevent tampering!
-- Orders MUST be created and updated via SECURITY DEFINER functions (create_rescue_order)
DROP POLICY IF EXISTS "Prevent direct client insert on orders" ON public.orders;
-- (No INSERT policy for public/authenticated means direct client INSERT is blocked)

-- ORDER_ITEMS POLICIES
DROP POLICY IF EXISTS "Order items readable by order participant" ON public.order_items;
CREATE POLICY "Order items readable by order participant"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (
                o.customer_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.restaurants r
                    WHERE r.id = o.restaurant_id AND r.owner_id = auth.uid()
                )
            )
        )
    );

-- PAYMENTS POLICIES
DROP POLICY IF EXISTS "Payments readable by order customer" ON public.payments;
CREATE POLICY "Payments readable by order customer"
    ON public.payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = payments.order_id
            AND o.customer_id = auth.uid()
        )
    );

-- PICKUP_VERIFICATIONS POLICIES
DROP POLICY IF EXISTS "Pickup verification readable by order customer or restaurant" ON public.pickup_verifications;
CREATE POLICY "Pickup verification readable by order customer or restaurant"
    ON public.pickup_verifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = pickup_verifications.order_id
            AND (
                o.customer_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.restaurants r
                    WHERE r.id = o.restaurant_id AND r.owner_id = auth.uid()
                )
            )
        )
    );

-- PARTNER_APPLICATIONS POLICIES
DROP POLICY IF EXISTS "Anyone can submit a partner application" ON public.partner_applications;
CREATE POLICY "Anyone can submit a partner application"
    ON public.partner_applications FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Only application creator or admin can read application" ON public.partner_applications;
CREATE POLICY "Only application creator or admin can read application"
    ON public.partner_applications FOR SELECT
    USING (
        phone = (SELECT phone FROM public.profiles WHERE id = auth.uid())
        OR email = (SELECT email FROM public.profiles WHERE id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- REVIEWS POLICIES
DROP POLICY IF EXISTS "Public can read reviews" ON public.reviews;
CREATE POLICY "Public can read reviews"
    ON public.reviews FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Customers can create reviews for completed orders" ON public.reviews;
CREATE POLICY "Customers can create reviews for completed orders"
    ON public.reviews FOR INSERT
    WITH CHECK (
        customer_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = reviews.order_id
            AND o.customer_id = auth.uid()
            AND o.status = 'completed'
        )
    );

-- ----------------------------------------------------------------------------
-- 15. SECURE SERVER-SIDE RPC: CREATE RESCUE ORDER
-- Prevents clients from tampering with pricing, discount, platform fees, or stock
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_rescue_order(
    p_bag_id UUID,
    p_quantity INTEGER,
    p_pickup_name TEXT,
    p_pickup_mobile TEXT,
    p_payment_method TEXT DEFAULT 'upi'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_customer_id UUID;
    v_bag RECORD;
    v_restaurant RECORD;
    v_subtotal NUMERIC(10, 2);
    v_platform_fee NUMERIC(10, 2) := 5.00;
    v_total_amount NUMERIC(10, 2);
    v_total_saved NUMERIC(10, 2);
    v_co2_prevented NUMERIC(6, 2);
    v_order_id UUID;
    v_order_code TEXT;
    v_pickup_pin TEXT;
    v_pickup_pass_code TEXT;
    v_qr_payload TEXT;
    v_expires_at TIMESTAMPTZ;
    v_result JSONB;
BEGIN
    -- 1. Ensure user is authenticated
    v_customer_id := auth.uid();
    IF v_customer_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to place rescue orders.';
    END IF;

    -- Validate quantity
    IF p_quantity IS NULL OR p_quantity <= 0 THEN
        RAISE EXCEPTION 'Quantity must be at least 1.';
    END IF;

    -- Validate customer contact
    IF trim(p_pickup_name) = '' OR trim(p_pickup_mobile) = '' THEN
        RAISE EXCEPTION 'Pickup contact name and mobile number are required.';
    END IF;

    -- 2. Fetch and lock rescue bag record
    SELECT * INTO v_bag
    FROM public.rescue_bags
    WHERE id = p_bag_id AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'The selected rescue bag is no longer available.';
    END IF;

    -- 3. Check stock availability
    IF v_bag.available_quantity < p_quantity THEN
        RAISE EXCEPTION 'Only % bags remaining for this item.', v_bag.available_quantity;
    END IF;

    -- 4. Fetch restaurant
    SELECT * INTO v_restaurant
    FROM public.restaurants
    WHERE id = v_bag.restaurant_id;

    IF NOT FOUND OR v_restaurant.operating_status <> 'active' THEN
        RAISE EXCEPTION 'This restaurant is currently not accepting orders.';
    END IF;

    -- 5. Calculate verified pricing and environmental metrics on server
    v_subtotal := v_bag.discounted_price * p_quantity;
    v_total_amount := v_subtotal + v_platform_fee;
    v_total_saved := (v_bag.original_price - v_bag.discounted_price) * p_quantity;
    v_co2_prevented := v_bag.co2_saved_kg * p_quantity;

    -- 6. Generate order code, 4-digit PIN, and verification codes
    v_order_code := 'LFT-' || lpad((floor(random() * 90000 + 10000))::text, 5, '0');
    v_pickup_pin := lpad((floor(random() * 9000 + 1000))::text, 4, '0');
    v_pickup_pass_code := 'PASS-' || upper(substr(md5(random()::text), 1, 4));
    v_expires_at := timezone('utc'::text, now()) + interval '12 hours';

    -- 7. Deduct stock atomically
    UPDATE public.rescue_bags
    SET
        available_quantity = available_quantity - p_quantity,
        is_active = (available_quantity - p_quantity > 0)
    WHERE id = p_bag_id;

    -- 8. Insert Order record
    INSERT INTO public.orders (
        order_code,
        customer_id,
        restaurant_id,
        status,
        subtotal,
        platform_fee,
        total_amount,
        total_saved,
        co2_prevented_kg,
        pickup_person_name,
        pickup_person_mobile,
        pickup_window
    )
    VALUES (
        v_order_code,
        v_customer_id,
        v_bag.restaurant_id,
        'placed',
        v_subtotal,
        v_platform_fee,
        v_total_amount,
        v_total_saved,
        v_co2_prevented,
        p_pickup_name,
        p_pickup_mobile,
        v_bag.pickup_window_display
    )
    RETURNING id INTO v_order_id;

    -- 9. Insert Order Item record with immutable price snapshots
    INSERT INTO public.order_items (
        order_id,
        rescue_bag_id,
        quantity,
        bag_title_snapshot,
        unit_price_snapshot,
        original_price_snapshot,
        dietary_type_snapshot
    )
    VALUES (
        v_order_id,
        v_bag.id,
        p_quantity,
        v_bag.title,
        v_bag.discounted_price,
        v_bag.original_price,
        v_bag.dietary_type
    );

    -- 10. Insert Payment record (pending authorization / mock UPI transaction)
    INSERT INTO public.payments (
        order_id,
        provider,
        provider_reference,
        amount,
        currency,
        status,
        payment_method
    )
    VALUES (
        v_order_id,
        'mock_upi',
        'UPI-REF-' || upper(substr(md5(random()::text), 1, 10)),
        v_total_amount,
        'INR',
        'authorized',
        p_payment_method
    );

    -- 11. Prepare QR payload and create pickup verification record
    v_qr_payload := json_build_object(
        'order_id', v_order_id,
        'order_code', v_order_code,
        'pickup_pin', v_pickup_pin,
        'restaurant_id', v_bag.restaurant_id,
        'expires_at', v_expires_at
    )::text;

    INSERT INTO public.pickup_verifications (
        order_id,
        pickup_pin,
        pickup_pass_code,
        qr_data,
        redemption_status,
        expires_at
    )
    VALUES (
        v_order_id,
        v_pickup_pin,
        v_pickup_pass_code,
        v_qr_payload,
        'pending',
        v_expires_at
    );

    -- 12. Update customer statistics in profiles
    UPDATE public.profiles
    SET
        meals_rescued = meals_rescued + p_quantity,
        total_saved = total_saved + v_total_saved,
        co2_prevented_kg = co2_prevented_kg + v_co2_prevented
    WHERE id = v_customer_id;

    -- 13. Build and return complete response payload
    v_result := jsonb_build_object(
        'success', true,
        'order_id', v_order_id,
        'order_code', v_order_code,
        'total_amount', v_total_amount,
        'subtotal', v_subtotal,
        'platform_fee', v_platform_fee,
        'total_saved', v_total_saved,
        'co2_prevented_kg', v_co2_prevented,
        'pickup_pin', v_pickup_pin,
        'pickup_pass_code', v_pickup_pass_code,
        'pickup_window', v_bag.pickup_window_display,
        'restaurant_name', v_restaurant.name,
        'restaurant_address', v_restaurant.address,
        'locality', v_restaurant.locality
    );

    RETURN v_result;
END;
$$;

-- ----------------------------------------------------------------------------
-- 16. SECURE SERVER-SIDE RPC: VERIFY PICKUP REDEMPTION (RESTAURANT OWNER)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_pickup_redemption(
    p_order_id UUID,
    p_pickup_pin TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_id UUID;
    v_verification RECORD;
    v_order RECORD;
    v_restaurant RECORD;
BEGIN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- Fetch order
    SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found.';
    END IF;

    -- Verify caller owns the restaurant or is admin
    SELECT * INTO v_restaurant
    FROM public.restaurants
    WHERE id = v_order.restaurant_id;

    IF v_restaurant.owner_id <> v_caller_id AND NOT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = v_caller_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: only the restaurant owner can verify redemption.';
    END IF;

    -- Fetch verification record
    SELECT * INTO v_verification
    FROM public.pickup_verifications
    WHERE order_id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Verification record missing for this order.';
    END IF;

    IF v_verification.redemption_status = 'verified' THEN
        RAISE EXCEPTION 'This order has already been verified and picked up.';
    END IF;

    IF v_verification.pickup_pin <> p_pickup_pin THEN
        RAISE EXCEPTION 'Incorrect pickup PIN.';
    END IF;

    IF now() > v_verification.expires_at THEN
        RAISE EXCEPTION 'This pickup pass has expired.';
    END IF;

    -- Mark verified
    UPDATE public.pickup_verifications
    SET
        redemption_status = 'verified',
        verified_at = timezone('utc'::text, now()),
        verified_by_user_id = v_caller_id
    WHERE order_id = p_order_id;

    -- Update order status
    UPDATE public.orders
    SET
        status = 'completed'
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Pickup successfully verified and marked completed.',
        'order_id', p_order_id,
        'verified_at', now()
    );
END;
$$;
