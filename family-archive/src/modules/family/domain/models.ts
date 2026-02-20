// Чистая бизнес-сущность. Не зависит от базы данных.

// Типы родственных связей
export type RelationType = 'parent' | 'spouse' | 'sibling'

// Тип пола
export type Gender = 'male' | 'female' | 'unknown'

// Связь между членами семьи
export interface FamilyRelation {
  id: string
  fromMemberId: string    // UUID члена семьи (от кого)
  toMemberId: string      // UUID члена семьи (к кому)
  relationType: RelationType
  createdAt: string
}

export interface FamilyMember {
  id: string
  name: string
  relationship?: string      // Устарело, оставлено для совместимости
  gender?: Gender
  generation?: number        // Поколение (0 = текущий, -1 = родители, +1 = дети)
  displayRole?: string       // Отображаемая роль (для UI)
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
  relations: FamilyRelation[]   // Связи между членами
  rootMemberId?: string         // ID корневого члена (обычно "self")
  createdAt: string
  updatedAt: string
}

// Фабрика для создания пустого члена семьи
export function createEmptyMember(): FamilyMember {
  return {
    id: crypto.randomUUID(),
    name: '',
    relationship: '',
    gender: 'unknown',
    generation: 0,
    displayRole: '',
    birthDate: '',
    biography: '',
    lifePath: [],
    photoUrl: '',
    photos: [],
    videos: [],
    quotes: []
  }
}

// Фабрика для создания пустой связи
export function createEmptyRelation(
  fromMemberId: string,
  toMemberId: string,
  relationType: RelationType
): FamilyRelation {
  return {
    id: crypto.randomUUID(),
    fromMemberId,
    toMemberId,
    relationType,
    createdAt: new Date().toISOString()
  }
}

// Хелпер для получения названия роли на русском
export function getRelationLabel(type: RelationType, gender?: Gender): string {
  switch (type) {
    case 'parent':
      return gender === 'female' ? 'Мать' : 'Отец'
    case 'spouse':
      return gender === 'female' ? 'Супруга' : 'Супруг'
    case 'sibling':
      return gender === 'female' ? 'Сестра' : 'Брат'
    default:
      return 'Родственник'
  }
}

// Хелпер для инвертирования типа связи
export function invertRelationType(type: RelationType): RelationType {
  switch (type) {
    case 'parent':
      return 'child' as RelationType  // будет обработано как parent в обратную сторону
    case 'spouse':
      return 'spouse'
    case 'sibling':
      return 'sibling'
    default:
      return type
  }
}
