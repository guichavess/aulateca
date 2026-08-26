export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          role: string
          avatar_url: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          name: string
          role?: string
          avatar_url?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          role?: string
          avatar_url?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          type: string
          age_range: string
          duration: string
          file_url: string | null
          image_url: string | null
          author_name: string | null
          is_new: boolean | null
          downloads: number | null
          rating: number | null
          author_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          type: string
          age_range: string
          duration: string
          file_url?: string | null
          image_url?: string | null
          author_name?: string | null
          is_new?: boolean | null
          downloads?: number | null
          rating?: number | null
          author_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          type?: string
          age_range?: string
          duration?: string
          file_url?: string | null
          image_url?: string | null
          author_name?: string | null
          is_new?: boolean | null
          downloads?: number | null
          rating?: number | null
          author_id?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          resource_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          resource_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favorites_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          id: string
          author_id: string
          content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          created_at?: string | null
        }
        Update: {
          id?: string
          author_id?: string
          content?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          id: string
          author_id: string
          post_id: string
          content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          author_id: string
          post_id: string
          content: string
          created_at?: string | null
        }
        Update: {
          id?: string
          author_id?: string
          post_id?: string
          content?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      public_activities: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string | null
          image_url: string | null
          capacity: number | null
          starts_at: string | null
          ends_at: string | null
          is_active: boolean
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category?: string | null
          image_url?: string | null
          capacity?: number | null
          starts_at?: string | null
          ends_at?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string | null
          image_url?: string | null
          capacity?: number | null
          starts_at?: string | null
          ends_at?: string | null
          is_active?: boolean
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_enrollments: {
        Row: {
          id: string
          activity_id: string
          user_id: string
          status: string
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          activity_id: string
          user_id: string
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          activity_id?: string
          user_id?: string
          status?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_enrollments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "public_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cakto_events: {
        Row: {
          id: string
          event: string
          order_id: string | null
          ref_id: string | null
          subscription_id: string | null
          customer_email: string | null
          customer_name: string | null
          product_id: string | null
          offer_id: string | null
          status: string | null
          amount: number | null
          payment_method: string | null
          dedupe_key: string | null
          payload: Json
          received_at: string
          processed_at: string | null
          process_error: string | null
        }
        Insert: {
          id?: string
          event: string
          order_id?: string | null
          ref_id?: string | null
          subscription_id?: string | null
          customer_email?: string | null
          customer_name?: string | null
          product_id?: string | null
          offer_id?: string | null
          status?: string | null
          amount?: number | null
          payment_method?: string | null
          dedupe_key?: string | null
          payload: Json
          received_at?: string
          processed_at?: string | null
          process_error?: string | null
        }
        Update: {
          id?: string
          event?: string
          order_id?: string | null
          ref_id?: string | null
          subscription_id?: string | null
          customer_email?: string | null
          customer_name?: string | null
          product_id?: string | null
          offer_id?: string | null
          status?: string | null
          amount?: number | null
          payment_method?: string | null
          dedupe_key?: string | null
          payload?: Json
          received_at?: string
          processed_at?: string | null
          process_error?: string | null
        }
        Relationships: []
      }
      cakto_entitlements: {
        Row: {
          id: string
          email: string
          user_id: string | null
          kind: string
          status: string
          product_id: string | null
          product_name: string | null
          offer_id: string | null
          order_id: string | null
          ref_id: string | null
          subscription_id: string | null
          source_key: string
          granted_at: string
          expires_at: string | null
          revoked_at: string | null
          revoke_reason: string | null
          last_event: string | null
          last_event_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          user_id?: string | null
          kind?: string
          status?: string
          product_id?: string | null
          product_name?: string | null
          offer_id?: string | null
          order_id?: string | null
          ref_id?: string | null
          subscription_id?: string | null
          source_key: string
          granted_at?: string
          expires_at?: string | null
          revoked_at?: string | null
          revoke_reason?: string | null
          last_event?: string | null
          last_event_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          user_id?: string | null
          kind?: string
          status?: string
          product_id?: string | null
          product_name?: string | null
          offer_id?: string | null
          order_id?: string | null
          ref_id?: string | null
          subscription_id?: string | null
          source_key?: string
          granted_at?: string
          expires_at?: string | null
          revoked_at?: string | null
          revoke_reason?: string | null
          last_event?: string | null
          last_event_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cakto_entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      cakto_access_overview: {
        Row: {
          id: string
          email: string
          user_id: string | null
          user_name: string | null
          kind: string
          status: string
          product_name: string | null
          order_id: string | null
          ref_id: string | null
          granted_at: string
          expires_at: string | null
          revoked_at: string | null
          revoke_reason: string | null
          last_event: string | null
          last_event_at: string | null
          is_active: boolean
        }
        Relationships: []
      }
    }
    Functions: {
      increment_downloads: {
        Args: { resource_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      enrollment_counts: {
        Args: Record<PropertyKey, never>
        Returns: { status: string; count: number }[]
      }
      activity_enrollment_counts: {
        Args: Record<PropertyKey, never>
        Returns: { activity_id: string; taken: number }[]
      }
      enroll_in_activity: {
        Args: { p_activity_id: string; p_notes?: string | null }
        Returns: Database["public"]["Tables"]["activity_enrollments"]["Row"]
      }
      has_active_access: {
        Args: { p_user?: string }
        Returns: boolean
      }
      claim_cakto_entitlements: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
