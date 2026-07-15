<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { AlertTriangle, MapPin, Search } from '@lucide/vue'
import { useAppStore } from '../stores/app'

const app=useAppStore(),router=useRouter(),page=ref(1),keyword=ref('')
const load=()=>app.loadBoards({page:page.value,size:20}).catch(()=>{})
const search=()=>{const q=keyword.value.trim();if(q)router.push({path:'/search',query:{q}})}
onMounted(load);watch(page,load)
</script>

<template><div class="page fade">
  <nav class="mb-5 text-sm text-[var(--sub)]"><RouterLink class="link" to="/">홈</RouterLink> › 커뮤니티</nav>
  <div class="flex flex-wrap items-end justify-between gap-5"><div><h1 class="text-4xl font-extrabold">장소별 커뮤니티</h1><p class="mt-3 text-[var(--sub)]">관광지와 시설별 익명 게시판에서 현지 경험을 나눠보세요.</p></div><span class="rounded-full bg-[var(--primary-soft)] px-4 py-2 text-sm font-bold text-[var(--link)]">전체 {{app.boardPage.total.toLocaleString()}}개</span></div>
  <form class="mt-7 flex gap-2" @submit.prevent="search"><label class="relative flex-1"><span class="sr-only">장소 게시판 검색</span><Search class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--sub)]" :size="18"/><input v-model="keyword" class="input !pl-11" placeholder="장소명이나 게시글을 통합 검색"></label><button class="btn btn-primary" :disabled="!keyword.trim()">검색</button></form>
  <p class="mt-3 text-xs text-[var(--sub)]">분류와 검색은 통합검색에서 전체 데이터를 기준으로 제공합니다.</p>

  <div v-if="app.state.boards==='loading'" class="mt-7 grid gap-4 md:grid-cols-2"><div v-for="n in 8" :key="n" class="card h-36 animate-pulse bg-[var(--surface)]"></div></div>
  <div v-else-if="app.state.boards==='error'" class="empty mt-7"><AlertTriangle class="mx-auto text-[var(--danger)]"/><h2 class="mt-3 font-bold">게시판을 불러오지 못했습니다</h2><p class="mt-2 text-[var(--sub)]">{{app.errors.boards}}</p><button class="btn mt-4" @click="load">다시 시도</button></div>
  <div v-else-if="!app.boardPage.items.length" class="empty mt-7"><h2 class="font-bold">표시할 게시판이 없습니다</h2></div>
  <div v-else class="mt-7 grid gap-4 md:grid-cols-2"><RouterLink v-for="b in app.boardPage.items" :key="b.id" :to="`/boards/${b.id}/posts`" class="card card-hover flex gap-4 overflow-hidden p-4"><img v-if="b.image" :src="b.image" :alt="app.tr(b.name)" class="h-28 w-32 shrink-0 rounded-xl object-cover"><div v-else class="placeholder h-28 w-32 shrink-0 rounded-xl">이미지 준비 중</div><div class="min-w-0 flex-1"><div class="flex items-center gap-2"><MapPin :size="15" class="text-[var(--link)]"/><span class="text-xs font-bold text-[var(--link)]">{{app.tr(b.category)}}</span></div><h2 class="mt-2 truncate text-lg font-bold">{{app.tr(b.name)}}</h2><p class="mt-2 line-clamp-2 text-sm leading-6 text-[var(--sub)]">{{app.tr(b.description)||'장소에 대한 경험과 정보를 공유해 보세요.'}}</p><p class="mt-2 text-xs text-[var(--sub)]">게시글 {{b.count.toLocaleString()}}개</p></div></RouterLink></div>
  <nav v-if="app.boardPage.total>app.boardPage.size" class="mt-8 flex items-center justify-center gap-3" aria-label="게시판 페이지"><button class="btn" :disabled="page<=1" @click="page--">이전</button><span class="text-sm font-bold">{{page}} / {{Math.ceil(app.boardPage.total/app.boardPage.size)}}</span><button class="btn" :disabled="page>=Math.ceil(app.boardPage.total/app.boardPage.size)" @click="page++">다음</button></nav>
</div></template>
