import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { ApiError, apiRequest, getClientId, queryString } from '../api/client'
import { createRealtimeUrl, parseRealtimeEvent } from '../api/realtime'
import type { PostCreatedEvent } from '../api/realtime'
import { flattenComments, inlineStructuredInfo, mapAttraction, mapBoard, mapFestival, mapPost, mapTag } from '../api/mappers'
import type { ApiAttraction, ApiBoard, ApiChatResponse, ApiComment, ApiFestival, ApiLike, ApiMedia, ApiPage, ApiPost, ApiSearchResponse, ApiTag, ApiTagCreate, PostWritePayload } from '../api/contracts'
import type { Board, Comment, Festival, LoadState, Media, PageResult, Post, Tag } from '../types'

export const useAppStore = defineStore('app', () => {
  const lang = ref<'ko'|'en'>((localStorage.getItem('blh-lang') as 'ko'|'en') || 'ko')
  const theme = ref<'light'|'dark'>((localStorage.getItem('blh-theme') as 'light'|'dark') || 'light')
  const fontScale = ref(Number(localStorage.getItem('blh-font') || 1))
  const boards = ref<Board[]>([])
  const boardPage = ref<PageResult<Board>>({items:[],total:0,page:1,size:20})
  const attractions = ref<ReturnType<typeof mapAttraction>[]>([])
  const festivals = ref<Festival[]>([])
  const attractionPage = ref<PageResult<ReturnType<typeof mapAttraction>>>({items:[],total:0,page:1,size:20})
  const festivalPage = ref<PageResult<Festival>>({items:[],total:0,page:1,size:20})
  const posts = ref<Post[]>([])
  const popularPosts = ref<Post[]>([])
  const postPage = ref<PageResult<Post>>({items:[],total:0,page:1,size:10})
  const comments = ref<Comment[]>([])
  const tags = ref<Tag[]>([])
  const state = ref<Record<string,LoadState>>({})
  const errors = ref<Record<string,string>>({})
  const serviceHealthy = ref<boolean | null>(null)
  const realtimeConnected = ref(false)
  const connectedCount = ref(0)
  const latestPostEvent = ref<PostCreatedEvent['data'] | null>(null)
  let realtimeSocket: WebSocket | null = null
  let reconnectTimer: number | undefined
  let reconnectAttempt = 0
  let realtimeStopped = true

  const t = (ko: string, en: string) => lang.value === 'en' ? en : ko
  const tr = (value: {ko:string;en?:string}) => lang.value === 'en' ? (value.en || value.ko) : value.ko
  const postTitle = (post:Post) => tr({ko:post.title,en:post.titleEn})
  const postBody = (post:Post) => tr({ko:post.body,en:post.bodyEn})
  const boardById = (id: string) => boards.value.find((b) => b.id === id)
  const postById = (id: string) => posts.value.find((p) => p.id === id)
  const commentsFor = (postId: string) => comments.value.filter((c) => c.postId === postId)
  const setLoading = (key:string) => { state.value[key]='loading'; errors.value[key]='' }
  const setError = (key:string,error:unknown) => { state.value[key]='error'; errors.value[key]=(error as Error).message || '정보를 불러오지 못했습니다.' }

  async function loadBoards(params: {page?:number;size?:number}={}) {
    const key='boards';setLoading(key)
    try {
      const page=params.page||1,size=params.size||20
      const raw=await apiRequest<ApiPage<ApiBoard>>(`/api/v1/boards${queryString({page,size})}`)
      const mapped=raw.items.map(mapBoard);boardPage.value={items:mapped,total:raw.total,page:raw.page,size:raw.size};boards.value=mapped
      state.value[key]='ready';return boardPage.value
    } catch(e){setError(key,e);throw e}
  }
  async function loadBoard(id:string) { const existing=boardById(id);if(existing)return existing;const item=mapBoard(await apiRequest<ApiBoard>(`/api/v1/boards/${id}`));boards.value.push(item);return item }
  async function loadAttractions(page=1,size=20) { const key='attractions';setLoading(key);try{const raw=await apiRequest<ApiPage<ApiAttraction>>(`/api/v1/tourism/attractions${queryString({page,size})}`);const items=raw.items.map(mapAttraction);attractionPage.value={items,total:raw.total,page:raw.page,size:raw.size};attractions.value=items;state.value[key]='ready';return attractionPage.value}catch(e){setError(key,e);throw e} }
  async function loadFestivals(page=1,size=20) { const key='festivals';setLoading(key);try{const raw=await apiRequest<ApiPage<ApiFestival>>(`/api/v1/tourism/festivals${queryString({page,size})}`);const items=raw.items.map(mapFestival);festivalPage.value={items,total:raw.total,page:raw.page,size:raw.size};festivals.value=items;state.value[key]='ready';return festivalPage.value}catch(e){setError(key,e);throw e} }
  async function loadAttraction(id:string) { const item=mapAttraction(await apiRequest<ApiAttraction>(`/api/v1/tourism/attractions/${encodeURIComponent(id)}`));attractions.value=[...attractions.value.filter(x=>x.id!==id),item];return item }
  async function loadFestival(id:string) { const item=mapFestival(await apiRequest<ApiFestival>(`/api/v1/tourism/festivals/${encodeURIComponent(id)}`));festivals.value=[...festivals.value.filter(x=>x.id!==id),item];return item }
  async function loadTags() { const raw=await apiRequest<ApiPage<ApiTag>>('/api/v1/tags?page=1&size=100');tags.value=raw.items.map(mapTag);return tags.value }
  async function createTag(name:string) {
    const payload:ApiTagCreate={name}
    try { const item=mapTag(await apiRequest<ApiTag>('/api/v1/tags',{method:'POST',body:JSON.stringify(payload)}));tags.value.push(item);return item }
    catch(error) {
      if(!(error instanceof ApiError)||error.status!==409) throw error
      const existing=(await loadTags()).find(tag=>tag.label.ko.trim().toLocaleLowerCase()===name.trim().toLocaleLowerCase())
      if(!existing) throw error
      return existing
    }
  }
  async function loadPosts(boardId:string, params:{keyword?:string;sort?:string;page?:number;size?:number;tagId?:number}={}) { const key='posts';setLoading(key);try{const raw=await apiRequest<ApiPage<ApiPost>>(`/api/v1/boards/${boardId}/posts${queryString(params)}`);postPage.value={items:raw.items.map(mapPost),total:raw.total,page:raw.page,size:raw.size};posts.value=[...posts.value.filter(x=>x.boardId!==boardId),...postPage.value.items];state.value[key]='ready';return postPage.value}catch(e){setError(key,e);throw e} }
  async function loadPopularPosts(page=1,size=5) { const key='popular';setLoading(key);try{const raw=await apiRequest<ApiPage<ApiPost>>(`/api/v1/posts/popular${queryString({page,size})}`);popularPosts.value=raw.items.map(mapPost);state.value[key]='ready';return popularPosts.value}catch(e){setError(key,e);throw e} }
  async function checkHealth(){try{const result=await apiRequest<{status:string}>('/health');serviceHealthy.value=result.status==='healthy'}catch{serviceHealthy.value=false}}
  async function loadPost(id:string) { const key='post';setLoading(key);try{const item=mapPost(await apiRequest<ApiPost>(`/api/v1/posts/${id}`,{clientId:true}));posts.value=[...posts.value.filter(x=>x.id!==id),item];state.value[key]='ready';return item}catch(e){setError(key,e);throw e} }
  const toWrite=(input:{title:string;body:string;tags:Tag[];media:Media[];password:string}):PostWritePayload=>({title:input.title,content:input.body,password:input.password,tags:input.tags.filter(t=>t.id).map(t=>({tagId:t.id!,name:t.label.ko,category:t.kind==='transit'?'TRANSPORT':t.kind.toUpperCase()})),media:input.media.map(m=>({mediaId:m.id,imageUrl:m.url}))})
  async function uploadMedia(file:File) { const form=new FormData();form.append('file',file);const raw=await apiRequest<ApiMedia>('/api/v1/media',{method:'POST',body:form});return {id:raw.mediaId,url:raw.imageUrl} }
  async function createPost(input:{boardId:string;title:string;body:string;tags:Tag[];media:Media[];password:string}) { const item=mapPost(await apiRequest<ApiPost>(`/api/v1/boards/${input.boardId}/posts`,{method:'POST',clientId:true,body:JSON.stringify(toWrite(input))}));posts.value.unshift(item);return item }
  async function verifyPostPassword(id:string,password:string) { await apiRequest(`/api/v1/posts/${id}/password/verify`,{method:'POST',clientId:true,body:JSON.stringify({password})}) }
  async function updatePost(id:string,input:{title:string;body:string;tags:Tag[];media:Media[];password:string}) { const item=mapPost(await apiRequest<ApiPost>(`/api/v1/posts/${id}`,{method:'PUT',body:JSON.stringify(toWrite(input))}));posts.value=[...posts.value.filter(x=>x.id!==id),item];return item }
  async function deletePost(id:string,password:string) { await apiRequest(`/api/v1/posts/${id}`,{method:'DELETE',body:JSON.stringify({password})});posts.value=posts.value.filter(x=>x.id!==id) }
  async function loadLike(id:string) { const result=await apiRequest<ApiLike>(`/api/v1/posts/${id}/likes/me`,{clientId:true});const item=postById(id);if(item){item.liked=result.liked;item.likes=result.likeCount};return result }
  async function toggleLike(id:string) { const item=postById(id);const result=await apiRequest<ApiLike>(`/api/v1/posts/${id}/likes`,{method:item?.liked?'DELETE':'POST',clientId:true});if(item){item.liked=result.liked;item.likes=result.likeCount} }
  async function loadComments(postId:string) { const raw=await apiRequest<ApiPage<ApiComment>>(`/api/v1/posts/${postId}/comments?page=1&size=100`);comments.value=flattenComments(raw.items);return comments.value }
  async function addComment(postId:string,body:string,password:string,parentId?:string) { await apiRequest(`/api/v1/posts/${postId}/comments`,{method:'POST',clientId:true,body:JSON.stringify({content:body,password,parentId:parentId?Number(parentId):null})});await loadComments(postId);const post=postById(postId);if(post)post.comments++ }
  async function updateComment(id:string,body:string,password:string) { const raw=await apiRequest<ApiComment>(`/api/v1/comments/${id}`,{method:'PUT',body:JSON.stringify({content:body,password})});const item=comments.value.find(x=>x.id===id);if(item){item.body=raw.content;item.updatedAt=raw.updatedAt||undefined} }
  async function deleteComment(id:string,password:string) { const item=comments.value.find(x=>x.id===id);await apiRequest(`/api/v1/comments/${id}`,{method:'DELETE',body:JSON.stringify({password})});if(item){item.deleted=true;item.body='';const post=postById(item.postId);if(post&&post.comments>0)post.comments--} }
  async function searchAll(q:string,page=1,size=20) { const raw=await apiRequest<ApiSearchResponse>(`/api/v1/search${queryString({q,page,size})}`);return {...raw,items:raw.items.map(item=>({...item,description:item.description?inlineStructuredInfo(item.description):item.description}))} }
  async function chat(message:string,history:{role:'user'|'assistant';content:string}[],sessionId:string) { return apiRequest<ApiChatResponse>('/api/v1/chat',{method:'POST',clientId:true,sessionId,body:JSON.stringify({message,language:lang.value,history:history.slice(-10)})}) }

  function connectRealtime() {
    realtimeStopped=false
    if(typeof WebSocket==='undefined'||realtimeSocket?.readyState===WebSocket.OPEN||realtimeSocket?.readyState===WebSocket.CONNECTING)return
    const socket=new WebSocket(createRealtimeUrl(getClientId()))
    realtimeSocket=socket
    socket.addEventListener('open',()=>{if(realtimeSocket!==socket)return;realtimeConnected.value=true;reconnectAttempt=0})
    socket.addEventListener('message',(message)=>{
      const event=parseRealtimeEvent(String(message.data))
      if(!event)return
      if(event.event==='presence.updated'){connectedCount.value=event.data.connectedCount;return}
      latestPostEvent.value=event.data
      const board=boardById(String(event.data.boardId));if(board)board.count++
    })
    socket.addEventListener('close',()=>{
      if(realtimeSocket!==socket)return
      realtimeSocket=null;realtimeConnected.value=false
      if(realtimeStopped)return
      const delay=Math.min(1000*2**reconnectAttempt++,30000)
      reconnectTimer=window.setTimeout(connectRealtime,delay)
    })
    socket.addEventListener('error',()=>socket.close())
  }

  function disconnectRealtime() {
    realtimeStopped=true
    if(reconnectTimer!==undefined){window.clearTimeout(reconnectTimer);reconnectTimer=undefined}
    const socket=realtimeSocket;realtimeSocket=null;realtimeConnected.value=false
    if(socket&&socket.readyState< WebSocket.CLOSING)socket.close(1000,'App closed')
  }

  watch(lang, value => { localStorage.setItem('blh-lang', value); document.documentElement.lang = value }, { immediate: true })
  watch([theme,fontScale],()=>{localStorage.setItem('blh-theme',theme.value);localStorage.setItem('blh-font',String(fontScale.value))},{deep:true})
  const isDark=computed(()=>theme.value==='dark')
  return {lang,theme,fontScale,isDark,boards,boardPage,attractions,attractionPage,festivals,festivalPage,posts,popularPosts,postPage,comments,tags,state,errors,serviceHealthy,realtimeConnected,connectedCount,latestPostEvent,t,tr,postTitle,postBody,boardById,postById,commentsFor,loadBoards,loadBoard,loadAttractions,loadFestivals,loadAttraction,loadFestival,loadTags,createTag,loadPosts,loadPopularPosts,checkHealth,loadPost,uploadMedia,createPost,verifyPostPassword,updatePost,deletePost,loadLike,toggleLike,loadComments,addComment,updateComment,deleteComment,searchAll,chat,connectRealtime,disconnectRealtime}
})
