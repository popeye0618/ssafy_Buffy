<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ExternalLink, Minus, Send, X } from '@lucide/vue'
import { useAppStore } from '../stores/app'
import ChatMessageText from './ChatMessageText.vue'
import type { ApiReference } from '../api/contracts'

type ChatMessage = { who: 'bot' | 'me'; text: string; references?: ApiReference[] }
const app = useAppStore()
const open = ref(false)
const input = ref('')
const loading = ref(false)
const error = ref('')
const log = ref<HTMLElement>()
const sessionId = crypto.randomUUID()
const greeting = () => app.t('안녕하세요. 부산 여행에 관해 무엇이든 물어보세요.', 'Hello! Ask me anything about traveling in Busan.')
const messages = ref<ChatMessage[]>([{ who: 'bot', text: greeting() }])
const suggestions = computed(() => app.lang === 'ko'
  ? ['오늘 부산에서 열리는 축제가 궁금해요', '해운대 근처 추천 장소를 알려주세요', '비 오는 날 갈 만한 곳을 추천해 주세요']
  : ['What festivals are happening in Busan today?', 'Recommend places near Haeundae', 'Where should I go on a rainy day?'])
watch(() => app.lang, () => { if (messages.value.length === 1) messages.value[0].text = greeting() })

function localReference(reference: ApiReference) {
  if (!reference.id || reference.url) return undefined
  const type = reference.type.toLowerCase()
  if (type === 'board') return `/boards/${reference.id}/posts`
  if (type === 'attraction') return `/attractions/${reference.id}`
  if (type === 'festival') return `/festivals/${reference.id}`
  return undefined
}

async function send(value = input.value) {
  const message = value.trim()
  if (!message || loading.value) return
  const history = messages.value.map(item => ({ role: item.who === 'me' ? 'user' as const : 'assistant' as const, content: item.text })).slice(-10)
  messages.value.push({ who: 'me', text: message })
  input.value = ''
  loading.value = true
  error.value = ''
  await nextTick()
  log.value?.scrollTo({ top: log.value.scrollHeight })
  try {
    const result = await app.chat(message, history, sessionId)
    messages.value.push({ who: 'bot', text: result.answer, references: result.references })
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
    nextTick(() => log.value?.scrollTo({ top: log.value!.scrollHeight }))
  }
}
</script>

<template>
  <button v-if="!open" class="chat-launcher" :aria-label="app.t('부산 관광 챗봇 열기','Open Busan travel chatbot')" @click="open = true"><img src="/brand/symbol.svg" alt=""></button>
  <section v-else class="chat-panel" :aria-label="app.t('부산 관광 안내 챗봇','Busan travel chatbot')">
    <header class="flex min-h-16 items-center gap-3 border-b border-[var(--border)] px-4">
      <span class="grid h-10 w-10 place-items-center rounded-xl bg-[var(--primary-soft)]"><img src="/brand/symbol.svg" alt="" class="h-7 w-7"></span>
      <div class="flex-1"><strong>{{app.t('부산 관광 안내','Busan Travel Guide')}}</strong><div class="text-xs text-[var(--sub)]">{{app.t('AI 여행 도우미','AI travel assistant')}}</div></div>
      <button class="icon-btn !h-9 !w-9" :aria-label="app.t('챗봇 접기','Minimize chatbot')" @click="open = false"><Minus :size="17"/></button>
      <button class="icon-btn !h-9 !w-9" :aria-label="app.t('닫기','Close')" @click="open = false"><X :size="17"/></button>
    </header>
      <div ref="log" class="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
        <div v-for="(message, index) in messages" :key="index" class="flex flex-col" :class="message.who === 'me' ? 'items-end' : 'items-start'">
          <small class="mb-1 text-[var(--sub)]">{{ message.who === 'me' ? app.t('나','Me') : app.t('챗봇','Chatbot') }}</small>
          <div class="max-w-[86%] rounded-2xl p-3 text-sm" :class="message.who === 'me' ? 'rounded-br-sm bg-[var(--primary)] text-[var(--on-primary)]' : 'rounded-bl-sm border border-[var(--border)] bg-[var(--surface)]'">
            <p v-if="message.who === 'me'" class="whitespace-pre-wrap leading-6">{{ message.text }}</p><ChatMessageText v-else :text="message.text"/>
          </div>
          <div v-if="message.references?.length" class="mt-2 grid w-[94%] gap-2">
            <template v-for="reference in message.references" :key="`${reference.type}-${reference.id}-${reference.url}`">
              <RouterLink v-if="localReference(reference)" :to="localReference(reference)!" class="chat-reference">
                <img v-if="reference.imageUrl" :src="reference.imageUrl" :alt="reference.title || ''"><span class="min-w-0"><strong>{{ reference.title || '관련 정보' }}</strong><small v-if="reference.address">{{ reference.address }}</small><em>커뮤니티 보기 →</em></span>
              </RouterLink>
              <a v-else-if="reference.url" :href="reference.url" class="chat-reference" target="_blank" rel="noopener noreferrer">
                <img v-if="reference.imageUrl" :src="reference.imageUrl" :alt="reference.title || ''"><span class="min-w-0"><strong>{{ reference.title || '외부 관련 정보' }}</strong><small v-if="reference.address">{{ reference.address }}</small><em>새 창에서 보기 <ExternalLink :size="12"/></em></span>
              </a>
            </template>
          </div>
        </div>
        <div v-if="loading" class="text-sm text-[var(--sub)]">{{app.t('여행 정보를 찾고 있어요…','Finding travel information…')}}</div>
        <p v-if="error" class="error">{{ error }}</p>
      </div>
      <div class="p-4 pt-2">
        <div v-if="messages.length === 1" class="mb-4 flex flex-wrap gap-2"><button v-for="suggestion in suggestions" :key="suggestion" class="chat-suggestion" @click="send(suggestion)">{{ suggestion }}</button></div>
        <form class="chat-composer" @submit.prevent="send()"><label class="sr-only" for="chat-input">{{app.t('메시지','Message')}}</label><input id="chat-input" v-model="input" maxlength="4000" :placeholder="app.t('부산 여행에 관해 물어보세요','Ask about traveling in Busan')"><button type="submit" :disabled="loading || !input.trim()" :aria-label="app.t('전송','Send')"><Send :size="18"/></button></form>
      </div>
  </section>
</template>
