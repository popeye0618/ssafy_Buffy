const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://ssafy-first-team.onrender.com').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) { super(message) }
}

export function getClientId() {
  const key = 'blh-client-id'
  let value = localStorage.getItem(key)
  if (!value) { value = crypto.randomUUID(); localStorage.setItem(key, value) }
  return value
}

export async function apiRequest<T>(path: string, options: RequestInit & { clientId?: boolean; sessionId?: string } = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (options.clientId) headers.set('X-Client-Id', getClientId())
  if (options.sessionId) headers.set('X-Session-Id', options.sessionId)
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 30000)
  try {
    const response = await fetch(`${API_BASE}${path}`, { ...options, headers, signal: controller.signal })
    if (!response.ok) {
      let body: any
      try { body = await response.json() } catch { body = undefined }
      throw new ApiError(response.status, body?.message || (response.status === 422 ? '입력값을 확인해 주세요.' : '요청을 처리하지 못했습니다.'), body)
    }
    if (response.status === 204) return undefined as T
    return await response.json() as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if ((error as Error).name === 'AbortError') throw new ApiError(408, '서버 응답이 지연되고 있습니다. 다시 시도해 주세요.')
    throw new ApiError(0, '서버에 연결할 수 없습니다.')
  } finally { window.clearTimeout(timer) }
}

export const queryString = (values: Record<string, string | number | undefined | null>) => {
  const query = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') query.set(key, String(value)) })
  const text = query.toString()
  return text ? `?${text}` : ''
}
