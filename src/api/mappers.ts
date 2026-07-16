import type { ApiAttraction, ApiBoard, ApiComment, ApiFestival, ApiPost, ApiTag } from './contracts'
import type { Attraction, Board, Comment, Festival, Post, Tag, TagKind } from '../types'

const kindMap: Record<string, TagKind> = { ATTRACTION:'attraction', FESTIVAL:'festival', FOOD:'food', STAY:'stay', TRANSPORT:'transit', SHOPPING:'shopping', PHOTO:'photo', QUESTION:'question', REVIEW:'review', CUSTOM:'custom' }
export const DEFAULT_TOURISM_IMAGE = '/images/busan-placeholder.png'
export const anonymousId = (value: string) => value.slice(0, 8)
export const inlineStructuredInfo = (value: string) => value.replace(/\s*\|\s*/g, ' · ').replace(/\s*※\s*/g, ' ※ ').trim()
export const mapTag = (tag: ApiTag): Tag => ({ id:tag.tagId, kind:kindMap[tag.category] || 'custom', label:{ ko:tag.name, en:tag.nameEn || undefined } })
export const mapBoard = (board: ApiBoard): Board => ({ id:String(board.boardId), name:{ko:board.name,en:board.nameEn||undefined}, category:{ko:board.category,en:board.categoryEn||undefined}, description:{ko:inlineStructuredInfo(board.description||''),en:board.descriptionEn?inlineStructuredInfo(board.descriptionEn):undefined}, image:board.image||DEFAULT_TOURISM_IMAGE, count:board.recentPostCount||0, lastActive:{ko:board.lastActivityAt||'',en:board.lastActivityAt||''}, recent:board.recentExcerpt?[{ko:board.recentExcerpt,en:board.recentExcerpt}]:[] })
export const mapAttraction = (item: ApiAttraction): Attraction => ({ id:item.contentId, name:{ko:item.name,en:item.nameEn||undefined}, area:{ko:item.category,en:item.categoryEn||item.category}, summary:{ko:item.summary,en:item.summaryEn||undefined}, description:{ko:item.description,en:item.descriptionEn||undefined}, image:item.image||DEFAULT_TOURISM_IMAGE, address:{ko:item.address,en:item.addressEn||undefined}, hours:{ko:'정보 없음',en:'Not available'}, boardId:item.boardId == null ? undefined : String(item.boardId), tags:[{kind:'attraction',label:{ko:item.category,en:item.categoryEn||item.category}}] })
export const mapFestival = (item: ApiFestival): Festival => ({ id:item.contentId, name:{ko:item.name,en:item.nameEn||undefined}, place:{ko:item.place,en:item.placeEn||undefined}, period:{ko:item.period,en:item.periodEn||undefined}, status:item.status.toLowerCase() as Festival['status'], summary:{ko:item.summary,en:item.summaryEn||undefined}, image:item.image||DEFAULT_TOURISM_IMAGE, startDate:item.startDate||undefined, endDate:item.endDate||undefined, boardId:item.boardId == null ? undefined : String(item.boardId) })
export const mapPost = (item: ApiPost): Post => ({ id:String(item.postId), boardId:String(item.boardId), title:item.titleKr||item.title, titleEn:item.titleEn||undefined, body:item.contentKr||item.content, bodyEn:item.contentEn||undefined, author:anonymousId(item.author), views:item.viewCount, likes:item.likeCount, comments:item.commentCount, date:item.createdAt||'', updatedAt:item.updatedAt||undefined, tags:(item.tags||[]).map(mapTag), media:(item.media||[]).map(x=>({id:x.mediaId,url:x.imageUrl})), images:item.media?.length||0 })
export function flattenComments(items: ApiComment[], parentId?: string): Comment[] {
  return items.flatMap(item => {
    const current: Comment = { id:String(item.commentId), postId:String(item.postId), parentId:item.parentId == null ? parentId : String(item.parentId), author:anonymousId(item.author), body:item.content, date:item.createdAt||'', updatedAt:item.updatedAt||undefined, likes:0, deleted:!item.content }
    return [current, ...flattenComments(item.children||[], current.id)]
  })
}
