export type UserRoleDto =
  | 'user'
  | 'contributor'
  | 'admin'
  | 'USER'
  | 'CONTRIBUTOR'
  | 'ADMIN'

export interface AuthUserDto {
  id: string | number
  email: string
  username?: string
  displayName?: string
  role: UserRoleDto
  avatar?: string
  createdAt?: string
  updatedAt?: string
}

export interface AuthSessionDto {
  accessToken: string
  refreshToken?: string
  user: AuthUserDto
}

export interface LoginRequestDto {
  email: string
  password: string
}

export interface RegisterRequestDto {
  email: string
  password: string
  username: string
}

export type LoginResponseDto = AuthSessionDto
export type RegisterResponseDto = AuthSessionDto
