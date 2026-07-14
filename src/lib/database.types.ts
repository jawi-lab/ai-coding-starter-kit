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
      activities: {
        Row: {
          created_at: string
          current_votes: number
          description: string | null
          duration_category: string
          end_date: string | null
          group_id: string
          id: string
          initiator_id: string
          last_changed_by: string | null
          location: string | null
          name: string
          og_image_url: string | null
          required_votes: number
          start_date: string | null
          status: string
          url: string | null
        }
        Insert: {
          created_at?: string
          current_votes?: number
          description?: string | null
          duration_category: string
          end_date?: string | null
          group_id: string
          id?: string
          initiator_id: string
          last_changed_by?: string | null
          location?: string | null
          name: string
          og_image_url?: string | null
          required_votes: number
          start_date?: string | null
          status?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          current_votes?: number
          description?: string | null
          duration_category?: string
          end_date?: string | null
          group_id?: string
          id?: string
          initiator_id?: string
          last_changed_by?: string | null
          location?: string | null
          name?: string
          og_image_url?: string | null
          required_votes?: number
          start_date?: string | null
          status?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_last_changed_by_fkey"
            columns: ["last_changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_comments: {
        Row: {
          activity_id: string
          content: Json
          created_at: string
          id: string
          mentioned_user_ids: string[]
          user_id: string
        }
        Insert: {
          activity_id: string
          content: Json
          created_at?: string
          id?: string
          mentioned_user_ids?: string[]
          user_id: string
        }
        Update: {
          activity_id?: string
          content?: Json
          created_at?: string
          id?: string
          mentioned_user_ids?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_comments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_photos: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          storage_path: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          storage_path: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_photos_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_poll_options: {
        Row: {
          activity_id: string
          id: string
          option_text: string
          poll_id: string
          position: number
        }
        Insert: {
          activity_id: string
          id?: string
          option_text: string
          poll_id: string
          position: number
        }
        Update: {
          activity_id?: string
          id?: string
          option_text?: string
          poll_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "activity_poll_options_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "activity_polls"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_poll_votes: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          option_id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          option_id: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          option_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_poll_votes_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "activity_poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_poll_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_polls: {
        Row: {
          activity_id: string
          created_at: string
          created_by: string
          id: string
          question: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          created_by: string
          id?: string
          question: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          created_by?: string
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_polls_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_polls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_responsibilities: {
        Row: {
          activity_id: string
          assigned_user_id: string
          completed_at: string | null
          created_at: string
          created_by: string
          done: boolean
          id: string
          label: string
        }
        Insert: {
          activity_id: string
          assigned_user_id: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          done?: boolean
          id?: string
          label: string
        }
        Update: {
          activity_id?: string
          assigned_user_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          done?: boolean
          id?: string
          label?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_responsibilities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_responsibilities_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_responsibilities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_votes: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_votes_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_connections: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          google_email: string
          id: string
          refresh_token: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          google_email: string
          id?: string
          refresh_token: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          google_email?: string
          id?: string
          refresh_token?: string
          user_id?: string
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
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
      group_availability_cache: {
        Row: {
          cached_at: string
          data: Json
          group_id: string
          id: string
        }
        Insert: {
          cached_at?: string
          data?: Json
          group_id: string
          id?: string
        }
        Update: {
          cached_at?: string
          data?: Json
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_availability_cache_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: true
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_momentum: {
        Row: {
          completed_count: number
          group_id: string
          highest_milestone: number
          updated_at: string
        }
        Insert: {
          completed_count?: number
          group_id: string
          highest_milestone?: number
          updated_at?: string
        }
        Update: {
          completed_count?: number
          group_id?: string
          highest_milestone?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_momentum_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: true
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_momentum_seen: {
        Row: {
          group_id: string
          highest_seen_milestone: number
          updated_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          highest_seen_milestone?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          highest_seen_milestone?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_momentum_seen_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string | null
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code?: string | null
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string | null
          name?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          email_enabled: boolean
          event: string
          push_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          email_enabled?: boolean
          event: string
          push_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          email_enabled?: boolean
          event?: string
          push_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          activity_id: string | null
          body: string
          created_at: string
          event: string
          group_id: string
          id: string
          read: boolean
          tab: string | null
          title: string
          user_id: string
        }
        Insert: {
          activity_id?: string | null
          body: string
          created_at?: string
          event: string
          group_id: string
          id?: string
          read?: boolean
          tab?: string | null
          title: string
          user_id: string
        }
        Update: {
          activity_id?: string | null
          body?: string
          created_at?: string
          event?: string
          group_id?: string
          id?: string
          read?: boolean
          tab?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          onboarded: boolean
          // Hand-narrowed (gen types emits `string`): the app's Profile type relies on this union.
          status: 'pending' | 'active'
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          id: string
          onboarded?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          onboarded?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          action_count: number
          badge: string
          highest_earned_tier: number
          highest_seen_tier: number
          updated_at: string
          user_id: string
        }
        Insert: {
          action_count?: number
          badge: string
          highest_earned_tier?: number
          highest_seen_tier?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          action_count?: number
          badge?: string
          highest_earned_tier?: number
          highest_seen_tier?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_date_blocks: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          start_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      badge_count_for: {
        Args: { p_badge: string; p_user_id: string }
        Returns: number
      }
      badge_tier_for: { Args: { p_count: number }; Returns: number }
      create_group_with_membership: { Args: { p_name: string }; Returns: Json }
      get_group_badges: {
        Args: { p_group_id: string }
        Returns: {
          badge: string
          earned_tier: number
          user_id: string
        }[]
      }
      is_activity_group_member: { Args: { aid: string }; Returns: boolean }
      is_activity_polls_writable: { Args: { aid: string }; Returns: boolean }
      is_group_admin: { Args: { gid: string }; Returns: boolean }
      is_group_member: { Args: { gid: string }; Returns: boolean }
      join_group_by_invite_code: {
        Args: { p_invite_code: string }
        Returns: Json
      }
      mark_own_badges_seen: { Args: never; Returns: undefined }
      momentum_milestone_for: { Args: { p_count: number }; Returns: number }
      refresh_activity_contributor_badges: {
        Args: { p_activity_id: string; p_initiator_id: string }
        Returns: undefined
      }
      refresh_group_momentum: {
        Args: { p_group_id: string }
        Returns: undefined
      }
      refresh_user_badge: {
        Args: { p_badge: string; p_user_id: string }
        Returns: undefined
      }
      register_device_token: {
        Args: { p_platform: string; p_token: string }
        Returns: undefined
      }
      reset_activity_votes: {
        Args: { p_activity_id: string }
        Returns: undefined
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
