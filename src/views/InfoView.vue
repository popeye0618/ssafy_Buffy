<script setup lang="ts">
import { useAppStore } from '../stores/app'

defineProps<{ section: 'about' | 'guide' | 'sources' }>()
const app = useAppStore()
</script>

<template>
  <div class="page fade">
    <RouterLink class="btn mb-6" to="/">← {{app.t('홈으로', 'Home')}}</RouterLink>

    <article v-if="section === 'about'" class="max-w-3xl">
      <img src="/brand/logo-horizontal.svg" alt="buffy" class="h-16 max-w-full">
      <h1 class="mt-8 text-4xl font-extrabold">{{app.t('서비스 소개', 'About buffy')}}</h1>
      <p class="mt-5 text-lg leading-9 text-[var(--sub)]">{{app.t('buffy는 부산을 방문하는 국내외 관광객이 관광지와 축제를 먼저 탐색하고, 지역별 익명 커뮤니티에서 현지 경험을 나눌 수 있도록 연결하는 서비스입니다.', 'buffy helps visitors discover attractions and festivals, then share firsthand experiences through anonymous local communities.')}}</p>
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
      <p class="mt-4 leading-7 text-[var(--sub)]">{{app.t('buffy는 현재 운영 백엔드와 연결되어 있으며, 아래 기준으로 관광 정보와 커뮤니티 콘텐츠를 제공합니다.', 'buffy is connected to its production backend and provides tourism and community content under the following terms.')}}</p>

      <div class="card mt-8 p-6">
        <h2 class="text-xl font-bold">{{app.t('관광지·축제 정보', 'Attraction and festival information')}}</h2>
        <p class="mt-3 leading-7 text-[var(--sub)]">{{app.t('관광지와 축제 정보는 buffy 백엔드 API를 통해 제공됩니다. 일부 이미지와 관광 원문은 한국관광공사 VisitKorea 계열 콘텐츠 서버 등 공공 관광정보 원천에서 제공되며, 원문·사진의 권리는 각 원 제공기관과 저작권자에게 있습니다.', 'Attraction and festival information is delivered through the buffy backend API. Some images and source content are provided by public tourism sources, including Korea Tourism Organization VisitKorea content servers. Rights to source text and images remain with their original providers and copyright holders.')}}</p>
        <div class="mt-4 flex flex-wrap gap-3 text-sm"><a class="link" href="https://api.visitkorea.or.kr/" target="_blank" rel="noopener noreferrer">TourAPI</a><a class="link" href="https://www.data.go.kr/" target="_blank" rel="noopener noreferrer">{{app.t('공공데이터포털', 'Public Data Portal')}}</a><a class="link" href="https://www.visitbusan.net/" target="_blank" rel="noopener noreferrer">Visit Busan</a></div>
      </div>

      <div class="card mt-4 p-6">
        <h2 class="text-xl font-bold">{{app.t('일정과 운영 정보', 'Schedules and operating information')}}</h2>
        <p class="mt-3 leading-7 text-[var(--sub)]">{{app.t('행사 일정, 장소, 이용시간과 운영 상태는 원 제공기관의 변경 사항이 즉시 반영되지 않을 수 있습니다. 실제 방문 전 주최기관이나 시설의 공식 채널에서 최신 정보를 확인해 주세요.', 'Event schedules, venues, opening hours, and operating status might not immediately reflect changes from the original provider. Confirm the latest details through the organizer or venue before visiting.')}}</p>
      </div>

      <div class="card mt-4 p-6">
        <h2 class="text-xl font-bold">{{app.t('커뮤니티 콘텐츠', 'Community content')}}</h2>
        <p class="mt-3 leading-7 text-[var(--sub)]">{{app.t('게시글과 댓글은 이용자가 직접 작성한 콘텐츠입니다. 작성 내용의 정확성과 권리는 해당 작성자에게 있으며, 서비스의 공식 관광 안내로 간주되지 않습니다.', 'Posts and comments are user-generated content. Their accuracy and associated rights remain with their authors, and they should not be treated as official tourism guidance.')}}</p>
      </div>

      <div class="card mt-4 p-6">
        <h2 class="text-xl font-bold">{{app.t('영문 번역과 AI 안내', 'English translations and AI guidance')}}</h2>
        <p class="mt-3 leading-7 text-[var(--sub)]">{{app.t('영문 관광 정보와 게시글 번역, 챗봇 답변은 자동 처리된 결과를 포함할 수 있습니다. 고유명사, 주소, 일정에는 번역 오류가 있을 수 있으므로 중요한 정보는 한국어 원문과 공식 출처를 함께 확인해 주세요.', 'English tourism information, post translations, and chatbot responses may include automatically processed content. Proper names, addresses, and schedules can contain translation errors, so verify important details against the Korean source and official channels.')}}</p>
      </div>

      <div class="card mt-4 p-6">
        <h2 class="text-xl font-bold">{{app.t('API 및 서비스 상태', 'API and service status')}}</h2>
        <p class="mt-3 leading-7 text-[var(--sub)]">{{app.t('현재 서비스는 실제 백엔드 API, 이미지 저장소, 실시간 WebSocket 연결을 사용합니다. API 명세는 아래 문서에서 확인할 수 있습니다.', 'The service currently uses a production backend API, image storage, and a real-time WebSocket connection. The API specification is available below.')}}</p>
        <a class="link mt-4 inline-flex" href="https://ssafy-first-team.onrender.com/docs" target="_blank" rel="noopener noreferrer">buffy API Docs</a>
      </div>
    </article>
  </div>
</template>
