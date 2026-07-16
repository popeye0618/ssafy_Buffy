<script setup lang="ts">
import { AArrowDown, AArrowUp, ArrowUp, Languages, Moon } from '@lucide/vue'
import { computed } from 'vue'
import { useAppStore } from '../stores/app'

const app = useAppStore()
const toggleTheme = () => app.theme = app.theme === 'light' ? 'dark' : 'light'
const toggleLang = () => app.lang = app.lang === 'ko' ? 'en' : 'ko'
const font = (delta: number) => app.fontScale = Math.max(.9, Math.min(1.3, Number((app.fontScale + delta).toFixed(2))))
const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
const tools = computed(() => [
  { label: app.t('맨 위로', 'Back to top'), action: toTop, icon: ArrowUp },
  { label: app.t('글자 작게', 'Decrease text size'), action: () => font(-.05), icon: AArrowDown },
  { label: app.t('글자 크게', 'Increase text size'), action: () => font(.05), icon: AArrowUp },
  { label: app.t('언어 전환', 'Switch language'), action: toggleLang, icon: Languages },
  { label: app.t('화면 테마 전환', 'Change theme'), action: toggleTheme, icon: Moon },
])
</script>

<template>
  <aside class="remote-control desktop-only" :aria-label="app.t('접근성 리모컨','Accessibility controls')">
    <button v-for="tool in tools" :key="tool.label" class="remote-button group" @click="tool.action" :aria-label="tool.label">
      <span class="remote-tooltip" role="tooltip">{{ tool.label }}</span>
      <component :is="tool.icon" :size="18" />
    </button>
  </aside>
</template>
