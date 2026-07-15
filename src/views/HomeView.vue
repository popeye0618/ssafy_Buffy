<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { AlertTriangle, CalendarDays, Heart, MapPin, MessageCircle, MessagesSquare, Search, Wifi, WifiOff } from '@lucide/vue'
import { useRouter } from 'vue-router'
import FestivalStatusBadge from '../components/FestivalStatusBadge.vue'
import StructuredInfoText from '../components/StructuredInfoText.vue'
import { useAppStore } from '../stores/app'

const app=useAppStore(),router=useRouter(),heroQuery=ref('')
const goSearch=()=>router.push({path:'/search',query:heroQuery.value.trim()?{q:heroQuery.value.trim()}:undefined})
onMounted(()=>{
  app.loadAttractions(1,6).catch(()=>{})
  app.loadFestivals(1,4).catch(()=>{})
  app.loadBoards({page:1,size:4}).catch(()=>{})
  app.loadPopularPosts(1,5).catch(()=>{})
  app.checkHealth()
})
</script>

<template><div class="page fade">
  <section class="pt-2 md:pt-3"><div class="grid items-center gap-9 md:grid-cols-[1.08fr_.92fr]"><div>
    <h1 class="whitespace-pre-line text-[clamp(2.15rem,5vw,3.55rem)] font-extrabold leading-[1.12] tracking-[-.04em]">{{app.lang==='ko'?'부산에서 무엇을\n즐기고 싶나요?':'What would you like\nto enjoy in Busan?'}}</h1>
    <p class="mt-5 whitespace-nowrap text-[clamp(.7rem,1.55vw,1.125rem)] leading-8 text-[var(--sub)]">{{app.lang==='ko'?'관광지와 축제를 먼저 살펴보고, 지역별 익명 커뮤니티에서 현지 경험을 나눠보세요.':'Explore attractions and festivals, then share local tips in anonymous community boards.'}}</p>
    <form class="mt-7 flex max-w-xl items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 pl-4 shadow-[var(--shadow-md)]" @submit.prevent="goSearch"><Search :size="20"/><input v-model="heroQuery" class="min-w-0 flex-1 bg-transparent p-2 outline-none" placeholder="장소, 축제, 게시글 검색"><button class="btn btn-primary" :disabled="!heroQuery.trim()">검색</button></form>
    <div class="mt-6 flex flex-wrap gap-2"><RouterLink class="btn btn-soft" to="/festivals"><CalendarDays :size="18"/>진행 중인 축제</RouterLink><RouterLink class="btn" to="/attractions"><MapPin :size="18"/>관광지</RouterLink><RouterLink class="btn" to="/boards"><MessagesSquare :size="18"/>커뮤니티</RouterLink></div>
  </div><div class="h-[330px] overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)]"><img src="/brand/hero-busan-v2.png" :alt="app.lang==='ko'?'갈매기 마스코트와 함께 부산 여행을 시작해 보세요':'Start your Busan trip with the seagull mascot'" class="h-full w-full object-cover"></div></div></section>

  <section class="section"><div class="section-head"><h2 class="section-title">현재 진행 중인 축제</h2><RouterLink class="link" to="/festivals">더 보기 →</RouterLink></div>
    <div v-if="app.state.festivals==='error'" class="empty"><AlertTriangle class="mx-auto text-[var(--danger)]"/><p class="mt-2">{{app.errors.festivals}}</p><button class="btn mt-3" @click="app.loadFestivals().catch(()=>{})">다시 시도</button></div>
    <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-4"><RouterLink v-for="f in app.festivals.slice(0,4)" :key="f.id" :to="`/festivals/${f.id}`" class="card card-hover overflow-hidden"><img v-if="f.image" :src="f.image" :alt="app.tr(f.name)" class="h-32 w-full object-cover"><div v-else class="placeholder h-32">이미지 준비 중</div><div class="p-4"><FestivalStatusBadge :status="f.status"/><h3 class="mt-3 font-bold">{{app.tr(f.name)}}</h3><p class="mt-2 text-sm text-[var(--sub)]">{{app.tr(f.place)}}</p></div></RouterLink></div>
  </section>

  <section class="section"><div class="section-head"><h2 class="section-title">부산 관광지</h2><RouterLink class="link" to="/attractions">더 보기 →</RouterLink></div>
    <div v-if="app.state.attractions==='error'" class="empty"><AlertTriangle class="mx-auto text-[var(--danger)]"/><p class="mt-2">{{app.errors.attractions}}</p><button class="btn mt-3" @click="app.loadAttractions().catch(()=>{})">다시 시도</button></div>
    <div v-else class="grid-cards"><RouterLink v-for="spot in app.attractions.slice(0,6)" :key="spot.id" :to="`/attractions/${spot.id}`" class="card card-hover overflow-hidden"><img v-if="spot.image" :src="spot.image" :alt="app.tr(spot.name)" class="h-36 w-full object-cover"><div v-else class="placeholder h-36">이미지 준비 중</div><div class="p-4"><h3 class="font-bold">{{app.tr(spot.name)}}</h3><StructuredInfoText compact :text="app.tr(spot.summary)"/></div></RouterLink></div>
  </section>

  <section class="section"><div class="section-head"><h2 class="section-title">장소별 커뮤니티</h2><RouterLink class="link" to="/boards">전체 게시판 →</RouterLink></div><div class="grid gap-3 md:grid-cols-4"><RouterLink v-for="board in app.boardPage.items.slice(0,4)" :key="board.id" :to="`/boards/${board.id}/posts`" class="card card-hover p-4"><span class="text-xs text-[var(--link)]">{{app.tr(board.category)}}</span><h3 class="mt-2 font-bold">{{app.tr(board.name)}}</h3><p class="mt-2 line-clamp-2 text-sm text-[var(--sub)]">{{app.tr(board.description)}}</p></RouterLink></div></section>

  <section class="section grid gap-5 md:grid-cols-[1.4fr_1fr]"><div><h2 class="section-title mb-4">인기 게시글</h2><div v-if="app.state.popular==='loading'" class="card h-48 animate-pulse bg-[var(--surface)]"></div><div v-else-if="app.state.popular==='error'" class="card p-6"><p class="text-sm text-[var(--danger)]">{{app.errors.popular}}</p><button class="btn mt-4" @click="app.loadPopularPosts(1,5).catch(()=>{})">다시 시도</button></div><div v-else-if="!app.popularPosts.length" class="card p-6"><div class="flex items-center gap-2 font-bold text-[var(--sub)]"><Heart :size="18"/><span>아직 인기 게시글이 없습니다</span></div><p class="mt-3 text-sm leading-6 text-[var(--sub)]">첫 번째 여행 이야기와 추천을 남겨보세요.</p></div><div v-else class="card overflow-hidden"><RouterLink v-for="post in app.popularPosts" :key="post.id" :to="`/boards/${post.boardId}/posts/${post.id}`" class="block border-b border-[var(--border)] p-4 last:border-0 hover:bg-[var(--highlight)]"><h3 class="font-bold">{{post.title}}</h3><div class="mt-2 flex gap-4 text-xs text-[var(--sub)]"><span class="metric text-red-500"><Heart :size="14"/>{{post.likes}}</span><span class="metric"><MessageCircle :size="14"/>{{post.comments}}</span></div></RouterLink></div></div>
    <div><h2 class="section-title mb-4">서비스 상태</h2><div class="card p-6"><div class="flex items-center gap-2 font-bold" :class="app.serviceHealthy?'text-[var(--realtime)]':'text-[var(--danger)]'"><Wifi v-if="app.serviceHealthy" :size="18"/><WifiOff v-else :size="18"/>{{app.serviceHealthy?'정상 연결':'연결 확인 필요'}}</div><p class="mt-4 text-sm leading-6 text-[var(--sub)]">자동 새로고침 없이 필요한 화면에서만 최신 정보를 조회합니다.</p></div></div>
  </section>
</div></template>
