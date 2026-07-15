export interface ApiPage<T> { items: T[]; total: number; page: number; size: number }
export interface ApiTag { tagId: number; name: string; nameEn?: string | null; category: string }
export interface ApiMedia { mediaId: number; imageUrl: string }
export interface ApiBoard { boardId: number; name: string; nameEn?: string | null; category: string; categoryEn?: string | null; description: string | null; descriptionEn?: string | null; image?: string; recentPostCount?: number; lastActivityAt?: string | null; recentExcerpt?: string }
export interface ApiAttraction { contentId: string; name: string; nameEn?: string | null; category: string; categoryEn?: string | null; summary: string; summaryEn?: string | null; description: string; descriptionEn?: string | null; image: string; address: string; addressEn?: string | null; boardId?: number | null }
export interface ApiFestival { contentId: string; name: string; nameEn?: string | null; status: 'ONGOING'|'UPCOMING'|'ENDED'; place: string; placeEn?: string | null; period: string; periodEn?: string | null; startDate?: string | null; endDate?: string | null; image: string; summary: string; summaryEn?: string | null; boardId?: number | null }
export interface ApiPost { postId: number; boardId: number; title: string; author: string; content: string; viewCount: number; likeCount: number; commentCount: number; createdAt: string | null; updatedAt: string | null; tags: ApiTag[]; media: ApiMedia[] }
export interface ApiComment { commentId: number; postId: number; parentId: number | null; author: string; content: string; createdAt: string | null; updatedAt: string | null; children?: ApiComment[] }
export interface ApiLike { liked: boolean; likeCount: number }
export interface ApiReference { type: string; id?: string | null; title?: string | null; address?: string | null; imageUrl?: string | null; url?: string | null }
export interface ApiChatResponse { answer: string; language: 'ko'|'en'; references?: ApiReference[] }
export interface ApiTagCreate { name: string }
export interface ApiSearchItem { resultType: 'BOARD'|'POST'; resultId: number; boardId: number; title: string; description: string | null; image: string; category: string | null }
export interface ApiSearchResponse { items: ApiSearchItem[]; total: number; page: number; size: number }
export interface PostWritePayload { title: string; content: string; password: string; tags?: { tagId: number; name: string; category: string }[]; media?: { mediaId: number; imageUrl: string }[] }
