// Auto-generated types for Supabase
// Updated to include analytics and profiles

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          slug: string
          name: string
          hero_image: string | null
          user_id: string
          root_member_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          hero_image?: string | null
          user_id: string
          root_member_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          hero_image?: string | null
          user_id?: string
          root_member_id?: string | null
          updated_at?: string
        }
      }
      members: {
        Row: {
          id: string
          family_id: string
          name: string
          relationship: string | null
          gender: string | null
          generation: number
          display_role: string | null
          birth_date: string | null
          death_date: string | null
          biography: string | null
          life_path: Json
          photo_url: string | null
          photos: string[]
          videos: Json
          quotes: string[]
          order_index: number
          tree_position: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          relationship?: string | null
          gender?: string | null
          generation?: number
          display_role?: string | null
          birth_date?: string | null
          death_date?: string | null
          biography?: string | null
          life_path?: Json
          photo_url?: string | null
          photos?: string[]
          videos?: Json
          quotes?: string[]
          order_index?: number
          tree_position?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          relationship?: string | null
          gender?: string | null
          generation?: number
          display_role?: string | null
          birth_date?: string | null
          death_date?: string | null
          biography?: string | null
          life_path?: Json
          photo_url?: string | null
          photos?: string[]
          videos?: Json
          quotes?: string[]
          order_index?: number
          tree_position?: Json | null
          updated_at?: string
        }
      }
      family_relations: {
        Row: {
          id: string
          family_id: string
          from_member_id: string
          to_member_id: string
          relation_type: string
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          from_member_id: string
          to_member_id: string
          relation_type: string
          created_at?: string
        }
        Update: {
          relation_type?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          event_name: string
          metadata: Json
          session_id: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_name: string
          metadata?: Json
          session_id?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          event_name?: string
          metadata?: Json
          session_id?: string | null
          user_id?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          subscription_tier: string
          subscription_status: string
          subscription_period_end: string | null
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          subscription_tier?: string
          subscription_status?: string
          subscription_period_end?: string | null
          stripe_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string | null
          subscription_tier?: string
          subscription_status?: string
          subscription_period_end?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
      }
    }
  }
}

// Convenience types
export type Family = Database['public']['Tables']['families']['Row']
export type FamilyInsert = Database['public']['Tables']['families']['Insert']
export type Member = Database['public']['Tables']['members']['Row']
export type MemberInsert = Database['public']['Tables']['members']['Insert']
export type FamilyRelation = Database['public']['Tables']['family_relations']['Row']
export type FamilyRelationInsert = Database['public']['Tables']['family_relations']['Insert']
export type Profile = Database['public']['Tables']['profiles']['Row']
