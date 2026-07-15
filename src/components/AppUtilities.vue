<script setup lang="ts">
import { AArrowDown, AArrowUp, ArrowUp, Languages, Menu, Moon, Sun, X } from '@lucide/vue'
import { ref } from 'vue'
import { useAppStore } from '../stores/app'

const app = useAppStore()
const menuOpen = ref(false)
const toggleTheme = () => app.theme = app.theme === 'light' ? 'dark' : 'light'
const toggleLang = () => app.lang = app.lang === 'ko' ? 'en' : 'ko'
const font = (delta: number) => app.fontScale = Math.max(.9, Math.min(1.3, Number((app.fontScale + delta).toFixed(2))))
const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
const tools = [
  { label: '맨 위로', action: toTop, icon: ArrowUp },
  { label: '글자 작게', action: () => font(-.05), icon: AArrowDown },
  { label: '글자 크게', action: () => font(.05), icon: AArrowUp },
  { label: '언어 전환', action: toggleLang, icon: Languages },
  { label: '화면 테마', action: toggleTheme, icon: Moon },
]
</script>

<template>
  <div class="mobile-utilities mobile-only fixed top-4 z-50 flex overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)]">
    <button class="utility-button" @click="toggleLang" :aria-label="app.lang === 'ko' ? '영어로 전환' : '한국어로 전환'"><Languages :size="19" /></button>
    <button class="utility-button" @click="toggleTheme" aria-label="화면 테마 전환"><Sun v-if="app.theme === 'dark'" :size="19" /><Moon v-else :size="19" /></button>
    <button class="utility-button" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen" aria-controls="mobile-menu"><X v-if="menuOpen" /><Menu v-else /></button>
  </div>

  <aside class="remote-control desktop-only" aria-label="접근성 리모컨">
    <button v-for="tool in tools" :key="tool.label" class="remote-button group" @click="tool.action" :aria-label="tool.label">
      <span class="remote-tooltip" role="tooltip">{{ tool.label }}</span>
      <component :is="tool.icon" :size="18" />
    </button>
  </aside>

  <div v-if="menuOpen" id="mobile-menu" class="fixed inset-x-4 top-16 z-50 card p-3" @click="menuOpen = false">
    <RouterLink class="block rounded-lg p-3 font-bold hover:bg-[var(--highlight)]" to="/boards">전체·지역별 게시판</RouterLink>
    <RouterLink class="block rounded-lg p-3 font-bold hover:bg-[var(--highlight)]" to="/about">서비스 소개</RouterLink>
    <RouterLink class="block rounded-lg p-3 font-bold hover:bg-[var(--highlight)]" to="/guide">이용 안내</RouterLink>
    <RouterLink class="block rounded-lg p-3 font-bold hover:bg-[var(--highlight)]" to="/data-sources">데이터 출처 및 라이선스</RouterLink>
  </div>
</template>
