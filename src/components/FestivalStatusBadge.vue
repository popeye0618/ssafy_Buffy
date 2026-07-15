<script setup lang="ts">
import { computed } from 'vue'
import type { FestivalStatus } from '../types'
import { useAppStore } from '../stores/app'

const props = defineProps<{ status: FestivalStatus }>()
const app = useAppStore()
const labels = computed(() => ({
  ongoing: app.lang === 'ko' ? '진행 중' : 'Ongoing',
  upcoming: app.lang === 'ko' ? '예정' : 'Upcoming',
  ended: app.lang === 'ko' ? '종료' : 'Ended',
}))
</script>
<template><span class="status-chip" :class="`status-${status}`"><i aria-hidden="true" />{{ labels[status] }}</span></template>
