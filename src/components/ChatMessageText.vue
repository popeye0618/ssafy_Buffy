<script setup lang="ts">
import { computed } from 'vue'

type Part = { text: string; strong: boolean }
type Line = { parts: Part[]; bullet: boolean; empty: boolean }
const props = defineProps<{ text: string }>()

function partsOf(value: string): Part[] {
  const parts: Part[] = []
  const pattern = /\*\*(.+?)\*\*/g
  let cursor = 0
  for (const match of value.matchAll(pattern)) {
    if (match.index! > cursor) parts.push({ text: value.slice(cursor, match.index), strong: false })
    parts.push({ text: match[1], strong: true })
    cursor = match.index! + match[0].length
  }
  if (cursor < value.length) parts.push({ text: value.slice(cursor), strong: false })
  return parts
}

const lines = computed<Line[]>(() => props.text.split('\n').map(raw => {
  const trimmed = raw.trim()
  const bullet = /^[-•]\s+/.test(trimmed)
  const content = bullet ? trimmed.replace(/^[-•]\s+/, '') : raw
  return { parts: partsOf(content), bullet, empty: !trimmed }
}))
</script>

<template>
  <div class="chat-answer">
    <template v-for="(line, index) in lines" :key="index">
      <div v-if="line.empty" class="h-2"></div>
      <div v-else class="chat-answer-line" :class="{ 'is-bullet': line.bullet }"><span v-if="line.bullet" class="chat-answer-dot" aria-hidden="true"></span><span><template v-for="(part, partIndex) in line.parts" :key="partIndex"><strong v-if="part.strong">{{ part.text }}</strong><template v-else>{{ part.text }}</template></template></span></div>
    </template>
  </div>
</template>

<style scoped>
.chat-answer{display:grid;line-height:1.65}.chat-answer-line{overflow-wrap:anywhere}.chat-answer-line.is-bullet{display:grid;grid-template-columns:7px 1fr;gap:7px;padding-left:2px}.chat-answer-dot{width:5px;height:5px;margin-top:.65em;border-radius:50%;background:var(--link)}.chat-answer strong{font-weight:800;color:var(--text)}
</style>
