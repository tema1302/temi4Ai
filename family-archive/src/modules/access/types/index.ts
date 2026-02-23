import { ArchiveRole } from '../constants/roles'

export interface AccessMember {
  userId: string
  email: string
  role: ArchiveRole
  joinedAt: string
}

export interface AccessRequest {
  id: string
  userId: string
  email: string
  requestedRole: ArchiveRole
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}
