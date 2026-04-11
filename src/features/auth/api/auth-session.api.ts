import { apiClient } from '../../../shared/lib/http/api-client'
import type { ApiSuccessResponse } from '../../../shared/types/api.types'
import { mapAuthSessionDtoToModel } from '../model/mappers/auth.mapper'
import type { AuthSessionDto } from '../model/dto/auth.dto'
import type { AuthSession } from '../model/types/auth.model'

interface RefreshTokenRequestDto {
  refreshToken: string
}

interface LogoutRequestDto {
  refreshToken?: string
}

export async function refreshAuthSession(
  refreshToken: string,
): Promise<AuthSession> {
  const response = await apiClient.post<
    RefreshTokenRequestDto,
    ApiSuccessResponse<AuthSessionDto>
  >(
    '/auth/refresh',
    { refreshToken },
    {
      skipAuth: true,
      skipRefresh: true,
    },
  )

  return mapAuthSessionDtoToModel(response.data)
}

export async function logoutAuthSession(refreshToken?: string): Promise<void> {
  await apiClient.post<LogoutRequestDto, ApiSuccessResponse<null>>(
    '/auth/logout',
    { refreshToken },
    {
      skipRefresh: true,
    },
  )
}
