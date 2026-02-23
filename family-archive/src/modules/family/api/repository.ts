import { supabase } from '@/lib/supabase'
import type { FamilyArchive, FamilyMember, FamilyRelation } from '../domain/models'
import type { Family, Member, MemberInsert, FamilyRelation as DbRelation, FamilyRelationInsert } from '@/types/supabase'

const STORAGE_BUCKET = 'photos'

// DTO Mapping Helpers
function mapToDomain(
  family: Family,
  members: Member[],
  relations: DbRelation[]
): FamilyArchive {
  return {
    id: family.slug,
    name: family.name,
    heroImage: family.hero_image || '',
    ownerId: family.user_id,
    createdAt: family.created_at,
    updatedAt: family.updated_at,
    rootMemberId: family.root_member_id || undefined,
    members: members.map(m => {
      return {
        id: m.id,
        name: m.name,
        relationship: m.relationship || '',
        gender: m.gender as 'male' | 'female' | 'unknown' | undefined,
        generation: m.generation,
        displayRole: m.display_role || undefined,
        birthDate: m.birth_date || '',
        deathDate: m.death_date || '',
        biography: m.biography || '',
        lifePath: (m.life_path as any) || [],
        photoUrl: m.photo_url || '',
        photos: m.photos || [],
        videos: (m.videos as any) || [],
        quotes: m.quotes || [],
        treePosition: m.tree_position as { x: number; y: number } | undefined,
      }
    }),
    relations: relations.map(r => ({
      id: r.id,
      fromMemberId: r.from_member_id,
      toMemberId: r.to_member_id,
      relationType: r.relation_type as 'parent' | 'spouse' | 'sibling',
      createdAt: r.created_at,
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
      .from(STORAGE_BUCKET)
      .upload(filePath, file)

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
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

    // Загружаем связи
    const { data: relations, error: relationsError } = await supabase
      .from('family_relations')
      .select('*')
      .eq('family_id', family.id)

    if (relationsError) {
      console.error('Repository: Relations fetch error', relationsError)
      // Не прерываем, связи могут отсутствовать
    }

    return mapToDomain(family, members || [], relations || [])
  }

  /**
   * Получить все семьи пользователя
   * TODO: Refactor to batch-request to avoid N+1 query issue
   */
  static async getAllByUser(userId: string): Promise<FamilyArchive[]> {
    const { data: families, error } = await supabase
      .from('families')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error || !families) return []

    const results: FamilyArchive[] = []

    for (const f of families) {
      const { data: members } = await supabase
        .from('members')
        .select('*')
        .eq('family_id', f.id)

      const { data: relations } = await supabase
        .from('family_relations')
        .select('*')
        .eq('family_id', f.id)

      results.push(mapToDomain(f, members || [], relations || []))
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
            root_member_id: archive.rootMemberId || null,
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
            root_member_id: archive.rootMemberId || null,
            user_id: userId
          })
          .select('id')
          .single()

        if (error || !newFamily) throw error
        dbId = newFamily.id
      }

      if (!dbId) throw new Error('Failed to resolve Family DB ID')

      // 2. Batch Upsert Members
      if (archive.members.length > 0) {
        const memberPayloads: MemberInsert[] = archive.members.map(m => ({
          id: m.id,
          family_id: dbId as string,
          name: m.name,
          relationship: m.relationship || null,
          gender: m.gender || null,
          generation: m.generation || 0,
          display_role: m.displayRole || null,
          birth_date: m.birthDate || null,
          death_date: m.deathDate || null,
          biography: m.biography || null,
          life_path: m.lifePath as any,
          photo_url: m.photoUrl || null,
          photos: m.photos || [],
          videos: m.videos as any,
          quotes: m.quotes || [],
          tree_position: m.treePosition as any,
        }))

        const { error: membersError } = await supabase.from('members').upsert(memberPayloads)
        if (membersError) {
          console.error('[Repository] Error batch saving members:', membersError)
        }
      }

      // 3. Batch Upsert Relations
      if (archive.relations.length > 0) {
        const relationPayloads: FamilyRelationInsert[] = archive.relations.map(r => ({
          id: r.id,
          family_id: dbId as string,
          from_member_id: r.fromMemberId,
          to_member_id: r.toMemberId,
          relation_type: r.relationType,
        }))

        const { error: relationsError } = await supabase.from('family_relations').upsert(relationPayloads)
        if (relationsError) {
          console.error('[Repository] Error batch saving relations:', relationsError)
        }
      }

      return true
    } catch (e) {
      console.error('Repository: Save failed', e)
      return false
    }
  }

  /**
   * Проверить доступность слага (slug)
   */
  static async checkSlugAvailability(slug: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('families')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (error) return false
    return !data
  }

  static async delete(slug: string): Promise<boolean> {
    const { error } = await supabase.from('families').delete().eq('slug', slug)
    return !error
  }

  static async deleteMember(id: string): Promise<boolean> {
    const { error } = await supabase.from('members').delete().eq('id', id)
    return !error
  }

  static async deleteRelation(id: string): Promise<boolean> {
    const { error } = await supabase.from('family_relations').delete().eq('id', id)
    return !error
  }
}
