// Чистая бизнес-сущность. Не зависит от базы данных.
export interface FamilyMember {
  id: string
  name: string
  relationship?: string
  birthDate: string
  deathDate?: string
  biography: string
  lifePath?: { year: string; title: string; description: string }[]
  photoUrl: string
  photos: string[]
  videos?: string[]
  quotes: string[]
}

export interface FamilyArchive {
  id: string // slug
  name: string
  heroImage: string
  members: FamilyMember[]
  createdAt: string
  updatedAt: string
}

// Фабрика для создания пустого члена семьи
export function createEmptyMember(): FamilyMember {
  return {
    id: crypto.randomUUID(),
    name: '',
    relationship: '',
    birthDate: '',
    biography: '',
    lifePath: [],
    photoUrl: '',
    photos: [],
    videos: [],
    quotes: []
  }
}
