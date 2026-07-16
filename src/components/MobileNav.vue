<script setup lang="ts">
import { Home, Languages, MapPin, Menu, MessagesSquare, Moon, PartyPopper, Sun, X } from '@lucide/vue'
import { ref } from 'vue'
import { useAppStore } from '../stores/app'

const app = useAppStore()
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
</template>
