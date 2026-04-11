import { apiClient } from '../../../shared/lib/http/api-client'
import type { ApiSuccessResponse } from '../../../shared/types/api.types'
import { mapAuthSessionDtoToModel } from '../model/mappers/auth.mapper'
import type {
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from '../model/dto/auth.dto'
import type {
  AuthSession,
  LoginFormModel,
  RegisterFormModel,
} from '../model/types/auth.model'

export async function login(payload: LoginFormModel): Promise<AuthSession> {
  const request: LoginRequestDto = {
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  }

  const response = await apiClient.post<
    LoginRequestDto,
    ApiSuccessResponse<LoginResponseDto>
  >('/auth/login', request)

  return mapAuthSessionDtoToModel(response.data)
}

export async function register(
  payload: RegisterFormModel,
): Promise<AuthSession> {
  const request: RegisterRequestDto = {
    displayName: payload.displayName.trim(),
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  }

  const response = await apiClient.post<
    RegisterRequestDto,
    ApiSuccessResponse<RegisterResponseDto>
  >('/auth/register', request)

  return mapAuthSessionDtoToModel(response.data)
}
