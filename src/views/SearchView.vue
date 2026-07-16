<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AlertTriangle, FileText, ImageOff, MapPinned, Search } from '@lucide/vue'
import { useAppStore } from '../stores/app'
import type { ApiSearchItem } from '../api/contracts'

const app=useAppStore(),route=useRoute(),router=useRouter()
const input=ref(String(route.query.q||'')),query=ref(String(route.query.q||'')),page=ref(Math.max(1,Number(route.query.page||1)))
const items=ref<ApiSearchItem[]>([]),total=ref(0),size=ref(20),loading=ref(false),error=ref(''),searched=ref(!!query.value)
const totalPages=computed(()=>Math.max(1,Math.ceil(total.value/size.value)))
const resultLink=(item:ApiSearchItem)=>item.resultType==='BOARD'?`/boards/${item.boardId}/posts`:`/boards/${item.boardId}/posts/${item.resultId}`

async function search(resetPage=false){const value=input.value.trim();if(!value)return;if(resetPage)page.value=1;query.value=value;searched.value=true;loading.value=true;error.value='';await router.replace({query:{q:value,page:page.value>1?String(page.value):undefined}});try{const result=await app.searchAll(value,page.value,size.value);items.value=result.items;total.value=result.total;size.value=result.size}catch(e){items.value=[];total.value=0;error.value=(e as Error).message}finally{loading.value=false}}
function move(next:number){if(next<1||next>totalPages.value)return;page.value=next;search()}
onMounted(()=>{if(query.value)search()})
watch(()=>route.query.q,value=>{const next=String(value||'');if(next&&next!==query.value){input.value=next;page.value=1;search()}})
</script>

<template><div class="page fade">
  <RouterLink class="btn mb-5" to="/">← {{app.t('뒤로','Back')}}</RouterLink>
  <h1 class="text-4xl font-extrabold">{{app.t('통합 검색','Search')}}</h1>
  <p class="mt-3 text-[var(--sub)]">{{app.t('장소별 게시판과 커뮤니티 게시글을 한 번에 찾아보세요.','Find local boards and community posts in one place.')}}</p>
  <form class="mt-7 flex max-w-3xl gap-2" @submit.prevent="search(true)"><label class="relative flex-1"><span class="sr-only">{{app.t('검색어','Search term')}}</span><Search class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--sub)]" :size="19"/><input v-model="input" class="input !pl-12" maxlength="200" :placeholder="app.t('장소, 축제, 게시글 검색','Search places, festivals, and posts')"></label><button class="btn btn-primary" :disabled="loading||!input.trim()">{{app.t('검색','Search')}}</button></form>

  <div v-if="loading" class="mt-8 space-y-3" aria-live="polite"><div v-for="n in 5" :key="n" class="card h-28 animate-pulse bg-[var(--surface)]"></div></div>
  <div v-else-if="error" class="empty mt-8"><AlertTriangle class="mx-auto text-[var(--danger)]"/><h2 class="mt-3 text-lg font-bold">{{app.t('검색 결과를 불러오지 못했습니다','Unable to load search results')}}</h2><p class="mt-2 text-[var(--sub)]">{{error}}</p><button class="btn mt-4" @click="search()">{{app.t('다시 시도','Try again')}}</button></div>
  <div v-else-if="searched&&!items.length" class="empty mt-8"><Search class="mx-auto text-[var(--sub)]"/><h2 class="mt-3 text-lg font-bold">{{app.t('검색 결과가 없습니다','No results found')}}</h2><p class="mt-2 text-[var(--sub)]">{{app.t('다른 검색어로 다시 찾아보세요.','Try a different search term.')}}</p></div>
  <div v-else-if="searched" class="mt-8"><p class="mb-4 text-sm text-[var(--sub)]"><strong class="text-[var(--text)]">“{{query}}”</strong> 검색 결과 {{total.toLocaleString()}}개</p><div class="grid gap-3"><RouterLink v-for="item in items" :key="`${item.resultType}-${item.resultId}`" :to="resultLink(item)" class="card card-hover flex min-w-0 gap-4 overflow-hidden p-4"><img v-if="item.image" :src="item.image" :alt="item.title" class="h-24 w-28 shrink-0 rounded-xl object-cover"><span v-else class="grid h-24 w-28 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-[var(--sub)]"><ImageOff :size="24"/></span><div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><span class="tag" :class="item.resultType==='BOARD'?'tag-attraction':'tag-review'"><MapPinned v-if="item.resultType==='BOARD'" :size="13"/><FileText v-else :size="13"/>{{item.resultType==='BOARD'?'장소 게시판':'게시글'}}</span><span v-if="item.category" class="text-xs text-[var(--sub)]">{{item.category}}</span></div><h2 class="mt-2 truncate text-lg font-bold">{{item.title}}</h2><p v-if="item.description" class="mt-2 line-clamp-2 text-sm leading-6 text-[var(--sub)]">{{item.description}}</p></div></RouterLink></div><nav v-if="totalPages>1" class="mt-8 flex items-center justify-center gap-3" aria-label="검색 결과 페이지"><button class="btn" :disabled="page<=1" @click="move(page-1)">이전</button><span class="text-sm font-bold">{{page}} / {{totalPages}}</span><button class="btn" :disabled="page>=totalPages" @click="move(page+1)">다음</button></nav></div>
  <div v-else class="empty mt-8"><Search class="mx-auto text-[var(--sub)]"/><h2 class="mt-3 text-lg font-bold">{{app.t('부산의 장소와 이야기를 검색해 보세요','Search for places and stories in Busan')}}</h2></div>
</div></template>
