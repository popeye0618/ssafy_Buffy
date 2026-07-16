import { API_BASE } from './client'

export type PresenceUpdatedEvent = {
  event: 'presence.updated'
  data: { connectedCount: number }
}

export type PostCreatedEvent = {
  event: 'post.created'
  data: { postId: number; boardId: number; title: string; createdAt: string }
}

export type RealtimeEvent = PresenceUpdatedEvent | PostCreatedEvent

export function createRealtimeUrl(clientId: string, apiBase = API_BASE) {
  const url = new URL('/api/v1/ws', `${apiBase}/`)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.searchParams.set('clientId', clientId)
  return url.toString()
}

export function parseRealtimeEvent(raw: string): RealtimeEvent | undefined {
  try {
    const value = JSON.parse(raw) as { event?: unknown; data?: Record<string, unknown> }
    if (value.event === 'presence.updated' && typeof value.data?.connectedCount === 'number' && Number.isFinite(value.data.connectedCount)) {
      return { event: value.event, data: { connectedCount: Number(value.data!.connectedCount) } }
    }
    if (
      value.event === 'post.created' &&
      typeof value.data?.postId === 'number' && Number.isSafeInteger(value.data.postId) &&
      typeof value.data?.boardId === 'number' && Number.isSafeInteger(value.data.boardId) &&
      typeof value.data?.title === 'string' &&
      typeof value.data?.createdAt === 'string'
    ) {
      return {
        event: value.event,
        data: {
          postId: Number(value.data!.postId),
          boardId: Number(value.data!.boardId),
          title: value.data!.title as string,
          createdAt: value.data!.createdAt as string,
        },
      }
    }
  } catch {
    // Ignore malformed or unsupported server messages.
  }
  return undefined
}
