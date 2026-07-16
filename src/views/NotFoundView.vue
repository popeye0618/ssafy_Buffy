<script setup lang="ts">
import { useAppStore } from '../stores/app'
const app = useAppStore()
</script>
<template><div class="page"><div class="empty mx-auto mt-20 max-w-xl"><div class="text-6xl font-extrabold text-[var(--primary-hover)]">404</div><h1 class="mt-4 text-2xl font-bold">{{app.t('페이지를 찾을 수 없어요','Page not found')}}</h1><p class="mt-2 text-[var(--sub)]">{{app.t('주소가 올바른지 확인하거나 홈으로 돌아가 주세요.','Check the address or return to the home page.')}}</p><RouterLink class="btn btn-primary mt-6" to="/">{{app.t('홈으로 가기','Go home')}}</RouterLink></div></div></template>
