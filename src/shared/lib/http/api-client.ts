import { env } from '../../config/env'
import type { ApiErrorResponse } from '../../types/api.types'

export class ApiClientError extends Error {
  public readonly code: string
  public readonly details?: Record<string, unknown>

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message)
    this.code = code
    this.details = details
  }
}

interface ApiClientRequestOptions {
  skipAuth?: boolean
  skipRefresh?: boolean
}

interface ApiClientAuthHandlers {
  getAccessToken: () => string | undefined
  refreshSession: () => Promise<string | undefined>
  onUnauthorized?: () => void
}

let authHandlers: ApiClientAuthHandlers | null = null
let refreshInFlight: Promise<string | undefined> | null = null

function parseErrorPayload(
  payload: ApiErrorResponse | null,
): { code: string; message: string; details?: Record<string, unknown> } {
  return {
    code: payload?.error.code ?? 'UNKNOWN_ERROR',
    message: payload?.error.message ?? 'Error inesperado en la API',
    details: payload?.error.details,
  }
}

function buildHeaders(
  init?: RequestInit,
  options?: ApiClientRequestOptions,
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  }

  if (!options?.skipAuth && authHandlers) {
    const accessToken = authHandlers.getAccessToken()
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }
  }

  return headers
}

async function executeRefreshIfNeeded(): Promise<string | undefined> {
  if (!authHandlers) {
    return undefined
  }

  if (!refreshInFlight) {
    refreshInFlight = authHandlers
      .refreshSession()
      .catch(() => {
        authHandlers?.onUnauthorized?.()
        return undefined
      })
      .finally(() => {
        refreshInFlight = null
      })
  }

  return refreshInFlight
}

async function request<TResponse>(
  path: string,
  init?: RequestInit,
  options?: ApiClientRequestOptions,
): Promise<TResponse> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: buildHeaders(init, options),
  })

  if (
    response.status === 401 &&
    !options?.skipAuth &&
    !options?.skipRefresh &&
    authHandlers
  ) {
    const refreshedAccessToken = await executeRefreshIfNeeded()

    if (refreshedAccessToken) {
      return request<TResponse>(path, init, {
        ...options,
        skipRefresh: true,
      })
    }
  }

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as
      | ApiErrorResponse
      | null

    const parsedError = parseErrorPayload(errorPayload)

    throw new ApiClientError(
      parsedError.code,
      parsedError.message,
      parsedError.details,
    )
  }

  return (await response.json()) as TResponse
}

export const apiClient = {
  setAuthHandlers(handlers: ApiClientAuthHandlers | null) {
    authHandlers = handlers
  },

  post<TRequest, TResponse>(
    path: string,
    body: TRequest,
    options?: ApiClientRequestOptions,
  ): Promise<TResponse> {
    return request<TResponse>(
      path,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      options,
    )
  },

  get<TResponse>(
    path: string,
    options?: ApiClientRequestOptions,
  ): Promise<TResponse> {
    return request<TResponse>(path, {
      method: 'GET',
    }, options)
  },

  delete<TResponse>(
    path: string,
    options?: ApiClientRequestOptions,
  ): Promise<TResponse> {
    return request<TResponse>(path, {
      method: 'DELETE',
    }, options)
  },

  patch<TRequest, TResponse>(
    path: string,
    body: TRequest,
    options?: ApiClientRequestOptions,
  ): Promise<TResponse> {
    return request<TResponse>(
      path,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
      options,
    )
  },
}
