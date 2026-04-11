export type UserRole = 'user' | 'contributor' | 'admin'

export interface AuthUser {
  id: string
  email: string
  displayName: string
  role: UserRole
  avatar?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface AuthSession {
  accessToken: string
  refreshToken?: string
  user: AuthUser
}

export interface LoginFormModel {
  email: string
  password: string
}

export interface RegisterFormModel {
  displayName: string
  email: string
  password: string
  confirmPassword: string
}
