<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { AlertTriangle } from '@lucide/vue'
import { useAppStore } from '../stores/app'
import TagBadge from '../components/TagBadge.vue'
import FestivalStatusBadge from '../components/FestivalStatusBadge.vue'
import StructuredInfoText from '../components/StructuredInfoText.vue'

const props = defineProps<{ type: 'attraction' | 'festival'; id: string }>()
const app = useAppStore()
const loading = ref(true)
const error = ref('')
const item = computed(() => props.type === 'attraction' ? app.attractions.find(x => x.id === props.id) : app.festivals.find(x => x.id === props.id))
const related = computed(() => props.type === 'attraction' ? app.attractions.filter(x => x.id !== props.id).slice(0, 2) : app.festivals.filter(x => x.id !== props.id).slice(0, 2))

async function load() {
  loading.value = true
  error.value = ''
  try {
    props.type === 'attraction' ? await app.loadAttraction(props.id) : await app.loadFestival(props.id)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.id, load)
</script>

<template>
  <div class="page fade">
    <div v-if="loading" class="card h-[520px] animate-pulse bg-[var(--surface)]"></div>
    <div v-else-if="error" class="empty"><AlertTriangle class="mx-auto text-[var(--danger)]"/><h1 class="mt-3 text-xl font-bold">{{app.t('정보를 불러오지 못했습니다','Unable to load information')}}</h1><p class="mt-2 text-[var(--sub)]">{{ error }}</p><button class="btn mt-4" @click="load">{{app.t('다시 시도','Try again')}}</button></div>
    <template v-else-if="item">
      <nav class="mb-5 text-sm text-[var(--sub)]"><RouterLink class="link" to="/">{{app.t('홈','Home')}}</RouterLink> › <RouterLink class="link" :to="type === 'attraction' ? '/attractions' : '/festivals'">{{ type === 'attraction' ? app.t('관광지','Attractions') : app.t('축제','Festivals') }}</RouterLink> › {{ app.tr(item.name) }}</nav>
      <RouterLink class="btn mb-5" :to="type === 'attraction' ? '/attractions' : '/festivals'">← {{app.t('뒤로','Back')}}</RouterLink>
      <div class="grid gap-6 md:grid-cols-[1.55fr_1fr]">
        <div>
          <img v-if="item.image" :src="item.image" :alt="app.tr(item.name)" class="h-[390px] w-full rounded-[20px] border border-[var(--border)] object-cover"><div v-else class="placeholder h-[390px] rounded-[20px]">{{app.t('이미지 준비 중','Image coming soon')}}</div>
          <div class="mt-6">
            <h1 class="text-4xl font-extrabold">{{ app.tr(item.name) }}</h1>
            <template v-if="type === 'attraction'">
              <StructuredInfoText :text="app.tr((item as any).description)" />
              <div class="mt-4"><TagBadge v-for="tag in (item as any).tags" :key="tag.label.ko" :tag="tag"/></div>
            </template>
            <template v-else>
              <FestivalStatusBadge class="mt-4" :status="(item as any).status"/>
              <StructuredInfoText :text="app.tr((item as any).summary)" />
            </template>
          </div>
        </div>
        <aside class="space-y-4">
          <div class="card p-6">
            <h2 class="text-xl font-bold">{{app.t('기본 정보','Basic information')}}</h2>
            <dl class="mt-5 grid gap-4">
              <div><dt class="text-sm font-bold text-[var(--sub)]">{{ type === 'attraction' ? app.t('주소','Address') : app.t('기간','Dates') }}</dt><dd class="mt-1">{{ type === 'attraction' ? app.tr((item as any).address) : app.tr((item as any).period) }}</dd></div>
              <div v-if="type === 'festival'"><dt class="text-sm font-bold text-[var(--sub)]">{{app.t('장소','Venue')}}</dt><dd class="mt-1">{{ app.tr((item as any).place) }}</dd></div>
            </dl>
          </div>
          <div class="card bg-[var(--primary-soft)] p-6">
            <h2 class="text-xl font-bold">{{app.t('여행자 커뮤니티','Traveler community')}}</h2>
            <p class="mt-2 text-sm leading-6 text-[var(--sub)]">{{app.t('이 장소의 후기와 현지 팁을 익명으로 나눠보세요.','Share reviews and local tips about this place anonymously.')}}</p>
            <RouterLink v-if="item.boardId" class="btn btn-primary mt-5 w-full" :to="`/boards/${item.boardId}/posts`">{{app.t('커뮤니티 가기','Go to community')}} →</RouterLink><p v-else class="mt-4 text-sm text-[var(--danger)]">{{app.t('연결된 게시판 정보가 없습니다.','No community board is linked.')}}</p>
          </div>
        </aside>
      </div>
      <section v-if="related.length" class="section">
        <h2 class="section-title mb-4">{{app.t('함께 살펴보기','Explore more')}}</h2>
        <div class="grid gap-4 md:grid-cols-2"><RouterLink v-for="relatedItem in related" :key="relatedItem.id" :to="`/${type === 'attraction' ? 'attractions' : 'festivals'}/${relatedItem.id}`" class="card card-hover p-5"><h3 class="font-bold">{{ app.tr(relatedItem.name) }}</h3><p class="mt-2 text-sm text-[var(--sub)]">자세히 보기 →</p></RouterLink></div>
      </section>
    </template>
  </div>
</template>
