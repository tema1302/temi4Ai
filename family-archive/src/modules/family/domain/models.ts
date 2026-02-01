// Чистая бизнес-сущность. Не зависит от базы данных.
export interface FamilyMember {
  id: string
  name: string
  birthDate: string
  deathDate?: string
  biography: string
  photoUrl: string
  photos: string[]
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
    birthDate: '',
    biography: '',
    photoUrl: '',
    photos: [],
    quotes: []
  }
}
