<script setup lang="ts">
import { Home, MapPin, PartyPopper, MessagesSquare } from '@lucide/vue'
import { useAppStore } from '../stores/app'
const app=useAppStore()
</script>
<template><nav class="mobile-only fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[var(--border)] bg-[var(--card)] px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-5px_18px_rgba(15,23,42,.08)]" aria-label="주요 메뉴">
  <RouterLink to="/" class="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-bold" active-class="text-[var(--link)]"><Home :size="21"/>{{app.lang==='ko'?'홈':'Home'}}</RouterLink>
  <RouterLink to="/attractions" class="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-bold" active-class="text-[var(--link)]"><MapPin :size="21"/>{{app.lang==='ko'?'관광':'Tour'}}</RouterLink>
  <RouterLink to="/festivals" class="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-bold" active-class="text-[var(--link)]"><PartyPopper :size="21"/>{{app.lang==='ko'?'축제':'Festival'}}</RouterLink>
  <RouterLink to="/boards" class="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-bold" active-class="text-[var(--link)]"><MessagesSquare :size="21"/>{{app.lang==='ko'?'커뮤니티':'Community'}}</RouterLink>
</nav></template>
