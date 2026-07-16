<script setup lang="ts">
import { Download, Home, Languages, MapPin, Menu, MessagesSquare, Moon, PartyPopper, Share, Sun, X } from '@lucide/vue'
import { ref } from 'vue'
import { useAppStore } from '../stores/app'
import { usePwaInstall } from '../composables/usePwaInstall'

const app = useAppStore()
const pwa = usePwaInstall()
const moreOpen = ref(false)
const toggleTheme = () => app.theme = app.theme === 'light' ? 'dark' : 'light'
const toggleLang = () => app.lang = app.lang === 'ko' ? 'en' : 'ko'
const close = () => { moreOpen.value = false }
</script>

<template>
  <button v-if="moreOpen" class="mobile-only fixed inset-0 z-40 bg-black/25" :aria-label="app.t('더보기 메뉴 닫기','Close more menu')" @click="close"></button>
  <Transition name="select-pop">
    <section v-if="moreOpen" id="mobile-more-menu" class="mobile-only fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-[var(--shadow-lg)]" :aria-label="app.t('더보기 메뉴','More menu')">
      <div class="grid grid-cols-2 gap-2">
        <button class="btn min-h-14" :aria-label="app.t('언어 전환','Switch language')" @click="toggleLang"><Languages :size="19"/>{{app.lang === 'ko' ? 'English' : '한국어'}}</button>
        <button class="btn min-h-14" :aria-label="app.t('화면 테마 전환','Change theme')" @click="toggleTheme"><Sun v-if="app.theme === 'dark'" :size="19"/><Moon v-else :size="19"/>{{app.theme === 'dark' ? app.t('라이트 모드','Light mode') : app.t('다크 모드','Dark mode')}}</button>
        <button v-if="pwa.canInstall.value" class="btn col-span-2 min-h-14" @click="pwa.install"><Download :size="19"/>{{app.t('앱으로 설치','Install app')}}</button>
      </div>
      <div class="mt-3 grid gap-1 border-t border-[var(--border)] pt-3" @click="close">
        <RouterLink class="rounded-xl p-3 font-bold hover:bg-[var(--highlight)]" to="/boards">{{app.t('전체·지역별 게시판','All community boards')}}</RouterLink>
        <RouterLink class="rounded-xl p-3 font-bold hover:bg-[var(--highlight)]" to="/about">{{app.t('서비스 소개','About')}}</RouterLink>
        <RouterLink class="rounded-xl p-3 font-bold hover:bg-[var(--highlight)]" to="/guide">{{app.t('이용 안내','User guide')}}</RouterLink>
        <RouterLink class="rounded-xl p-3 font-bold hover:bg-[var(--highlight)]" to="/data-sources">{{app.t('데이터 출처 및 라이선스','Data sources & licenses')}}</RouterLink>
      </div>
    </section>
  </Transition>

  <nav class="mobile-only fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-[var(--border)] bg-[var(--card)] px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-5px_18px_rgba(15,23,42,.08)]" :aria-label="app.t('주요 메뉴','Main menu')">
    <RouterLink to="/" class="flex min-h-16 flex-col items-center justify-center gap-1 text-[.7rem] font-bold" active-class="text-[var(--link)]"><Home :size="21"/>{{app.t('홈','Home')}}</RouterLink>
    <RouterLink to="/attractions" class="flex min-h-16 flex-col items-center justify-center gap-1 text-[.7rem] font-bold" active-class="text-[var(--link)]"><MapPin :size="21"/>{{app.t('관광','Tour')}}</RouterLink>
    <RouterLink to="/festivals" class="flex min-h-16 flex-col items-center justify-center gap-1 text-[.7rem] font-bold" active-class="text-[var(--link)]"><PartyPopper :size="21"/>{{app.t('축제','Festival')}}</RouterLink>
    <RouterLink to="/boards" class="flex min-h-16 flex-col items-center justify-center gap-1 text-[.7rem] font-bold" active-class="text-[var(--link)]"><MessagesSquare :size="21"/>{{app.t('커뮤니티','Community')}}</RouterLink>
    <button class="flex min-h-16 flex-col items-center justify-center gap-1 border-0 bg-transparent text-[.7rem] font-bold text-[var(--text)]" :class="{'text-[var(--link)]':moreOpen}" :aria-expanded="moreOpen" aria-controls="mobile-more-menu" :aria-label="app.t('더보기','More')" @click="moreOpen = !moreOpen"><X v-if="moreOpen" :size="21"/><Menu v-else :size="21"/>{{app.t('더보기','More')}}</button>
  </nav>

  <Teleport to="body">
    <div v-if="pwa.iosHelpOpen.value" class="dialog-backdrop" role="presentation" @click.self="pwa.closeIosHelp">
      <section class="dialog max-w-sm" role="dialog" aria-modal="true" :aria-label="app.t('앱 설치 안내','App installation guide')">
        <div class="flex items-start justify-between gap-4">
          <div><Share class="mb-3 text-[var(--link)]" :size="28"/><h2 class="text-xl font-bold">{{app.t('홈 화면에 추가','Add to Home Screen')}}</h2></div>
          <button class="icon-btn !h-9 !w-9" :aria-label="app.t('닫기','Close')" @click="pwa.closeIosHelp"><X :size="17"/></button>
        </div>
        <p class="mt-4 leading-7 text-[var(--sub)]">{{app.t('Safari 하단의 공유 버튼을 누른 다음 “홈 화면에 추가”를 선택해 주세요.','Tap the Share button in Safari, then choose “Add to Home Screen.”')}}</p>
      </section>
    </div>
  </Teleport>
</template>
