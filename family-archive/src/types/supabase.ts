// Auto-generated types for Supabase
// In production, generate with: npx supabase gen types typescript

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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          hero_image?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          hero_image?: string | null
          user_id?: string
          updated_at?: string
        }
      }
      members: {
        Row: {
          id: string
          family_id: string
          name: string
          relationship: string | null
          birth_date: string | null
          death_date: string | null
          biography: string | null
          life_path: Json
          photo_url: string | null
          photos: string[]
          videos: Json
          quotes: string[]
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          relationship?: string | null
          birth_date?: string | null
          death_date?: string | null
          biography?: string | null
          life_path?: Json
          photo_url?: string | null
          photos?: string[]
          videos?: Json
          quotes?: string[]
          order_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          relationship?: string | null
          birth_date?: string | null
          death_date?: string | null
          biography?: string | null
          life_path?: Json
          photo_url?: string | null
          photos?: string[]
          videos?: Json
          quotes?: string[]
          order_index?: number
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
