<script setup lang="ts">
import { Check, ChevronDown } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type Option = { value: string; label: string }
const props = defineProps<{ modelValue: string; options: Option[]; label: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const open = ref(false)
const root = ref<HTMLElement>()
const selected = computed(() => props.options.find(option => option.value === props.modelValue) || props.options[0])
function choose(value: string) { emit('update:modelValue', value); open.value = false }
function outside(event: MouseEvent) { if (!root.value?.contains(event.target as Node)) open.value = false }
onMounted(() => document.addEventListener('click', outside))
onBeforeUnmount(() => document.removeEventListener('click', outside))
</script>

<template>
  <div ref="root" class="custom-select">
    <button type="button" class="custom-select-trigger" :aria-label="label" :aria-expanded="open" @click="open = !open">
      <span>{{ selected.label }}</span><ChevronDown :size="17" :class="{ 'rotate-180': open }" />
    </button>
    <Transition name="select-pop">
      <div v-if="open" class="custom-select-menu" role="listbox" :aria-label="label">
        <button v-for="option in options" :key="option.value" type="button" role="option" :aria-selected="option.value === modelValue" @click="choose(option.value)">
          <span>{{ option.label }}</span><Check v-if="option.value === modelValue" :size="16" />
        </button>
      </div>
    </Transition>
  </div>
</template>
