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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_summary: {
        Row: {
          avg_confidence: number | null
          compliant_count: number | null
          created_at: string | null
          date: string
          id: string
          partial_count: number | null
          total_detections: number | null
          user_id: string | null
          violation_count: number | null
        }
        Insert: {
          avg_confidence?: number | null
          compliant_count?: number | null
          created_at?: string | null
          date?: string
          id?: string
          partial_count?: number | null
          total_detections?: number | null
          user_id?: string | null
          violation_count?: number | null
        }
        Update: {
          avg_confidence?: number | null
          compliant_count?: number | null
          created_at?: string | null
          date?: string
          id?: string
          partial_count?: number | null
          total_detections?: number | null
          user_id?: string | null
          violation_count?: number | null
        }
        Relationships: []
      }
      detections: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          detection_results: Json
          id: string
          image_url: string
          overall_status: Database["public"]["Enums"]["ppe_status"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          detection_results: Json
          id?: string
          image_url: string
          overall_status: Database["public"]["Enums"]["ppe_status"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          detection_results?: Json
          id?: string
          image_url?: string
          overall_status?: Database["public"]["Enums"]["ppe_status"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          auto_alert: boolean | null
          confidence_threshold: number | null
          created_at: string | null
          enabled_ppe_types: Json | null
          id: string
          save_snapshots: boolean | null
          show_bboxes: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_alert?: boolean | null
          confidence_threshold?: number | null
          created_at?: string | null
          enabled_ppe_types?: Json | null
          id?: string
          save_snapshots?: boolean | null
          show_bboxes?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_alert?: boolean | null
          confidence_threshold?: number | null
          created_at?: string | null
          enabled_ppe_types?: Json | null
          id?: string
          save_snapshots?: boolean | null
          show_bboxes?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      violations: {
        Row: {
          created_at: string | null
          detection_id: string | null
          id: string
          location: string | null
          missing_ppe: Database["public"]["Enums"]["ppe_type"]
          resolved: boolean | null
          resolved_at: string | null
          severity: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          detection_id?: string | null
          id?: string
          location?: string | null
          missing_ppe: Database["public"]["Enums"]["ppe_type"]
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          detection_id?: string | null
          id?: string
          location?: string | null
          missing_ppe?: Database["public"]["Enums"]["ppe_type"]
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "violations_detection_id_fkey"
            columns: ["detection_id"]
            isOneToOne: false
            referencedRelation: "detections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ppe_status: "compliant" | "violation" | "partial"
      ppe_type: "helmet" | "vest" | "gloves" | "mask" | "goggles" | "boots"
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
    Enums: {
      ppe_status: ["compliant", "violation", "partial"],
      ppe_type: ["helmet", "vest", "gloves", "mask", "goggles", "boots"],
    },
  },
} as const
