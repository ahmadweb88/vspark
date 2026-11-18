export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  public: {
    Tables: {
      notification_settings: {
        Row: {
          email: string
          enabled: boolean
          message_template: string
          remind_minutes_before: number
          subject_template: string
          updated_at: string
          user_id: string
        }
        Insert: {
          email: string
          enabled?: boolean
          message_template?: string
          remind_minutes_before?: number
          subject_template?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          email?: string
          enabled?: boolean
          message_template?: string
          remind_minutes_before?: number
          subject_template?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          caption: string
          created_at: string
          drive_file_id: string | null
          id: string
          image_path: string | null
          platform: string
          reminder_sent_at: string | null
          scheduled_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          caption: string
          created_at?: string
          drive_file_id?: string | null
          id?: string
          image_path?: string | null
          platform: string
          reminder_sent_at?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          caption?: string
          created_at?: string
          drive_file_id?: string | null
          id?: string
          image_path?: string | null
          platform?: string
          reminder_sent_at?: string | null
          scheduled_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_due_reminders: {
        Args: { p_secret: string }
        Returns: {
          caption: string
          email: string
          id: string
          message_template: string
          platform: string
          scheduled_at: string
          subject_template: string
        }[]
      }
      mark_reminders_sent: {
        Args: { p_ids: string[]; p_secret: string }
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

export type Post = Database['public']['Tables']['posts']['Row']
export type NotificationSettings =
  Database['public']['Tables']['notification_settings']['Row']
