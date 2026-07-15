<script setup lang="ts">
import type { Tag } from '../types'
import { useAppStore } from '../stores/app'
defineProps<{tag:Tag}>(); const app=useAppStore()
</script>
<template><span class="tag" :class="`tag-${tag.kind}`">{{ app.tr(tag.label) }}</span></template>
