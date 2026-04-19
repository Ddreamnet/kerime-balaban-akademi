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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          category: string
          content: string
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          is_pinned: boolean
          is_published: boolean
          published_at: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          is_pinned?: boolean
          is_published?: boolean
          published_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          is_pinned?: boolean
          is_published?: boolean
          published_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          child_id: string
          class_id: string | null
          created_at: string
          date: string
          id: string
          marked_by: string | null
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          child_id: string
          class_id?: string | null
          created_at?: string
          date: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          child_id?: string
          class_id?: string | null
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          avatar_url: string | null
          belt_level: string | null
          birthday: string | null
          class_group_id: string | null
          created_at: string
          full_name: string
          id: string
          notes: string | null
          parent_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          belt_level?: string | null
          birthday?: string | null
          class_group_id?: string | null
          created_at?: string
          full_name: string
          id?: string
          notes?: string | null
          parent_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          belt_level?: string | null
          birthday?: string | null
          class_group_id?: string | null
          created_at?: string
          full_name?: string
          id?: string
          notes?: string | null
          parent_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_class_group_id_fkey"
            columns: ["class_group_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          age_range: string
          belt_levels: string[]
          capacity: number
          created_at: string
          days: string[]
          description: string
          id: string
          instructor: string
          is_active: boolean
          name: string
          sort_order: number
          time_end: string
          time_start: string
          updated_at: string
        }
        Insert: {
          age_range?: string
          belt_levels?: string[]
          capacity?: number
          created_at?: string
          days?: string[]
          description?: string
          id?: string
          instructor?: string
          is_active?: boolean
          name: string
          sort_order?: number
          time_end: string
          time_start: string
          updated_at?: string
        }
        Update: {
          age_range?: string
          belt_levels?: string[]
          capacity?: number
          created_at?: string
          days?: string[]
          description?: string
          id?: string
          instructor?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          time_end?: string
          time_start?: string
          updated_at?: string
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          attitude_score: number | null
          child_id: string
          created_at: string
          exam_id: string
          id: string
          new_belt: string | null
          notes: string | null
          passed: boolean | null
          scored_at: string | null
          scored_by: string | null
          technical_score: number | null
          updated_at: string
        }
        Insert: {
          attitude_score?: number | null
          child_id: string
          created_at?: string
          exam_id: string
          id?: string
          new_belt?: string | null
          notes?: string | null
          passed?: boolean | null
          scored_at?: string | null
          scored_by?: string | null
          technical_score?: number | null
          updated_at?: string
        }
        Update: {
          attitude_score?: number | null
          child_id?: string
          created_at?: string
          exam_id?: string
          id?: string
          new_belt?: string | null
          notes?: string | null
          passed?: boolean | null
          scored_at?: string | null
          scored_by?: string | null
          technical_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_scored_by_fkey"
            columns: ["scored_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          exam_date: string
          id: string
          is_published: boolean
          location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          exam_date: string
          id?: string
          is_published?: boolean
          location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          exam_date?: string
          id?: string
          is_published?: boolean
          location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_reads: {
        Row: {
          id: string
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_reads_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          link_url: string | null
          sent_by: string | null
          target_role: string | null
          target_user: string | null
          title: string
          type: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          link_url?: string | null
          sent_by?: string | null
          target_role?: string | null
          target_user?: string | null
          title: string
          type?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          link_url?: string | null
          sent_by?: string | null
          target_role?: string | null
          target_user?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_target_user_fkey"
            columns: ["target_user"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          child_id: string
          created_at: string
          id: string
          note: string | null
          paid_at: string | null
          paid_by_id: string | null
          period_month: number
          period_year: number
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          child_id: string
          created_at?: string
          id?: string
          note?: string | null
          paid_at?: string | null
          paid_by_id?: string | null
          period_month: number
          period_year: number
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          child_id?: string
          created_at?: string
          id?: string
          note?: string | null
          paid_at?: string | null
          paid_by_id?: string | null
          period_month?: number
          period_year?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_paid_by_id_fkey"
            columns: ["paid_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_available: boolean
          is_featured: boolean
          is_inquiry_only: boolean
          name: string
          price: number | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          is_inquiry_only?: boolean
          name: string
          price?: number | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_featured?: boolean
          is_inquiry_only?: boolean
          name?: string
          price?: number | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_status: string
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          approval_status?: string
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string
          id: string
          is_active?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          approval_status?: string
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          about_coach_label: string | null
          about_cta_body: string | null
          about_cta_headline: string | null
          about_cta_primary_label: string | null
          about_cta_secondary_label: string | null
          about_founded_year: number | null
          about_hero_body: string | null
          about_hero_headline: string | null
          about_hero_highlight: string | null
          about_story_headline: string | null
          about_story_highlight: string | null
          about_story_label: string | null
          about_story_paragraphs: Json | null
          about_values: Json | null
          about_values_body: string | null
          about_values_headline: string | null
          about_values_highlight: string | null
          about_values_label: string | null
          academy_stats: Json | null
          address: string | null
          announcements_hero_body: string | null
          announcements_hero_headline: string | null
          announcements_hero_highlight: string | null
          announcements_hero_label: string | null
          class_faqs: Json | null
          classes_cta_body: string | null
          classes_cta_button_label: string | null
          classes_cta_headline: string | null
          classes_faq_headline: string | null
          classes_faq_highlight: string | null
          classes_faq_label: string | null
          classes_groups_headline: string | null
          classes_groups_highlight: string | null
          classes_groups_label: string | null
          classes_hero_body: string | null
          classes_hero_headline: string | null
          classes_hero_highlight: string | null
          classes_hero_label: string | null
          classes_schedule: Json | null
          classes_schedule_body: string | null
          classes_schedule_headline: string | null
          classes_schedule_highlight: string | null
          classes_schedule_label: string | null
          coach_bio: string | null
          coach_credentials: Json | null
          coach_name: string | null
          coach_title: string | null
          contact_channels_headline: string | null
          contact_channels_label: string | null
          contact_form_headline: string | null
          contact_form_label: string | null
          contact_hero_body: string | null
          contact_hero_headline: string | null
          contact_hours_days: string | null
          contact_hours_time: string | null
          district: string | null
          email: string | null
          google_maps_url: string | null
          hero_bg_url: string | null
          hero_cta_primary_href: string | null
          hero_cta_primary_label: string | null
          hero_cta_secondary_href: string | null
          hero_cta_secondary_label: string | null
          hero_headline: string | null
          hero_highlight: string | null
          hero_subtext: string | null
          home_announcements_body: string | null
          home_announcements_headline: string | null
          home_announcements_highlight: string | null
          home_announcements_label: string | null
          home_classes_body: string | null
          home_classes_headline: string | null
          home_classes_highlight: string | null
          home_classes_label: string | null
          home_classes_link_label: string | null
          home_cta_benefits: Json | null
          home_cta_body: string | null
          home_cta_form_subtitle: string | null
          home_cta_form_title: string | null
          home_cta_headline: string | null
          home_cta_headline_highlight: string | null
          home_cta_headline_suffix: string | null
          home_cta_label: string | null
          home_features_body: string | null
          home_features_cards: Json | null
          home_features_headline: string | null
          home_features_highlight: string | null
          home_features_label: string | null
          home_hero_overline: string | null
          home_products_body: string | null
          home_products_headline: string | null
          home_products_highlight: string | null
          home_products_label: string | null
          id: number
          instagram: string | null
          phone: string | null
          products_cta_body: string | null
          products_cta_button_label: string | null
          products_cta_headline: string | null
          products_hero_body: string | null
          products_hero_headline: string | null
          products_hero_highlight: string | null
          products_hero_label: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: Partial<Database['public']['Tables']['site_content']['Row']>
        Update: Partial<Database['public']['Tables']['site_content']['Row']>
        Relationships: []
      }
      student_notes: {
        Row: {
          body: string | null
          category: string
          child_id: string
          coach_id: string
          created_at: string
          id: string
          note_date: string
          rating: number | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          category?: string
          child_id: string
          coach_id: string
          created_at?: string
          id?: string
          note_date?: string
          rating?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          category?: string
          child_id?: string
          coach_id?: string
          created_at?: string
          id?: string
          note_date?: string
          rating?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_notes_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_notes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirm_user_email: { Args: { user_id: string }; Returns: undefined }
      is_admin: { Args: { uid: string }; Returns: boolean }
      is_coach: { Args: { uid: string }; Returns: boolean }
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
