import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Family, FamilyInsert, Member, MemberInsert } from '@/types/supabase'
import type { FamilyData, FamilyMember } from '@/stores/memoryStore'

// ===================
// DEMO DATA (fallback when Supabase not configured)
// ===================
const DEMO_DATA: Record<string, FamilyData> = {
  'smith-family': {
    id: 'smith-family',
    familyName: 'Smith Family',
    heroImage: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1200',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    members: [
      {
        id: 'member-1',
        name: 'Robert James Smith',
        birthDate: '1942-03-15',
        deathDate: '2020-11-28',
        biography: 'Robert was a beloved father, grandfather, and community leader. He spent 40 years as a schoolteacher.',
        photoUrl: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=400',
        photos: [
          'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800',
          'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
        ],
        quotes: [
          '"The best investment you can make is in yourself."',
          '"Family is not just blood. It\'s the people who love you unconditionally."',
        ],
      },
    ],
  },
}

// ===================
// HELPERS
// ===================
function mapDbToFamilyData(family: Family, members: Member[]): FamilyData {
  return {
    id: family.slug,
    familyName: family.name,
    heroImage: family.hero_image || '',
    createdAt: family.created_at,
    updatedAt: family.updated_at,
    members: members.map(m => ({
      id: m.id,
      name: m.name,
      birthDate: m.birth_date || '',
      deathDate: m.death_date || '',
      biography: m.biography || '',
      photoUrl: m.photo_url || '',
      photos: m.photos || [],
      quotes: m.quotes || [],
    })),
  }
}

function mapMemberToDb(member: FamilyMember, familyId: string): MemberInsert {
  return {
    id: member.id,
    family_id: familyId,
    name: member.name,
    birth_date: member.birthDate || null,
    death_date: member.deathDate || null,
    biography: member.biography || null,
    photo_url: member.photoUrl || null,
    photos: member.photos || [],
    quotes: member.quotes || [],
    order_index: 0,
  }
}

// ===================
// API FUNCTIONS
// ===================

/**
 * Fetch family data by slug
 */
export async function fetchFamilyData(familySlug: string): Promise<FamilyData | null> {
  // Fallback to demo if Supabase not configured
  if (!isSupabaseConfigured) {
    await new Promise(r => setTimeout(r, 300))
    return DEMO_DATA[familySlug] || null
  }

  // Fetch from Supabase
  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('*')
    .eq('slug', familySlug)
    .single()

  if (familyError || !family) {
    console.error('Family fetch error:', familyError)
    return null
  }

  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('*')
    .eq('family_id', family.id)
    .order('order_index')

  if (membersError) {
    console.error('Members fetch error:', membersError)
    return null
  }

  return mapDbToFamilyData(family, members || [])
}

/**
 * Save family data (create or update)
 */
export async function saveFamilyData(data: FamilyData, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    localStorage.setItem(`family-archive-${data.id}`, JSON.stringify(data))
    return true
  }

  try {
    // Check if family exists
    const { data: existing } = await supabase
      .from('families')
      .select('id')
      .eq('slug', data.id)
      .single()

    let familyDbId: string

    if (existing) {
      // Update family
      await supabase
        .from('families')
        .update({
          name: data.familyName,
          hero_image: data.heroImage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
      
      familyDbId = existing.id
    } else {
      // Insert new family
      const { data: newFamily, error } = await supabase
        .from('families')
        .insert({
          slug: data.id,
          name: data.familyName,
          hero_image: data.heroImage,
          user_id: userId,
        })
        .select('id')
        .single()

      if (error || !newFamily) throw error
      familyDbId = newFamily.id
    }

    // Upsert members
    for (const member of data.members) {
      const memberData = mapMemberToDb(member, familyDbId)
      
      await supabase
        .from('members')
        .upsert(memberData, { onConflict: 'id' })
    }

    return true
  } catch (err) {
    console.error('Save error:', err)
    return false
  }
}

/**
 * Create a new family archive
 */
export async function createFamilyArchive(familyName: string, userId?: string): Promise<FamilyData> {
  const slug = familyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  
  const newFamily: FamilyData = {
    id: slug,
    familyName,
    heroImage: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members: [],
  }

  if (isSupabaseConfigured && userId) {
    await saveFamilyData(newFamily, userId)
  } else {
    localStorage.setItem(`family-archive-${slug}`, JSON.stringify(newFamily))
  }

  return newFamily
}

/**
 * Fetch all families for a user
 */
export async function fetchUserFamilies(userId: string): Promise<FamilyData[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  const { data: families, error } = await supabase
    .from('families')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error || !families) {
    console.error('Fetch families error:', error)
    return []
  }

  // Fetch members for each family
  const results: FamilyData[] = []
  for (const family of families) {
    const { data: members } = await supabase
      .from('members')
      .select('*')
      .eq('family_id', family.id)
      .order('order_index')

    results.push(mapDbToFamilyData(family, members || []))
  }

  return results
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(file: File, familySlug: string): Promise<string | null> {
  if (!isSupabaseConfigured) {
    // Return object URL for demo mode
    return URL.createObjectURL(file)
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${familySlug}/${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('photos')
    .upload(fileName, file)

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data } = supabase.storage
    .from('photos')
    .getPublicUrl(fileName)

  return data.publicUrl
}

/**
 * Generate member ID
 */
export function generateMemberId(): string {
  return `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create empty member template
 */
export function createEmptyMember(): FamilyMember {
  return {
    id: generateMemberId(),
    name: '',
    birthDate: '',
    deathDate: '',
    biography: '',
    photoUrl: '',
    photos: [],
    quotes: [],
  }
}
