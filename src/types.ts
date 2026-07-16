export type Localized = { ko: string; en?: string }
export type TagKind = 'attraction' | 'festival' | 'food' | 'stay' | 'transit' | 'shopping' | 'photo' | 'question' | 'review' | 'custom'
export type FestivalStatus = 'ongoing' | 'upcoming' | 'ended'
export type LoadState = 'idle' | 'loading' | 'ready' | 'error'

export interface Tag { id?: number; kind: TagKind; label: Localized }
export interface Media { id: number; url: string }
export interface Attraction { id: string; name: Localized; area: Localized; description: Localized; summary: Localized; tags: Tag[]; boardId?: string; image: string; address: Localized; hours: Localized }
export interface Festival { id: string; name: Localized; place: Localized; period: Localized; status: FestivalStatus; summary: Localized; boardId?: string; image: string; startDate?: string; endDate?: string }
export interface Board { id: string; name: Localized; category: Localized; description: Localized; image: string; count: number; lastActive: Localized; recent: Localized[] }
export interface Post { id: string; boardId: string; title: string; titleEn?: string; body: string; bodyEn?: string; tags: Tag[]; views: number; likes: number; comments: number; date: string; updatedAt?: string; author: string; liked?: boolean; images: number; media: Media[] }
export interface Comment { id: string; postId: string; parentId?: string; author: string; body: string; bodyEn?: string; date: string; updatedAt?: string; likes: number; deleted?: boolean }
export interface PageResult<T> { items: T[]; total: number; page: number; size: number }
export interface SearchResult { attractions: Attraction[]; festivals: Festival[]; posts: Post[]; totals: { attractions: number; festivals: number; posts: number } }
