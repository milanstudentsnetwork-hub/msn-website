export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      accommodation_listings: {
        Row: {
          additional_notes: string | null;
          address_note: string | null;
          admin_notes: string | null;
          amenities: string[];
          available_from: string | null;
          available_now: boolean;
          available_until: string | null;
          bathrooms: number | null;
          bedrooms: number | null;
          bills_included: boolean;
          contact_email: string;
          contact_name: string;
          contact_phone: string | null;
          contract_notes: string | null;
          contract_status: string;
          created_at: string;
          description: string;
          first_name: string;
          furnished: boolean;
          gender_preference: string;
          id: string;
          images: string[];
          is_featured: boolean;
          is_modern: boolean | null;
          last_name: string;
          latitude: number | null;
          listing_source: Database["public"]["Enums"]["listing_source"];
          location_description: string;
          long_term: boolean;
          longitude: number | null;
          max_roommates: string;
          neighborhood: string;
          phone_contact_consent: boolean;
          photo_consent: boolean;
          price: number;
          price_period: string;
          rent_range: string;
          room_type: string;
          size_sqm: number | null;
          status: Database["public"]["Enums"]["listing_status"];
          students_only: boolean;
          title: string;
          updated_at: string;
          video_url: string | null;
        };
        Insert: {
          additional_notes?: string | null;
          address_note?: string | null;
          admin_notes?: string | null;
          amenities?: string[];
          available_from?: string | null;
          available_now?: boolean;
          available_until?: string | null;
          bathrooms?: number | null;
          bedrooms?: number | null;
          bills_included?: boolean;
          contact_email?: string;
          contact_name?: string;
          contact_phone?: string | null;
          contract_notes?: string | null;
          contract_status?: string;
          created_at?: string;
          description?: string;
          first_name?: string;
          furnished?: boolean;
          gender_preference?: string;
          id?: string;
          images?: string[];
          is_featured?: boolean;
          is_modern?: boolean | null;
          last_name?: string;
          latitude?: number | null;
          listing_source?: Database["public"]["Enums"]["listing_source"];
          location_description?: string;
          long_term?: boolean;
          longitude?: number | null;
          max_roommates?: string;
          neighborhood?: string;
          phone_contact_consent?: boolean;
          photo_consent?: boolean;
          price?: number;
          price_period?: string;
          rent_range?: string;
          room_type?: string;
          size_sqm?: number | null;
          status?: Database["public"]["Enums"]["listing_status"];
          students_only?: boolean;
          title: string;
          updated_at?: string;
          video_url?: string | null;
        };
        Update: {
          additional_notes?: string | null;
          address_note?: string | null;
          admin_notes?: string | null;
          amenities?: string[];
          available_from?: string | null;
          available_now?: boolean;
          available_until?: string | null;
          bathrooms?: number | null;
          bedrooms?: number | null;
          bills_included?: boolean;
          contact_email?: string;
          contact_name?: string;
          contact_phone?: string | null;
          contract_notes?: string | null;
          contract_status?: string;
          created_at?: string;
          description?: string;
          first_name?: string;
          furnished?: boolean;
          gender_preference?: string;
          id?: string;
          images?: string[];
          is_featured?: boolean;
          is_modern?: boolean | null;
          last_name?: string;
          latitude?: number | null;
          listing_source?: Database["public"]["Enums"]["listing_source"];
          location_description?: string;
          long_term?: boolean;
          longitude?: number | null;
          max_roommates?: string;
          neighborhood?: string;
          phone_contact_consent?: boolean;
          photo_consent?: boolean;
          price?: number;
          price_period?: string;
          rent_range?: string;
          room_type?: string;
          size_sqm?: number | null;
          status?: Database["public"]["Enums"]["listing_status"];
          students_only?: boolean;
          title?: string;
          updated_at?: string;
          video_url?: string | null;
        };
        Relationships: [];
      };
      accommodation_requests: {
        Row: {
          budget_range: string;
          created_at: string;
          date_from: string | null;
          date_until: string | null;
          email: string;
          first_name: string;
          gender: string;
          id: string;
          last_name: string;
          location_preferences: string;
          max_roommates: string;
          move_immediately: boolean;
          needs_contract: boolean;
          notes: string | null;
          phone: string;
          room_type: string;
          status: Database["public"]["Enums"]["request_pipeline_status"];
          stay_type: string;
          updated_at: string;
        };
        Insert: {
          budget_range?: string;
          created_at?: string;
          date_from?: string | null;
          date_until?: string | null;
          email: string;
          first_name: string;
          gender?: string;
          id?: string;
          last_name: string;
          location_preferences?: string;
          max_roommates?: string;
          move_immediately?: boolean;
          needs_contract?: boolean;
          notes?: string | null;
          phone: string;
          room_type?: string;
          status?: Database["public"]["Enums"]["request_pipeline_status"];
          stay_type?: string;
          updated_at?: string;
        };
        Update: {
          budget_range?: string;
          created_at?: string;
          date_from?: string | null;
          date_until?: string | null;
          email?: string;
          first_name?: string;
          gender?: string;
          id?: string;
          last_name?: string;
          location_preferences?: string;
          max_roommates?: string;
          move_immediately?: boolean;
          needs_contract?: boolean;
          notes?: string | null;
          phone?: string;
          room_type?: string;
          status?: Database["public"]["Enums"]["request_pipeline_status"];
          stay_type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          is_read: boolean;
          message: string;
          subject: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          is_read?: boolean;
          message: string;
          subject?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          is_read?: boolean;
          message?: string;
          subject?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          capacity: number | null;
          category: string;
          cover_image_url: string | null;
          created_at: string;
          description: string;
          end_time: string | null;
          event_date: string;
          id: string;
          is_featured: boolean;
          location: string;
          price: number;
          rsvp_url: string | null;
          slug: string | null;
          sort_order: number;
          start_time: string | null;
          status: Database["public"]["Enums"]["content_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          capacity?: number | null;
          category?: string;
          cover_image_url?: string | null;
          created_at?: string;
          description?: string;
          end_time?: string | null;
          event_date: string;
          id?: string;
          is_featured?: boolean;
          location?: string;
          price?: number;
          rsvp_url?: string | null;
          slug?: string | null;
          sort_order?: number;
          start_time?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          capacity?: number | null;
          category?: string;
          cover_image_url?: string | null;
          created_at?: string;
          description?: string;
          end_time?: string | null;
          event_date?: string;
          id?: string;
          is_featured?: boolean;
          location?: string;
          price?: number;
          rsvp_url?: string | null;
          slug?: string | null;
          sort_order?: number;
          start_time?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          answer: string;
          category: string;
          created_at: string;
          id: string;
          question: string;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          updated_at: string;
        };
        Insert: {
          answer: string;
          category?: string;
          created_at?: string;
          id?: string;
          question: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Update: {
          answer?: string;
          category?: string;
          created_at?: string;
          id?: string;
          question?: string;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      service_requests: {
        Row: {
          created_at: string;
          details: string;
          email: string;
          full_name: string;
          id: string;
          notes: string | null;
          payment_url: string | null;
          phone: string | null;
          preferred_date: string | null;
          quoted_price: number | null;
          service_id: string | null;
          service_name: string;
          status: Database["public"]["Enums"]["request_status"];
          university: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          details?: string;
          email: string;
          full_name: string;
          id?: string;
          notes?: string | null;
          payment_url?: string | null;
          phone?: string | null;
          preferred_date?: string | null;
          quoted_price?: number | null;
          service_id?: string | null;
          service_name?: string;
          status?: Database["public"]["Enums"]["request_status"];
          university?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          details?: string;
          email?: string;
          full_name?: string;
          id?: string;
          notes?: string | null;
          payment_url?: string | null;
          phone?: string | null;
          preferred_date?: string | null;
          quoted_price?: number | null;
          service_id?: string | null;
          service_name?: string;
          status?: Database["public"]["Enums"]["request_status"];
          university?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "service_requests_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          booking_url: string | null;
          category: string;
          created_at: string;
          cta_label: string;
          full_description: string;
          icon_key: string | null;
          id: string;
          image_url: string | null;
          is_featured: boolean;
          is_paid: boolean;
          name: string;
          price: number | null;
          price_note: string | null;
          short_description: string;
          slug: string | null;
          sort_order: number;
          status: Database["public"]["Enums"]["content_status"];
          updated_at: string;
        };
        Insert: {
          booking_url?: string | null;
          category?: string;
          created_at?: string;
          cta_label?: string;
          full_description?: string;
          icon_key?: string | null;
          id?: string;
          image_url?: string | null;
          is_featured?: boolean;
          is_paid?: boolean;
          name: string;
          price?: number | null;
          price_note?: string | null;
          short_description?: string;
          slug?: string | null;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Update: {
          booking_url?: string | null;
          category?: string;
          created_at?: string;
          cta_label?: string;
          full_description?: string;
          icon_key?: string | null;
          id?: string;
          image_url?: string | null;
          is_featured?: boolean;
          is_paid?: boolean;
          name?: string;
          price?: number | null;
          price_note?: string | null;
          short_description?: string;
          slug?: string | null;
          sort_order?: number;
          status?: Database["public"]["Enums"]["content_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          key: string;
          updated_at: string;
          value: string;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value?: string;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      app_role: "admin" | "editor";
      content_status: "draft" | "published";
      listing_source: "landlord" | "student_upload";
      listing_status: "pending" | "approved" | "rejected" | "published" | "matched" | "closed";
      request_pipeline_status: "new" | "under_review" | "matched" | "closed";
      request_status:
        | "new"
        | "contacted"
        | "in_progress"
        | "awaiting_payment"
        | "paid"
        | "completed"
        | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor"],
      content_status: ["draft", "published"],
      listing_source: ["landlord", "student_upload"],
      listing_status: ["pending", "approved", "rejected", "published", "matched", "closed"],
      request_pipeline_status: ["new", "under_review", "matched", "closed"],
      request_status: [
        "new",
        "contacted",
        "in_progress",
        "awaiting_payment",
        "paid",
        "completed",
        "cancelled",
      ],
    },
  },
} as const;
