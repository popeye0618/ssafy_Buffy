<script lang="ts">
export type InfoPart = { label?: string; value: string; note?: boolean }

function formatCompactDate(value: string) {
  return value.replace(/\b(\d{4})(\d{2})(\d{2})\b/g, '$1. $2. $3.')
}

export function parseStructuredInfo(text: string): InfoPart[] {
  const attractionSentence = text.trim().match(/^(.+?)\s+is\s+a\s+Busan\s+attraction\s+located\s+at\s+(.+?)(?:\.\s*(.*))?$/i)
  if (attractionSentence) {
    const [, , address, remainder] = attractionSentence
    return [
      { label: 'Type', value: 'Busan attraction' },
      { label: 'Address', value: address.trim() },
      ...(remainder ? [{ label: 'Details', value: remainder.trim() }] : []),
    ]
  }
  return text
    .replace(/\s*※\s*/g, ' | ※ ')
    .split('|')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      if (part.startsWith('※')) return { value: part.replace(/^※\s*/, ''), note: true }
      const separator = part.indexOf(':')
      if (separator <= 0) return { value: formatCompactDate(part) }
      return {
        label: part.slice(0, separator).trim(),
        value: formatCompactDate(part.slice(separator + 1).trim()),
      }
    })
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ text: string; compact?: boolean }>(), { compact: false })
const parts = computed(() => parseStructuredInfo(props.text || ''))
const visible = computed(() => props.compact ? parts.value.filter(part => !part.note).slice(0, 2) : parts.value)
const structured = computed(() => parts.value.length > 1 || parts.value.some(part => part.label || part.note))
</script>

<template>
  <div v-if="structured" class="info-text" :class="{ 'info-text-compact': compact }">
    <template v-for="(part, index) in visible" :key="`${part.label}-${index}`">
      <p v-if="part.note" class="info-note"><span aria-hidden="true">※</span>{{ part.value }}</p>
      <div v-else class="info-row">
        <span v-if="part.label" class="info-label">{{ part.label }}</span>
        <span class="info-value">{{ part.value }}</span>
      </div>
    </template>
  </div>
  <p v-else class="leading-8 text-[var(--sub)]">{{ text }}</p>
</template>

<style scoped>
.info-text{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:16px}.info-row{display:grid;gap:5px;min-width:0;border:1px solid var(--border);border-radius:12px;background:var(--surface);padding:12px 14px}.info-label{color:var(--link);font-size:.78rem;font-weight:800}.info-value{overflow-wrap:anywhere;color:var(--text);font-size:.94rem;line-height:1.6}.info-note{grid-column:1/-1;display:flex;gap:7px;margin:2px 0 0;border-radius:10px;background:var(--primary-soft);padding:11px 13px;color:var(--sub);font-size:.85rem;line-height:1.6}.info-note span{color:var(--link);font-weight:900}.info-text-compact{display:grid;grid-template-columns:1fr;gap:6px;margin-top:10px}.info-text-compact .info-row{display:flex;gap:7px;border:0;background:transparent;padding:0}.info-text-compact .info-label{flex:none}.info-text-compact .info-value{display:-webkit-box;overflow:hidden;color:var(--sub);font-size:.82rem;line-height:1.55;-webkit-box-orient:vertical;-webkit-line-clamp:1}
@media(max-width:640px){.info-text{grid-template-columns:1fr}.info-note{grid-column:auto}}
</style>
