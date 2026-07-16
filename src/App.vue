<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { Home } from '@lucide/vue'
import AppUtilities from './components/AppUtilities.vue'
import MobileNav from './components/MobileNav.vue'
import ChatBot from './components/ChatBot.vue'
import { useAppStore } from './stores/app'

const app = useAppStore()
const route = useRoute()
</script>

<template>
  <div :data-theme="app.theme" :style="{ fontSize: `${16 * app.fontScale}px` }" class="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-lg focus:bg-[var(--primary)] focus:p-3">{{app.t('본문 바로가기','Skip to content')}}</a>
    <AppUtilities/>
    <main id="main-content" tabindex="-1">
      <div v-if="route.path !== '/'" class="page-home-wrap"><RouterLink to="/" class="home-shortcut"><Home :size="18"/><span>{{app.t('홈','Home')}}</span></RouterLink></div>
      <RouterView v-slot="{ Component }"><Transition name="fade" mode="out-in"><component :is="Component"/></Transition></RouterView>
    </main>
    <MobileNav/><ChatBot/>
  </div>
</template>
