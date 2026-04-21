import type { AuthSessionDto, AuthUserDto } from '../dto/auth.dto'
import type { AuthSession, AuthUser } from '../types/auth.model'

function mapRoleDtoToModel(role: AuthUserDto['role']): AuthUser['role'] {
  switch (role) {
    case 'ADMIN':
    case 'admin':
      return 'admin'
    case 'CONTRIBUTOR':
    case 'contributor':
      return 'contributor'
    case 'USER':
    case 'user':
    default:
      return 'user'
  }
}

function toOptionalDate(value?: string): Date | undefined {
  if (!value) {
    return undefined
  }

  const parsedDate = new Date(value)
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate
}

function mapAuthUserDtoToModel(dto: AuthUserDto): AuthUser {
  return {
    id: String(dto.id),
    email: dto.email,
    username: dto.username ?? dto.displayName ?? dto.email,
    role: mapRoleDtoToModel(dto.role),
    avatar: dto.avatar,
    createdAt: toOptionalDate(dto.createdAt),
    updatedAt: toOptionalDate(dto.updatedAt),
  }
}

export function mapAuthSessionDtoToModel(dto: AuthSessionDto): AuthSession {
  return {
    accessToken: dto.accessToken,
    refreshToken: dto.refreshToken,
    user: mapAuthUserDtoToModel(dto.user),
  }
}
