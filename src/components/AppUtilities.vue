<script setup lang="ts">
import { AArrowDown, AArrowUp, ArrowUp, Languages, Menu, Moon, Sun, X } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useAppStore } from '../stores/app'

const app = useAppStore()
const menuOpen = ref(false)
const toggleTheme = () => app.theme = app.theme === 'light' ? 'dark' : 'light'
const toggleLang = () => app.lang = app.lang === 'ko' ? 'en' : 'ko'
const font = (delta: number) => app.fontScale = Math.max(.9, Math.min(1.3, Number((app.fontScale + delta).toFixed(2))))
const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
const tools = computed(() => [
  { label: app.t('맨 위로', 'Back to top'), action: toTop, icon: ArrowUp },
  { label: app.t('글자 작게', 'Decrease text size'), action: () => font(-.05), icon: AArrowDown },
  { label: app.t('글자 크게', 'Increase text size'), action: () => font(.05), icon: AArrowUp },
  { label: app.t('영어로 전환', 'Switch to Korean'), action: toggleLang, icon: Languages, language: true },
  { label: app.t('화면 테마', 'Change theme'), action: toggleTheme, icon: Moon },
])
</script>

<template>
  <div class="mobile-utilities mobile-only fixed top-4 z-50 flex overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)]">
    <button class="utility-button gap-1 px-2" @click="toggleLang" :aria-label="app.lang === 'ko' ? '영어로 전환' : 'Switch to Korean'"><Languages :size="18" /><span class="text-xs font-extrabold">{{app.lang === 'ko' ? 'EN' : 'KO'}}</span></button>
    <button class="utility-button" @click="toggleTheme" :aria-label="app.t('화면 테마 전환','Change theme')"><Sun v-if="app.theme === 'dark'" :size="19" /><Moon v-else :size="19" /></button>
    <button class="utility-button" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen" aria-controls="mobile-menu"><X v-if="menuOpen" /><Menu v-else /></button>
  </div>

  <aside class="remote-control desktop-only" :aria-label="app.t('접근성 리모컨','Accessibility controls')">
    <button v-for="tool in tools" :key="tool.label" class="remote-button group" @click="tool.action" :aria-label="tool.label">
      <span class="remote-tooltip" role="tooltip">{{ tool.label }}</span>
      <component :is="tool.icon" :size="18" />
      <span v-if="tool.language" class="text-[10px] font-extrabold">{{app.lang === 'ko' ? 'EN' : 'KO'}}</span>
    </button>
  </aside>

  <div v-if="menuOpen" id="mobile-menu" class="fixed inset-x-4 top-16 z-50 card p-3" @click="menuOpen = false">
    <RouterLink class="block rounded-lg p-3 font-bold hover:bg-[var(--highlight)]" to="/boards">{{app.t('전체·지역별 게시판','All community boards')}}</RouterLink>
    <RouterLink class="block rounded-lg p-3 font-bold hover:bg-[var(--highlight)]" to="/about">{{app.t('서비스 소개','About')}}</RouterLink>
    <RouterLink class="block rounded-lg p-3 font-bold hover:bg-[var(--highlight)]" to="/guide">{{app.t('이용 안내','User guide')}}</RouterLink>
    <RouterLink class="block rounded-lg p-3 font-bold hover:bg-[var(--highlight)]" to="/data-sources">{{app.t('데이터 출처 및 라이선스','Data sources & licenses')}}</RouterLink>
  </div>
</template>
