<script setup lang="ts">
import { AArrowDown, AArrowUp, ArrowUp, Languages, Menu, Moon, X } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'

const app = useAppStore()
const route = useRoute()
const menuOpen = ref(false)
const toggleTheme = () => app.theme = app.theme === 'light' ? 'dark' : 'light'
const toggleLang = () => app.lang = app.lang === 'ko' ? 'en' : 'ko'
const font = (delta: number) => app.fontScale = Math.max(.9, Math.min(1.3, Number((app.fontScale + delta).toFixed(2))))
const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
const closeMenu = () => { menuOpen.value = false }
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') closeMenu()
}

watch(() => route.fullPath, closeMenu)
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

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
    <button
      class="remote-button group"
      :class="{ 'is-active': menuOpen }"
      :aria-label="app.t('안내 메뉴', 'Information menu')"
      :aria-expanded="menuOpen"
      aria-controls="desktop-info-menu"
      @click="menuOpen = !menuOpen"
    >
      <span class="remote-tooltip" role="tooltip">{{ app.t('안내 메뉴', 'Information menu') }}</span>
      <X v-if="menuOpen" :size="18" />
      <Menu v-else :size="18" />
    </button>

    <Transition name="select-pop">
      <nav v-if="menuOpen" id="desktop-info-menu" class="remote-info-menu" :aria-label="app.t('서비스 안내 메뉴', 'Service information menu')">
        <RouterLink to="/about">{{ app.t('서비스 안내', 'About') }}</RouterLink>
        <RouterLink to="/guide">{{ app.t('이용 안내', 'User guide') }}</RouterLink>
        <RouterLink to="/data-sources">{{ app.t('라이선스', 'Data sources & licenses') }}</RouterLink>
      </nav>
    </Transition>
  </aside>
</template>
