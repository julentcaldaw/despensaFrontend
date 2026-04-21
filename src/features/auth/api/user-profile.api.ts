import { apiClient } from '../../../shared/lib/http/api-client';
import type { ApiSuccessResponse } from '../../../shared/types/api.types';
import type { AuthUser } from '../model/types/auth.model';

export interface UpdateUserProfilePayload {
  username?: string;
  email?: string;
  password?: string;
  currentPassword: string;
}

export interface UpdateUserProfileResponse {
  user: AuthUser;
}

export async function updateUserProfile(payload: UpdateUserProfilePayload): Promise<AuthUser> {
  const response = await apiClient.patch<
    UpdateUserProfilePayload,
    ApiSuccessResponse<UpdateUserProfileResponse>
  >('/users/profile', payload);
  return response.data.user;
}
