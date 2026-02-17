import { supabase } from '@/lib/supabase'
import type { FamilyArchive, FamilyMember } from '../domain/models'
import type { Family, Member } from '@/types/supabase'

// DTO Mapping Helpers
function mapToDomain(family: Family, members: Member[]): FamilyArchive {
  return {
    id: family.slug,
    name: family.name,
    heroImage: family.hero_image || '',
    createdAt: family.created_at,
    updatedAt: family.updated_at,
    members: members.map(m => ({
      id: m.id,
      name: m.name,
      relationship: (m as any).relationship || '',
      birthDate: m.birth_date || '',
      deathDate: m.death_date || '',
      biography: m.biography || '',
      lifePath: (m as any).life_path || [],
      photoUrl: m.photo_url || '',
      photos: m.photos || [],
      videos: (m as any).videos || [],
      quotes: m.quotes || [],
    }))
  }
}

// Repository Class
export class FamilyRepository {

  /**
   * Загрузить файл в хранилище Supabase
   */
  static async uploadFile(file: File, path: string): Promise<string | null> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { error } = await supabase.storage
      .from('photos')
      .upload(filePath, file)

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    const { data } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath)

    return data.publicUrl
  }
  
  /**
   * Загрузить семью по слагу (slug)
   */
  static async getBySlug(slug: string): Promise<FamilyArchive | null> {
    const { data: family, error } = await supabase
      .from('families')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error || !family) {
      console.warn('Repository: Family not found or error', error)
      return null
    }

    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
      .eq('family_id', family.id)
      .order('order_index')

    if (membersError) {
      console.error('Repository: Members fetch error', membersError)
      return null
    }

    return mapToDomain(family, members || [])
  }

  /**
   * Получить все семьи пользователя
   */
  static async getAllByUser(userId: string): Promise<FamilyArchive[]> {
    const { data: families, error } = await supabase
      .from('families')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error || !families) return []

    const results: FamilyArchive[] = []
    
    // Fetch all members for all families in one go if needed.
    for (const f of families) {
      const { data: members } = await supabase
        .from('members')
        .select('*')
        .eq('family_id', f.id)
      
      results.push(mapToDomain(f, members || []))
    }

    return results
  }

  /**
   * Сохранить (Создать или Обновить) архив
   */
  static async save(archive: FamilyArchive, userId: string): Promise<boolean> {
    try {
      // 1. Check or Create Family
      const { data: existing } = await supabase
        .from('families')
        .select('id')
        .eq('slug', archive.id)
        .maybeSingle()

      let dbId = existing?.id

      if (existing) {
        await supabase
          .from('families')
          .update({
            name: archive.name,
            hero_image: archive.heroImage,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
      } else {
        const { data: newFamily, error } = await supabase
          .from('families')
          .insert({
            slug: archive.id,
            name: archive.name,
            hero_image: archive.heroImage,
            user_id: userId
          })
          .select('id')
          .single()
        
        if (error || !newFamily) throw error
        dbId = newFamily.id
      }

      if (!dbId) throw new Error('Failed to resolve Family DB ID')

      // 2. Upsert Members
      for (const m of archive.members) {
        const payload = {
          id: m.id,
          family_id: dbId,
          name: m.name,
          relationship: m.relationship || null,
          birth_date: m.birthDate || null,
          death_date: m.deathDate || null,
          biography: m.biography || null,
          life_path: m.lifePath || [],
          photo_url: m.photoUrl || null,
          photos: m.photos || [],
          videos: m.videos || [],
          quotes: m.quotes || [],
        }
        
        await supabase.from('members').upsert(payload)
      }

      return true
    } catch (e) {
      console.error('Repository: Save failed', e)
      return false
    }
  }

  static async delete(slug: string): Promise<boolean> {
    const { error } = await supabase.from('families').delete().eq('slug', slug)
    return !error
  }

  static async deleteMember(id: string): Promise<boolean> {
    const { error } = await supabase.from('members').delete().eq('id', id)
    return !error
  }
}
