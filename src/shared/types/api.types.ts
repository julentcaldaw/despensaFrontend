export interface ApiSuccessResponse<T> {
  ok?: boolean
  data: T
  meta?: Record<string, unknown>
}

export interface ApiErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}
