import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAppStore } from './app'

const response = (body: unknown, status = 200) => Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) })

describe('API-backed app store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    localStorage.setItem('blh-client-id', '00000000-0000-4000-8000-000000000000')
    vi.restoreAllMocks()
  })

  it('fetches the documented paged board response from the server', async () => {
    const items = Array.from({ length: 5 }, (_, i) => ({ boardId: i + 6, name: `장소 ${i + 6}`, nameEn: `Place ${i + 6}`, category: '관광지', categoryEn: 'Attraction', description: '부산 장소', descriptionEn: 'A place in Busan', recentPostCount: 0 }))
    const fetchMock = vi.fn(() => response({ items, total: 1755, page: 2, size: 5 }))
    vi.stubGlobal('fetch', fetchMock)
    const store = useAppStore()
    await store.loadBoards({ page: 2, size: 5 })
    const calls = fetchMock.mock.calls as unknown as [RequestInfo | URL, RequestInit?][]
    const url = new URL(String(calls[0][0]))
    expect(url.pathname).toBe('/api/v1/boards')
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('size')).toBe('5')
    expect(store.boardPage.total).toBe(1755)
    expect(store.boardPage.items).toHaveLength(5)
    expect(store.boardPage.items.every(x => Number.isSafeInteger(Number(x.id)))).toBe(true)
  })

  it('creates a custom tag with only the documented name field', async () => {
    const fetchMock = vi.fn(() => response({ tagId: 10, name: '일정', category: 'CUSTOM' }, 201))
    vi.stubGlobal('fetch', fetchMock)
    const item = await useAppStore().createTag('일정')
    const calls = fetchMock.mock.calls as unknown as [RequestInfo | URL, RequestInit?][]
    expect(JSON.parse(String(calls[0][1]!.body))).toEqual({ name: '일정' })
    expect(item.id).toBe(10)
  })

  it('reuses an existing tag after a 409 conflict', async () => {
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => response({ message: '이미 존재하는 태그입니다.' }, 409))
      .mockImplementationOnce(() => response({ items: [{ tagId: 10, name: '일정', category: 'CUSTOM' }], total: 1, page: 1, size: 100 }))
    vi.stubGlobal('fetch', fetchMock)
    const item = await useAppStore().createTag('일정')
    expect(item.id).toBe(10)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('maps paged post responses', async () => {
    vi.stubGlobal('fetch', vi.fn(() => response({ items: [{ postId: 3, boardId: 1, title: '테스트', titleKr: '테스트', titleEn: 'Test', author: 'anon', content: '내용', contentKr: '내용', contentEn: 'Content', viewCount: 2, likeCount: 1, commentCount: 0, createdAt: '2026-07-15T00:00:00Z', updatedAt: null, tags: [], media: [] }], total: 1, page: 1, size: 10 })))
    const store = useAppStore()
    await store.loadPosts('1')
    expect(store.postPage.items[0].id).toBe('3')
    expect(store.postPage.items[0].body).toBe('내용')
    store.lang = 'en'
    expect(store.postTitle(store.postPage.items[0])).toBe('Test')
    expect(store.postBody(store.postPage.items[0])).toBe('Content')
  })

  it('maps paged attraction and festival responses', async () => {
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => response({ items: [{ contentId: 'a1', boardId: 4, name: '관광지', nameEn: 'Attraction', category: 'SCENIC', categoryEn: 'Scenic Spot', summary: '요약', summaryEn: 'Summary', description: '설명', descriptionEn: 'Description', image: '', address: '부산', addressEn: 'Busan' }], total: 300, page: 2, size: 12 }))
      .mockImplementationOnce(() => response({ items: [{ contentId: 'f1', boardId: 5, name: '축제', nameEn: 'Festival', status: 'UPCOMING', place: '부산', placeEn: 'Busan', period: '2026.08', periodEn: 'Aug 2026', image: '', summary: '요약', summaryEn: 'Summary' }], total: 40, page: 2, size: 12 }))
    vi.stubGlobal('fetch', fetchMock)
    const store = useAppStore()
    await store.loadAttractions(2, 12)
    await store.loadFestivals(2, 12)
    expect(store.attractionPage.total).toBe(300)
    expect(store.attractions[0].boardId).toBe('4')
    expect(store.festivalPage.total).toBe(40)
    expect(store.festivals[0].status).toBe('upcoming')
  })

  it('loads popular posts from the deployed endpoint', async () => {
    const fetchMock = vi.fn(() => response({ items: [{ postId: 3, boardId: 1, title: '인기 글', author: 'anon', content: '내용', viewCount: 20, likeCount: 8, commentCount: 2, createdAt: '2026-07-15T00:00:00Z', updatedAt: null, tags: [], media: [] }], total: 1, page: 1, size: 5 }))
    vi.stubGlobal('fetch', fetchMock)
    const store = useAppStore()
    await store.loadPopularPosts(1, 5)
    const calls = fetchMock.mock.calls as unknown as [RequestInfo | URL, RequestInit?][]
    const url = new URL(String(calls[0][0]))
    expect(url.pathname).toBe('/api/v1/posts/popular')
    expect(store.popularPosts[0].title).toBe('인기 글')
  })

  it('uses the documented q, page, and size search parameters', async () => {
    const fetchMock = vi.fn(() => response({ items: [{ resultType: 'BOARD', resultId: 1, boardId: 1, title: '해운대', description: '주소: 부산 | 우편번호: 48000', image: '', category: '관광지' }], total: 1, page: 2, size: 5 }))
    vi.stubGlobal('fetch', fetchMock)
    const result = await useAppStore().searchAll('해운대', 2, 5)
    const calls = fetchMock.mock.calls as unknown as [RequestInfo | URL, RequestInit?][]
    const url = new URL(String(calls[0][0]))
    expect(url.pathname).toBe('/api/v1/search')
    expect(url.searchParams.get('q')).toBe('해운대')
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.get('size')).toBe('5')
    expect(result.items[0].resultType).toBe('BOARD')
    expect(result.items[0].description).toBe('주소: 부산 · 우편번호: 48000')
  })

  it('reads comments from the deployed paged response', async () => {
    const fetchMock = vi.fn(() => response({ items: [{ commentId: 1, postId: 3, parentId: null, author: '12345678-abcd-efgh', content: '댓글', contentKr: '댓글', contentEn: 'Comment', createdAt: null, updatedAt: null, children: [] }], total: 1, page: 1, size: 100 }))
    vi.stubGlobal('fetch', fetchMock)
    const store = useAppStore()
    await store.loadComments('3')
    const calls = fetchMock.mock.calls as unknown as [RequestInfo | URL, RequestInit?][]
    const url = new URL(String(calls[0][0]))
    expect(url.searchParams.get('size')).toBe('100')
    expect(store.comments[0].author).toBe('12345678')
    expect(store.commentBody(store.comments[0])).toBe('댓글')
    store.lang = 'en'
    expect(store.commentBody(store.comments[0])).toBe('Comment')
  })

  it('sends both required chatbot identity headers and at most ten history items', async () => {
    const fetchMock = vi.fn(() => response({ answer: '추천 답변', language: 'ko', references: [] }))
    vi.stubGlobal('fetch', fetchMock)
    const store = useAppStore()
    const sessionId = '11111111-1111-4111-8111-111111111111'
    const history = Array.from({ length: 12 }, (_, index) => ({ role: index % 2 ? 'assistant' as const : 'user' as const, content: `대화 ${index}` }))
    await store.chat('해운대 추천', history, sessionId)
    const calls = fetchMock.mock.calls as unknown as [RequestInfo | URL, RequestInit?][]
    const headers = new Headers(calls[0][1]!.headers)
    const body = JSON.parse(String(calls[0][1]!.body))
    expect(headers.get('X-Client-Id')).toBe('00000000-0000-4000-8000-000000000000')
    expect(headers.get('X-Session-Id')).toBe(sessionId)
    expect(body.history).toHaveLength(10)
    expect(body.language).toBe('ko')
  })

  it('does not keep submitted passwords in store state', async () => {
    vi.stubGlobal('fetch', vi.fn(() => response({ postId: 9, boardId: 1, title: '새 글', author: 'anon', content: '본문', viewCount: 0, likeCount: 0, commentCount: 0, createdAt: null, updatedAt: null, tags: [], media: [] }, 201)))
    const store = useAppStore()
    await store.createPost({ boardId: '1', title: '새 글', body: '본문', tags: [], media: [], password: '5678' })
    expect(JSON.stringify(store.$state)).not.toContain('5678')
  })

  it('sends the documented TRANSPORT category for transit tags', async () => {
    const fetchMock = vi.fn(() => response({ postId: 10, boardId: 1, title: '교통 정보', author: 'anon', content: '본문', viewCount: 0, likeCount: 0, commentCount: 0, createdAt: null, updatedAt: null, tags: [], media: [] }, 201))
    vi.stubGlobal('fetch', fetchMock)
    await useAppStore().createPost({
      boardId: '1',
      title: '교통 정보',
      body: '본문',
      tags: [{ id: 5, kind: 'transit', label: { ko: '교통', en: 'Transportation' } }],
      media: [],
      password: '5678',
    })
    const calls = fetchMock.mock.calls as unknown as [RequestInfo | URL, RequestInit?][]
    const body = JSON.parse(String(calls[0][1]!.body))
    expect(body.tags).toEqual([{ tagId: 5, name: '교통', category: 'TRANSPORT' }])
  })
})
