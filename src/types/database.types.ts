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
          lesson_id: string | null
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
          lesson_id?: string | null
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
          lesson_id?: string | null
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
            foreignKeyName: "attendance_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
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
      branches: {
        Row: {
          billing_model: string
          code: string
          created_at: string
          default_package_size: number
          default_price: number | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          billing_model: string
          code: string
          created_at?: string
          default_package_size?: number
          default_price?: number | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          billing_model?: string
          code?: string
          created_at?: string
          default_package_size?: number
          default_price?: number | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      child_coaches: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          child_id: string
          coach_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          child_id: string
          coach_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          child_id?: string
          coach_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_coaches_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_coaches_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_coaches_coach_id_fkey"
            columns: ["coach_id"]
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
          billing_start_date: string | null
          birthday: string | null
          branch_id: string
          class_group_id: string | null
          coach_note: string | null
          created_at: string
          full_name: string
          gender: string | null
          id: string
          license_no: string | null
          notes: string | null
          package_price_override: number | null
          parent_id: string
          payment_due_day: number | null
          start_date: string | null
          tc_no: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          belt_level?: string | null
          billing_start_date?: string | null
          birthday?: string | null
          branch_id: string
          class_group_id?: string | null
          coach_note?: string | null
          created_at?: string
          full_name: string
          gender?: string | null
          id?: string
          license_no?: string | null
          notes?: string | null
          package_price_override?: number | null
          parent_id: string
          payment_due_day?: number | null
          start_date?: string | null
          tc_no?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          belt_level?: string | null
          billing_start_date?: string | null
          birthday?: string | null
          branch_id?: string
          class_group_id?: string | null
          coach_note?: string | null
          created_at?: string
          full_name?: string
          gender?: string | null
          id?: string
          license_no?: string | null
          notes?: string | null
          package_price_override?: number | null
          parent_id?: string
          payment_due_day?: number | null
          start_date?: string | null
          tc_no?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
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
      class_coaches: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          class_id: string
          coach_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          class_id: string
          coach_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          class_id?: string
          coach_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_coaches_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_coaches_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_coaches_coach_id_fkey"
            columns: ["coach_id"]
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
          branch_id: string
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
          branch_id: string
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
          branch_id?: string
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
        Relationships: [
          {
            foreignKeyName: "classes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_branches: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          branch_id: string
          coach_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          branch_id: string
          coach_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          branch_id?: string
          coach_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_branches_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_branches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_branches_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          created_at: string
          id: string
          last_error: string | null
          last_used_at: string | null
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_error?: string | null
          last_used_at?: string | null
          platform: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_error?: string | null
          last_used_at?: string | null
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
      lessons: {
        Row: {
          child_id: string
          class_id: string
          created_at: string
          id: string
          is_extra: boolean
          is_telafi: boolean
          lesson_index: number
          package_id: string | null
          scheduled_date: string
          scheduled_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          child_id: string
          class_id: string
          created_at?: string
          id?: string
          is_extra?: boolean
          is_telafi?: boolean
          lesson_index: number
          package_id?: string | null
          scheduled_date: string
          scheduled_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          child_id?: string
          class_id?: string
          created_at?: string
          id?: string
          is_extra?: boolean
          is_telafi?: boolean
          lesson_index?: number
          package_id?: string | null
          scheduled_date?: string
          scheduled_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
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
          sent_push_at: string | null
          target_role: string | null
          target_user: string | null
          target_user_ids: string[] | null
          title: string
          type: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          link_url?: string | null
          sent_by?: string | null
          sent_push_at?: string | null
          target_role?: string | null
          target_user?: string | null
          target_user_ids?: string[] | null
          title: string
          type?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          link_url?: string | null
          sent_by?: string | null
          sent_push_at?: string | null
          target_role?: string | null
          target_user?: string | null
          target_user_ids?: string[] | null
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
      packages: {
        Row: {
          actual_end_date: string | null
          branch_id: string
          child_id: string
          class_id: string | null
          created_at: string
          id: string
          package_number: number
          payment_id: string | null
          planned_end_date: string | null
          price: number | null
          start_date: string | null
          status: string
          telafi_granted: boolean
          total_slots: number
          updated_at: string
          used_slots: number
        }
        Insert: {
          actual_end_date?: string | null
          branch_id: string
          child_id: string
          class_id?: string | null
          created_at?: string
          id?: string
          package_number: number
          payment_id?: string | null
          planned_end_date?: string | null
          price?: number | null
          start_date?: string | null
          status?: string
          telafi_granted?: boolean
          total_slots?: number
          updated_at?: string
          used_slots?: number
        }
        Update: {
          actual_end_date?: string | null
          branch_id?: string
          child_id?: string
          class_id?: string | null
          created_at?: string
          id?: string
          package_number?: number
          payment_id?: string | null
          planned_end_date?: string | null
          price?: number | null
          start_date?: string | null
          status?: string
          telafi_granted?: boolean
          total_slots?: number
          updated_at?: string
          used_slots?: number
        }
        Relationships: [
          {
            foreignKeyName: "packages_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          child_id: string
          created_at: string
          due_date: string
          id: string
          note: string | null
          package_id: string | null
          paid_at: string | null
          paid_by_id: string | null
          period_end: string | null
          period_month: number | null
          period_start: string | null
          period_year: number | null
          reminder_sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          child_id: string
          created_at?: string
          due_date: string
          id?: string
          note?: string | null
          package_id?: string | null
          paid_at?: string | null
          paid_by_id?: string | null
          period_end?: string | null
          period_month?: number | null
          period_start?: string | null
          period_year?: number | null
          reminder_sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          child_id?: string
          created_at?: string
          due_date?: string
          id?: string
          note?: string | null
          package_id?: string | null
          paid_at?: string | null
          paid_by_id?: string | null
          period_end?: string | null
          period_month?: number | null
          period_start?: string | null
          period_year?: number | null
          reminder_sent_at?: string | null
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
            foreignKeyName: "payments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
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
      performance_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          record_id: string
          sort_order: number
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          record_id: string
          sort_order?: number
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          record_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_photos_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "performance_records"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_records: {
        Row: {
          child_id: string
          created_at: string
          exam_ready: boolean
          forward_reach_cm: number | null
          general_note: string | null
          height_cm: number | null
          id: string
          jump_cm: number | null
          recorded_at: string
          recorded_by: string | null
          split_cm: number | null
          technique_notes: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          child_id: string
          created_at?: string
          exam_ready?: boolean
          forward_reach_cm?: number | null
          general_note?: string | null
          height_cm?: number | null
          id?: string
          jump_cm?: number | null
          recorded_at?: string
          recorded_by?: string | null
          split_cm?: number | null
          technique_notes?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          child_id?: string
          created_at?: string
          exam_ready?: boolean
          forward_reach_cm?: number | null
          general_note?: string | null
          height_cm?: number | null
          id?: string
          jump_cm?: number | null
          recorded_at?: string
          recorded_by?: string | null
          split_cm?: number | null
          technique_notes?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_records_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_records_recorded_by_fkey"
            columns: ["recorded_by"]
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
        Insert: {
          about_coach_label?: string | null
          about_cta_body?: string | null
          about_cta_headline?: string | null
          about_cta_primary_label?: string | null
          about_cta_secondary_label?: string | null
          about_founded_year?: number | null
          about_hero_body?: string | null
          about_hero_headline?: string | null
          about_hero_highlight?: string | null
          about_story_headline?: string | null
          about_story_highlight?: string | null
          about_story_label?: string | null
          about_story_paragraphs?: Json | null
          about_values?: Json | null
          about_values_body?: string | null
          about_values_headline?: string | null
          about_values_highlight?: string | null
          about_values_label?: string | null
          academy_stats?: Json | null
          address?: string | null
          announcements_hero_body?: string | null
          announcements_hero_headline?: string | null
          announcements_hero_highlight?: string | null
          announcements_hero_label?: string | null
          class_faqs?: Json | null
          classes_cta_body?: string | null
          classes_cta_button_label?: string | null
          classes_cta_headline?: string | null
          classes_faq_headline?: string | null
          classes_faq_highlight?: string | null
          classes_faq_label?: string | null
          classes_groups_headline?: string | null
          classes_groups_highlight?: string | null
          classes_groups_label?: string | null
          classes_hero_body?: string | null
          classes_hero_headline?: string | null
          classes_hero_highlight?: string | null
          classes_hero_label?: string | null
          classes_schedule?: Json | null
          classes_schedule_body?: string | null
          classes_schedule_headline?: string | null
          classes_schedule_highlight?: string | null
          classes_schedule_label?: string | null
          coach_bio?: string | null
          coach_credentials?: Json | null
          coach_name?: string | null
          coach_title?: string | null
          contact_channels_headline?: string | null
          contact_channels_label?: string | null
          contact_form_headline?: string | null
          contact_form_label?: string | null
          contact_hero_body?: string | null
          contact_hero_headline?: string | null
          contact_hours_days?: string | null
          contact_hours_time?: string | null
          district?: string | null
          email?: string | null
          google_maps_url?: string | null
          hero_bg_url?: string | null
          hero_cta_primary_href?: string | null
          hero_cta_primary_label?: string | null
          hero_cta_secondary_href?: string | null
          hero_cta_secondary_label?: string | null
          hero_headline?: string | null
          hero_highlight?: string | null
          hero_subtext?: string | null
          home_announcements_body?: string | null
          home_announcements_headline?: string | null
          home_announcements_highlight?: string | null
          home_announcements_label?: string | null
          home_classes_body?: string | null
          home_classes_headline?: string | null
          home_classes_highlight?: string | null
          home_classes_label?: string | null
          home_classes_link_label?: string | null
          home_cta_benefits?: Json | null
          home_cta_body?: string | null
          home_cta_form_subtitle?: string | null
          home_cta_form_title?: string | null
          home_cta_headline?: string | null
          home_cta_headline_highlight?: string | null
          home_cta_headline_suffix?: string | null
          home_cta_label?: string | null
          home_features_body?: string | null
          home_features_cards?: Json | null
          home_features_headline?: string | null
          home_features_highlight?: string | null
          home_features_label?: string | null
          home_hero_overline?: string | null
          home_products_body?: string | null
          home_products_headline?: string | null
          home_products_highlight?: string | null
          home_products_label?: string | null
          id?: number
          instagram?: string | null
          phone?: string | null
          products_cta_body?: string | null
          products_cta_button_label?: string | null
          products_cta_headline?: string | null
          products_hero_body?: string | null
          products_hero_headline?: string | null
          products_hero_highlight?: string | null
          products_hero_label?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          about_coach_label?: string | null
          about_cta_body?: string | null
          about_cta_headline?: string | null
          about_cta_primary_label?: string | null
          about_cta_secondary_label?: string | null
          about_founded_year?: number | null
          about_hero_body?: string | null
          about_hero_headline?: string | null
          about_hero_highlight?: string | null
          about_story_headline?: string | null
          about_story_highlight?: string | null
          about_story_label?: string | null
          about_story_paragraphs?: Json | null
          about_values?: Json | null
          about_values_body?: string | null
          about_values_headline?: string | null
          about_values_highlight?: string | null
          about_values_label?: string | null
          academy_stats?: Json | null
          address?: string | null
          announcements_hero_body?: string | null
          announcements_hero_headline?: string | null
          announcements_hero_highlight?: string | null
          announcements_hero_label?: string | null
          class_faqs?: Json | null
          classes_cta_body?: string | null
          classes_cta_button_label?: string | null
          classes_cta_headline?: string | null
          classes_faq_headline?: string | null
          classes_faq_highlight?: string | null
          classes_faq_label?: string | null
          classes_groups_headline?: string | null
          classes_groups_highlight?: string | null
          classes_groups_label?: string | null
          classes_hero_body?: string | null
          classes_hero_headline?: string | null
          classes_hero_highlight?: string | null
          classes_hero_label?: string | null
          classes_schedule?: Json | null
          classes_schedule_body?: string | null
          classes_schedule_headline?: string | null
          classes_schedule_highlight?: string | null
          classes_schedule_label?: string | null
          coach_bio?: string | null
          coach_credentials?: Json | null
          coach_name?: string | null
          coach_title?: string | null
          contact_channels_headline?: string | null
          contact_channels_label?: string | null
          contact_form_headline?: string | null
          contact_form_label?: string | null
          contact_hero_body?: string | null
          contact_hero_headline?: string | null
          contact_hours_days?: string | null
          contact_hours_time?: string | null
          district?: string | null
          email?: string | null
          google_maps_url?: string | null
          hero_bg_url?: string | null
          hero_cta_primary_href?: string | null
          hero_cta_primary_label?: string | null
          hero_cta_secondary_href?: string | null
          hero_cta_secondary_label?: string | null
          hero_headline?: string | null
          hero_highlight?: string | null
          hero_subtext?: string | null
          home_announcements_body?: string | null
          home_announcements_headline?: string | null
          home_announcements_highlight?: string | null
          home_announcements_label?: string | null
          home_classes_body?: string | null
          home_classes_headline?: string | null
          home_classes_highlight?: string | null
          home_classes_label?: string | null
          home_classes_link_label?: string | null
          home_cta_benefits?: Json | null
          home_cta_body?: string | null
          home_cta_form_subtitle?: string | null
          home_cta_form_title?: string | null
          home_cta_headline?: string | null
          home_cta_headline_highlight?: string | null
          home_cta_headline_suffix?: string | null
          home_cta_label?: string | null
          home_features_body?: string | null
          home_features_cards?: Json | null
          home_features_headline?: string | null
          home_features_highlight?: string | null
          home_features_label?: string | null
          home_hero_overline?: string | null
          home_products_body?: string | null
          home_products_headline?: string | null
          home_products_highlight?: string | null
          home_products_label?: string | null
          id?: number
          instagram?: string | null
          phone?: string | null
          products_cta_body?: string | null
          products_cta_button_label?: string | null
          products_cta_headline?: string | null
          products_hero_body?: string | null
          products_hero_headline?: string | null
          products_hero_highlight?: string | null
          products_hero_label?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
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
      active_package_for_child: {
        Args: { p_child_id: string }
        Returns: string
      }
      append_lesson: {
        Args: { p_kind: string; p_package_id: string }
        Returns: string
      }
      cancel_class_lesson: {
        Args: { p_class_id: string; p_date: string }
        Returns: number
      }
      clamp_day_to_month: {
        Args: { p_day: number; p_month: number; p_year: number }
        Returns: string
      }
      compute_package_price: { Args: { p_child_id: string }; Returns: number }
      confirm_user_email: { Args: { user_id: string }; Returns: undefined }
      dow_to_turkish: { Args: { p_date: string }; Returns: string }
      generate_package_lessons: {
        Args: { p_count?: number; p_package_id: string; p_start_date?: string }
        Returns: undefined
      }
      generate_payment_periods: {
        Args: {
          p_child_id: string
          p_count?: number
          p_due_day: number
          p_start_date: string
        }
        Returns: undefined
      }
      is_admin: { Args: { uid: string }; Returns: boolean }
      is_coach: { Args: { uid: string }; Returns: boolean }
      trigger_attendance_missing: { Args: never; Returns: undefined }
      trigger_birthday_notifications: { Args: never; Returns: undefined }
      trigger_lesson_reminder: { Args: never; Returns: undefined }
      trigger_package_inactive: { Args: never; Returns: undefined }
      trigger_payment_reminders: { Args: never; Returns: undefined }
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
