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

export interface FamilyData {
  id: string
  familyName: string
  members: FamilyMember[]
  heroImage: string
  createdAt: string
  updatedAt: string
}

export interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  imageUrl?: string
}
