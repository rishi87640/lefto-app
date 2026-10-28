export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'customer' | 'restaurant_owner' | 'admin';
export type DietaryType = 'pure_veg' | 'non_veg' | 'mixed';
export type OrderStatus = 'placed' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
export type VerificationStatus = 'pending' | 'verified' | 'expired' | 'cancelled';
export type PartnerApplicationStatus = 'submitted' | 'in_review' | 'approved' | 'rejected';
export type RestaurantStatus = 'active' | 'paused' | 'closed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string | null;
          email: string | null;
          default_zone: string;
          total_saved: number;
          meals_rescued: number;
          co2_prevented_kg: number;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name: string;
          phone?: string | null;
          email?: string | null;
          default_zone?: string;
          total_saved?: number;
          meals_rescued?: number;
          co2_prevented_kg?: number;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          default_zone?: string;
          total_saved?: number;
          meals_rescued?: number;
          co2_prevented_kg?: number;
          is_verified?: boolean;
          updated_at?: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          slug: string;
          tagline: string | null;
          fssai_license: string;
          phone: string;
          email: string | null;
          address: string;
          locality: string;
          city: string;
          state: string;
          pincode: string;
          latitude: number | null;
          longitude: number | null;
          cuisine_tags: string[];
          cover_image_url: string | null;
          logo_image_url: string | null;
          rating: number;
          rating_count: number;
          operating_status: RestaurantStatus;
          is_verified: boolean;
          typical_pickup_window: string;
          about: string | null;
          why_partner: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id?: string | null;
          name: string;
          slug: string;
          tagline?: string | null;
          fssai_license: string;
          phone: string;
          email?: string | null;
          address: string;
          locality: string;
          city?: string;
          state?: string;
          pincode?: string;
          latitude?: number | null;
          longitude?: number | null;
          cuisine_tags?: string[];
          cover_image_url?: string | null;
          logo_image_url?: string | null;
          rating?: number;
          rating_count?: number;
          operating_status?: RestaurantStatus;
          is_verified?: boolean;
          typical_pickup_window?: string;
          about?: string | null;
          why_partner?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string | null;
          name?: string;
          slug?: string;
          tagline?: string | null;
          fssai_license?: string;
          phone?: string;
          email?: string | null;
          address?: string;
          locality?: string;
          city?: string;
          state?: string;
          pincode?: string;
          latitude?: number | null;
          longitude?: number | null;
          cuisine_tags?: string[];
          cover_image_url?: string | null;
          logo_image_url?: string | null;
          rating?: number;
          rating_count?: number;
          operating_status?: RestaurantStatus;
          is_verified?: boolean;
          typical_pickup_window?: string;
          about?: string | null;
          why_partner?: string | null;
          updated_at?: string;
        };
      };
      rescue_bags: {
        Row: {
          id: string;
          restaurant_id: string;
          title: string;
          slug: string;
          description: string;
          food_category: string;
          dietary_type: DietaryType;
          original_price: number;
          discounted_price: number;
          platform_fee: number;
          available_quantity: number;
          pickup_start: string;
          pickup_end: string;
          pickup_window_display: string;
          co2_saved_kg: number;
          cover_image_url: string;
          gallery_images: string[];
          sample_items: Json;
          is_active: boolean;
          is_ending_soon: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          title: string;
          slug: string;
          description: string;
          food_category: string;
          dietary_type?: DietaryType;
          original_price: number;
          discounted_price: number;
          platform_fee?: number;
          available_quantity?: number;
          pickup_start: string;
          pickup_end: string;
          pickup_window_display: string;
          co2_saved_kg?: number;
          cover_image_url: string;
          gallery_images?: string[];
          sample_items?: Json;
          is_active?: boolean;
          is_ending_soon?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          title?: string;
          slug?: string;
          description?: string;
          food_category?: string;
          dietary_type?: DietaryType;
          original_price?: number;
          discounted_price?: number;
          platform_fee?: number;
          available_quantity?: number;
          pickup_start?: string;
          pickup_end?: string;
          pickup_window_display?: string;
          co2_saved_kg?: number;
          cover_image_url?: string;
          gallery_images?: string[];
          sample_items?: Json;
          is_active?: boolean;
          is_ending_soon?: boolean;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_code: string;
          customer_id: string;
          restaurant_id: string;
          status: OrderStatus;
          subtotal: number;
          platform_fee: number;
          total_amount: number;
          total_saved: number;
          co2_prevented_kg: number;
          pickup_person_name: string;
          pickup_person_mobile: string;
          pickup_window: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_code: string;
          customer_id: string;
          restaurant_id: string;
          status?: OrderStatus;
          subtotal: number;
          platform_fee?: number;
          total_amount: number;
          total_saved?: number;
          co2_prevented_kg?: number;
          pickup_person_name: string;
          pickup_person_mobile: string;
          pickup_window: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_code?: string;
          customer_id?: string;
          restaurant_id?: string;
          status?: OrderStatus;
          subtotal?: number;
          platform_fee?: number;
          total_amount?: number;
          total_saved?: number;
          co2_prevented_kg?: number;
          pickup_person_name?: string;
          pickup_person_mobile?: string;
          pickup_window?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          rescue_bag_id: string;
          quantity: number;
          bag_title_snapshot: string;
          unit_price_snapshot: number;
          original_price_snapshot: number;
          dietary_type_snapshot: DietaryType;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          rescue_bag_id: string;
          quantity: number;
          bag_title_snapshot: string;
          unit_price_snapshot: number;
          original_price_snapshot: number;
          dietary_type_snapshot: DietaryType;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          rescue_bag_id?: string;
          quantity?: number;
          bag_title_snapshot?: string;
          unit_price_snapshot?: number;
          original_price_snapshot?: number;
          dietary_type_snapshot?: DietaryType;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          provider: string;
          provider_reference: string | null;
          amount: number;
          currency: string;
          status: PaymentStatus;
          payment_method: string;
          payment_metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          provider?: string;
          provider_reference?: string | null;
          amount: number;
          currency?: string;
          status?: PaymentStatus;
          payment_method?: string;
          payment_metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          provider?: string;
          provider_reference?: string | null;
          amount?: number;
          currency?: string;
          status?: PaymentStatus;
          payment_method?: string;
          payment_metadata?: Json;
          updated_at?: string;
        };
      };
      pickup_verifications: {
        Row: {
          id: string;
          order_id: string;
          pickup_pin: string;
          pickup_pass_code: string;
          qr_data: string;
          redemption_status: VerificationStatus;
          verified_at: string | null;
          verified_by_user_id: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          pickup_pin: string;
          pickup_pass_code: string;
          qr_data: string;
          redemption_status?: VerificationStatus;
          verified_at?: string | null;
          verified_by_user_id?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          pickup_pin?: string;
          pickup_pass_code?: string;
          qr_data?: string;
          redemption_status?: VerificationStatus;
          verified_at?: string | null;
          verified_by_user_id?: string | null;
          expires_at?: string;
        };
      };
      partner_applications: {
        Row: {
          id: string;
          business_name: string;
          outlet_type: string;
          locality: string;
          owner_name: string;
          phone: string;
          email: string;
          daily_walkins: string | null;
          closing_time: string | null;
          surplus_frequency: string | null;
          whatsapp_consent: boolean;
          status: PartnerApplicationStatus;
          admin_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_name: string;
          outlet_type: string;
          locality: string;
          owner_name: string;
          phone: string;
          email: string;
          daily_walkins?: string | null;
          closing_time?: string | null;
          surplus_frequency?: string | null;
          whatsapp_consent?: boolean;
          status?: PartnerApplicationStatus;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          outlet_type?: string;
          locality?: string;
          owner_name?: string;
          phone?: string;
          email?: string;
          daily_walkins?: string | null;
          closing_time?: string | null;
          surplus_frequency?: string | null;
          whatsapp_consent?: boolean;
          status?: PartnerApplicationStatus;
          admin_notes?: string | null;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          order_id: string;
          customer_id: string;
          restaurant_id: string;
          rating: number;
          review_text: string;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          customer_id: string;
          restaurant_id: string;
          rating: number;
          review_text: string;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          customer_id?: string;
          restaurant_id?: string;
          rating?: number;
          review_text?: string;
          photo_url?: string | null;
        };
      };
    };
    Functions: {
      create_rescue_order: {
        Args: {
          p_bag_id: string;
          p_quantity: number;
          p_pickup_name: string;
          p_pickup_mobile: string;
          p_payment_method?: string;
        };
        Returns: Json;
      };
      verify_pickup_redemption: {
        Args: {
          p_order_id: string;
          p_pickup_pin: string;
        };
        Returns: Json;
      };
    };
  };
}
