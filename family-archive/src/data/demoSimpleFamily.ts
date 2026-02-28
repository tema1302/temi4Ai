import type { FamilyArchive } from '@/modules/family/domain/models'

// Demo data: Simple family with parents and children
// Minimal layout for easier understanding
// Generation: 0 = grandparents, 1 = parents, 2 = children

export const SIMPLE_FAMILY_DEMO: FamilyArchive = {
  id: 'simple-family-demo',
  name: 'Семья Ивановых',
  heroImage: '',
  members: [
    // Grandfather (father's father) - Generation 0
    {
      id: 'grandfather',
      name: 'Пётр Николаевич',
      displayRole: 'Дедушка',
      gender: 'male',
      generation: 0,
      birthDate: '1945',
      deathDate: '2020',
      biography: 'Дедушка по отцовской линии, ветеран труда.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    // Grandmother (father's mother) - Generation 0
    {
      id: 'grandmother',
      name: 'Анна Сергеевна',
      displayRole: 'Бабушка',
      gender: 'female',
      generation: 0,
      birthDate: '1948',
      deathDate: undefined,
      biography: 'Бабушка по отцовской линии, на пенсии.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    // Father - Generation 1
    {
      id: 'father',
      name: 'Иван Петрович',
      displayRole: 'Отец',
      gender: 'male',
      generation: 1,
      birthDate: '1970',
      deathDate: undefined,
      biography: 'Отец семейства, работает инженером.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    // Mother - Generation 1
    {
      id: 'mother',
      name: 'Мария Ивановна',
      displayRole: 'Мать',
      gender: 'female',
      generation: 1,
      birthDate: '1972',
      deathDate: undefined,
      biography: 'Мать семейства, учительница.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    // Son - Generation 2
    {
      id: 'son',
      name: 'Алексей Иванович',
      displayRole: 'Сын',
      gender: 'male',
      generation: 2,
      birthDate: '1995',
      deathDate: undefined,
      biography: 'Старший сын, работает программистом.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    // Daughter - Generation 2
    {
      id: 'daughter',
      name: 'Елена Ивановна',
      displayRole: 'Дочь',
      gender: 'female',
      generation: 2,
      birthDate: '1998',
      deathDate: undefined,
      biography: 'Дочь, студентка медицинского института.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
  ],
  relations: [
    // Grandfather + Grandmother (spouses)
    { id: 'sf6', fromMemberId: 'grandfather', toMemberId: 'grandmother', relationType: 'spouse', createdAt: '' },
    // Grandfather -> Father
    { id: 'sf5', fromMemberId: 'grandfather', toMemberId: 'father', relationType: 'parent', createdAt: '' },
    // Parents (spouses)
    { id: 'sf1', fromMemberId: 'father', toMemberId: 'mother', relationType: 'spouse', createdAt: '' },
    // Father -> Son
    { id: 'sf2', fromMemberId: 'father', toMemberId: 'son', relationType: 'parent', createdAt: '' },
    // Father -> Daughter
    { id: 'sf3', fromMemberId: 'father', toMemberId: 'daughter', relationType: 'parent', createdAt: '' },
    // Siblings
    { id: 'sf4', fromMemberId: 'son', toMemberId: 'daughter', relationType: 'sibling', createdAt: '' },
  ],
  rootMemberId: 'father',
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01'
}

// Statistics for simple family display
export const SIMPLE_FAMILY_STATS = {
  generations: 3,
  years: '1945-2025',
  totalYears: 80,
  members: 6,
  keyEvents: [
    { year: '1945', event: 'Родился дедушка' },
    { year: '1970', event: 'Родился отец' },
    { year: '1995', event: 'Родился сын' },
    { year: '1998', event: 'Родилась дочь' },
  ]
}
