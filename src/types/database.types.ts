export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
          address: string | null
          district: string | null
          email: string | null
          google_maps_url: string | null
          hero_bg_url: string | null
          hero_headline: string | null
          hero_highlight: string | null
          hero_subtext: string | null
          id: number
          instagram: string | null
          phone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          district?: string | null
          email?: string | null
          google_maps_url?: string | null
          hero_bg_url?: string | null
          hero_headline?: string | null
          hero_highlight?: string | null
          hero_subtext?: string | null
          id?: number
          instagram?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          district?: string | null
          email?: string | null
          google_maps_url?: string | null
          hero_bg_url?: string | null
          hero_headline?: string | null
          hero_highlight?: string | null
          hero_subtext?: string | null
          id?: number
          instagram?: string | null
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
