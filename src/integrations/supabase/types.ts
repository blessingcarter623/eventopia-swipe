export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          event_id: string
          id: string
          likes: number | null
          parent_id: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          content: string
          event_id: string
          id?: string
          likes?: number | null
          parent_id?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          content?: string
          event_id?: string
          id?: string
          likes?: number | null
          parent_id?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      event_videos: {
        Row: {
          created_at: string
          description: string | null
          event_date: string | null
          event_price: string | null
          event_time: string | null
          id: string
          location: string | null
          media_url: string | null
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_price?: string | null
          event_time?: string | null
          id?: string
          location?: string | null
          media_url?: string | null
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_price?: string | null
          event_time?: string | null
          id?: string
          location?: string | null
          media_url?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          category: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          location: string | null
          location_lat: number | null
          location_lng: number | null
          media_type: string | null
          media_url: string | null
          organizer_id: string
          price: number | null
          tags: string[] | null
          thumbnail_url: string | null
          time: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          location?: string | null
          location_lat?: number | null
          location_lng?: number | null
          media_type?: string | null
          media_url?: string | null
          organizer_id: string
          price?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          time?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          location?: string | null
          location_lat?: number | null
          location_lng?: number | null
          media_type?: string | null
          media_url?: string | null
          organizer_id?: string
          price?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          time?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      livestream_cameras: {
        Row: {
          camera_label: string
          created_at: string
          id: string
          is_active: boolean | null
          join_token: string
          joined_at: string | null
          left_at: string | null
          livestream_id: string
          user_id: string
        }
        Insert: {
          camera_label: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          join_token: string
          joined_at?: string | null
          left_at?: string | null
          livestream_id: string
          user_id: string
        }
        Update: {
          camera_label?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          join_token?: string
          joined_at?: string | null
          left_at?: string | null
          livestream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "livestream_cameras_livestream_id_fkey"
            columns: ["livestream_id"]
            isOneToOne: false
            referencedRelation: "livestreams"
            referencedColumns: ["id"]
          },
        ]
      }
      livestreams: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          created_at: string
          description: string | null
          host_id: string
          id: string
          recording_url: string | null
          scheduled_start: string | null
          status: string
          stream_key: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          description?: string | null
          host_id: string
          id?: string
          recording_url?: string | null
          scheduled_start?: string | null
          status?: string
          stream_key: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          created_at?: string
          description?: string | null
          host_id?: string
          id?: string
          recording_url?: string | null
          scheduled_start?: string | null
          status?: string
          stream_key?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      organizer_wallets: {
        Row: {
          balance: number
          id: string
          last_updated: string | null
          organizer_id: string
        }
        Insert: {
          balance?: number
          id?: string
          last_updated?: string | null
          organizer_id: string
        }
        Update: {
          balance?: number
          id?: string
          last_updated?: string | null
          organizer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizer_wallets_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          buyer_id: string
          event_id: string
          id: string
          is_free: boolean | null
          organizer_id: string
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          status: string | null
          ticket_id: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          event_id: string
          id?: string
          is_free?: boolean | null
          organizer_id: string
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          ticket_id?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          event_id?: string
          id?: string
          is_free?: boolean | null
          organizer_id?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          followers: number | null
          following: number | null
          id: string
          is_verified: boolean | null
          posts: number | null
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          followers?: number | null
          following?: number | null
          id: string
          is_verified?: boolean | null
          posts?: number | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          followers?: number | null
          following?: number | null
          id?: string
          is_verified?: boolean | null
          posts?: number | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      ticket_types: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          event_id: string
          id: string
          is_active: boolean | null
          max_per_purchase: number | null
          name: string
          price: number
          quantity: number
          sold: number | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_id: string
          id?: string
          is_active?: boolean | null
          max_per_purchase?: number | null
          name: string
          price: number
          quantity: number
          sold?: number | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          event_id?: string
          id?: string
          is_active?: boolean | null
          max_per_purchase?: number | null
          name?: string
          price?: number
          quantity?: number
          sold?: number | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          checked_in: boolean | null
          checked_in_at: string | null
          created_at: string | null
          event_id: string
          id: string
          price: number
          purchase_date: string | null
          qr_code: string | null
          status: string | null
          ticket_type_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          price: number
          purchase_date?: string | null
          qr_code?: string | null
          status?: string | null
          ticket_type_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          price?: number
          purchase_date?: string | null
          qr_code?: string | null
          status?: string | null
          ticket_type_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_organizer_balance: {
        Args: {
          p_organizer_id: string
          p_amount: number
        }
        Returns: boolean
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
