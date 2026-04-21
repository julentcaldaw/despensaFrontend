export type UserRole = 'user' | 'contributor' | 'admin'

export interface AuthUser {
  id: string
  email: string
  username: string
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
  username: string
  email: string
  password: string
  confirmPassword: string
}
