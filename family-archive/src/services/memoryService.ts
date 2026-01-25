import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Family, Member, MemberInsert } from '@/types/supabase'
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

  // FIX: Use maybeSingle() instead of single() to handle 0 results
  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('*')
    .eq('slug', familySlug)
    .maybeSingle()

  if (familyError) {
    console.error('Family fetch error:', familyError)
    return null
  }

  if (!family) {
    // Family doesn't exist, check demo data
    return DEMO_DATA[familySlug] || null
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

  // DEBUG: Verify current session before saving
  const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !currentUser) {
    console.error('CRITICAL: Cannot save - no active Supabase session found.', userError)
    return false
  }

  if (currentUser.id !== userId) {
    console.warn('WARNING: Mismatch between passed userId and session userId. Using session ID.')
    userId = currentUser.id
  }

  try {
    // Check if family exists
    // Fix: Using maybeSingle to handle 0 rows gracefully
    const { data: existing, error: checkError } = await supabase
      .from('families')
      .select('id')
      .eq('slug', data.id)
      .maybeSingle()

    console.log('Checking family existence:', { slug: data.id, existing, checkError })

    let familyDbId: string

    if (existing) {
      // Update family
      const { error: updateError } = await supabase
        .from('families')
        .update({
          name: data.familyName,
          hero_image: data.heroImage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
      
      if (updateError) throw updateError
      familyDbId = existing.id
    } else {
      // Insert new family
      console.log('Attempting INSERT with:', {
        slug: data.id,
        name: data.familyName,
        user_id: userId,
        auth_uid: currentUser.id
      })

      const { data: newFamily, error: insertError } = await supabase
        .from('families')
        .insert({
          slug: data.id,
          name: data.familyName,
          hero_image: data.heroImage || null,
          user_id: userId,
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Supabase INSERT failed:', insertError)
        console.error('Hint: Check RLS policies. Ensure "auth.uid() = user_id" policy exists on INSERT.')
        throw insertError
      }
      
      if (!newFamily) throw new Error('Insert successful but no data returned')
      
      familyDbId = newFamily.id
    }

    // Upsert members
    for (const member of data.members) {
      const memberData = mapMemberToDb(member, familyDbId)
      
      // Remove created_at from upsert to avoid issues if column is managed by DB
      const { created_at, ...upsertData } = memberData as any

      const { error: memberError } = await supabase
        .from('members')
        .upsert(upsertData, { onConflict: 'id' })
      
      if (memberError) {
        console.error('Member upsert error:', memberError)
      }
    }

    return true
  } catch (err) {
    console.error('Save operation failed:', err)
    return false
  }
}

/**
 * Create a new family archive
 */
export async function createFamilyArchive(familyName: string, userId?: string): Promise<FamilyData> {
  // Enhanced Transliteration
  const ruMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  }

  const transliterated = familyName.toLowerCase().split('').map(char => {
    return ruMap[char] || char
  }).join('')

  // Sanitize: allow only a-z, 0-9, and hyphen
  let slug = transliterated
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-')         // Sample Spaces to hyphens
    .replace(/-+/g, '-')          // Remove duplicate hyphens

  // Fallback if slug became empty (e.g. only special chars used)
  if (!slug || slug.length < 2) {
    slug = `family-${Date.now().toString(36)}`
  }

  // Ensure randomness/uniqueness locally to avoid immediate collision before DB check
  // (Optional: could append random suffix if we wanted strictly unique, but user might want pretty URL)
  
  const newFamily: FamilyData = {
    id: slug,
    familyName,
    heroImage: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members: [],
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
 * Delete a family archive
 */
export async function deleteFamily(familySlug: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    localStorage.removeItem(`family-archive-${familySlug}`)
    return true
  }

  const { error } = await supabase
    .from('families')
    .delete()
    .eq('slug', familySlug)

  if (error) {
    console.error('Delete family error:', error)
    return false
  }

  return true
}

/**
 * Delete a member
 */
export async function deleteMember(memberId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return true // LocalStorage sync handled by saving the whole family object
  }

  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', memberId)

  if (error) {
    console.error('Delete member error:', error)
    return false
  }

  return true
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(file: File, familySlug: string): Promise<string | null> {
  if (!isSupabaseConfigured) {
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
  return crypto.randomUUID()
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
