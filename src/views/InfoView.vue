<script setup lang="ts">
import { useAppStore } from '../stores/app'

defineProps<{ section: 'about' | 'guide' | 'sources' }>()
const app = useAppStore()
</script>

<template>
  <div class="page fade">
    <RouterLink class="btn mb-6" to="/">← {{app.t('홈으로', 'Home')}}</RouterLink>

    <article v-if="section === 'about'" class="max-w-3xl">
      <img src="/brand/logo-horizontal.svg" alt="Busan LocalHub" class="h-16 max-w-full">
      <h1 class="mt-8 text-4xl font-extrabold">{{app.t('서비스 소개', 'About Busan LocalHub')}}</h1>
      <p class="mt-5 text-lg leading-9 text-[var(--sub)]">{{app.t('Busan LocalHub는 부산을 방문하는 국내외 관광객이 관광지와 축제를 먼저 탐색하고, 지역별 익명 커뮤니티에서 현지 경험을 나눌 수 있도록 연결하는 서비스입니다.', 'Busan LocalHub helps visitors discover attractions and festivals, then share firsthand experiences through anonymous local communities.')}}</p>
      <div class="mt-8 grid gap-4 md:grid-cols-3">
        <div class="card p-5"><strong>{{app.t('관광 정보', 'Travel information')}}</strong><p class="mt-2 text-sm leading-6 text-[var(--sub)]">{{app.t('관광지와 축제 정보를 한눈에 탐색합니다.', 'Explore attractions and festivals at a glance.')}}</p></div>
        <div class="card p-5"><strong>{{app.t('익명 커뮤니티', 'Anonymous community')}}</strong><p class="mt-2 text-sm leading-6 text-[var(--sub)]">{{app.t('로그인 없이 여행 팁과 질문을 공유합니다.', 'Share travel tips and questions without signing in.')}}</p></div>
        <div class="card p-5"><strong>{{app.t('여행 도우미', 'Travel assistant')}}</strong><p class="mt-2 text-sm leading-6 text-[var(--sub)]">{{app.t('모든 화면에서 챗봇을 이용합니다.', 'Use the chatbot from any page.')}}</p></div>
      </div>
    </article>

    <article v-else-if="section === 'guide'" class="max-w-3xl">
      <h1 class="text-4xl font-extrabold">{{app.t('이용 안내', 'User guide')}}</h1>
      <ol class="mt-8 space-y-4">
        <li class="card p-5"><strong>{{app.t('1. 관광지와 축제를 찾아보세요', '1. Find attractions and festivals')}}</strong><p class="mt-2 text-[var(--sub)]">{{app.t('검색과 필터를 이용해 관심 있는 장소를 찾습니다.', 'Use search and filters to find places that interest you.')}}</p></li>
        <li class="card p-5"><strong>{{app.t('2. 지역 커뮤니티를 확인하세요', '2. Explore local communities')}}</strong><p class="mt-2 text-[var(--sub)]">{{app.t('실제 여행자의 후기와 최신 현지 정보를 확인합니다.', 'Read traveler reviews and current local information.')}}</p></li>
        <li class="card p-5"><strong>{{app.t('3. 익명으로 경험을 나누세요', '3. Share anonymously')}}</strong><p class="mt-2 text-[var(--sub)]">{{app.t('게시글 비밀번호는 수정과 삭제에 필요하며 다시 표시되지 않습니다.', 'Your post password is required for edits and deletion and will not be shown again.')}}</p></li>
      </ol>
    </article>

    <article v-else class="max-w-3xl">
      <h1 class="text-4xl font-extrabold">{{app.t('데이터 출처 및 라이선스', 'Data sources & licenses')}}</h1>
      <div class="card mt-8 p-6"><h2 class="text-xl font-bold">{{app.t('관광·축제 데이터', 'Tourism and festival data')}}</h2><p class="mt-3 leading-7 text-[var(--sub)]">{{app.t('부산광역시 공공데이터포털과 부산관광공사의 공개 정보를 참고해 재구성한 mock 데이터입니다. 현재 화면의 행사 일정과 운영 정보는 실제 방문 전 공식 채널에서 다시 확인해야 합니다.', 'This mock data was reconstructed from public information provided by Busan Metropolitan City and the Busan Tourism Organization. Confirm event schedules and operating information through official channels before visiting.')}}</p></div>
      <div class="card mt-4 p-6"><h2 class="text-xl font-bold">{{app.t('프로토타입 안내', 'Prototype notice')}}</h2><p class="mt-3 leading-7 text-[var(--sub)]">{{app.t('현재 버전은 프론트엔드 시연용이며 실제 백엔드, 공공 API, 파일 저장소와 연결되어 있지 않습니다.', 'This version is a front-end demonstration and is not connected to a production backend, public API, or file storage.')}}</p></div>
    </article>
  </div>
</template>
