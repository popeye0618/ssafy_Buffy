import { describe, expect, it } from 'vitest'
import { createRealtimeUrl, parseRealtimeEvent } from './realtime'

describe('realtime API', () => {
  it('builds the secure websocket URL with the client id', () => {
    expect(createRealtimeUrl('client-id', 'https://ssafy-first-team.onrender.com')).toBe(
      'wss://ssafy-first-team.onrender.com/api/v1/ws?clientId=client-id',
    )
  })

  it('parses supported events and ignores malformed messages', () => {
    expect(parseRealtimeEvent('{"event":"presence.updated","data":{"connectedCount":14}}')).toEqual({
      event: 'presence.updated', data: { connectedCount: 14 },
    })
    expect(parseRealtimeEvent('{"event":"post.created","data":{"postId":101,"boardId":1,"title":"새 게시글","createdAt":"2026-07-16T15:30:00+09:00"}}')).toEqual({
      event: 'post.created',
      data: { postId: 101, boardId: 1, title: '새 게시글', createdAt: '2026-07-16T15:30:00+09:00' },
    })
    expect(parseRealtimeEvent('not-json')).toBeUndefined()
  })
})
