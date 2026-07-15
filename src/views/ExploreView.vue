<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { AlertTriangle, Search } from '@lucide/vue'
import TagBadge from '../components/TagBadge.vue'
import FestivalStatusBadge from '../components/FestivalStatusBadge.vue'
import CustomSelect from '../components/CustomSelect.vue'
import StructuredInfoText from '../components/StructuredInfoText.vue'
import { useAppStore } from '../stores/app'

const props = defineProps<{ type: 'attraction' | 'festival' }>()
const app = useAppStore()
const q = ref('')
const filter = ref('all')
const page = ref(1)
const size = 12
const festivalOptions = [
  { value: 'all', label: '전체 상태' },
  { value: 'ongoing', label: '진행 중' },
  { value: 'upcoming', label: '예정' },
  { value: 'ended', label: '종료' },
]

const pageInfo = computed(() => props.type === 'attraction' ? app.attractionPage : app.festivalPage)
const totalPages = computed(() => Math.max(1, Math.ceil(pageInfo.value.total / pageInfo.value.size)))
const items = computed(() => props.type === 'attraction'
  ? app.attractions.filter(item => (app.tr(item.name) + app.tr(item.area)).toLowerCase().includes(q.value.toLowerCase()))
  : app.festivals.filter(item => (filter.value === 'all' || item.status === filter.value) && app.tr(item.name).toLowerCase().includes(q.value.toLowerCase())))

const load = () => (props.type === 'attraction'
  ? app.loadAttractions(page.value, size)
  : app.loadFestivals(page.value, size)).catch(() => {})

function move(next: number) {
  page.value = Math.min(Math.max(next, 1), totalPages.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(load)
watch(page, load)
watch(() => props.type, () => {
  page.value = 1
  q.value = ''
  filter.value = 'all'
  load()
})
</script>

<template>
  <div class="page fade">
    <nav class="mb-5 text-sm text-[var(--sub)]"><RouterLink to="/" class="link">홈</RouterLink> › {{ type === 'attraction' ? '관광지' : '축제' }}</nav>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-4xl font-extrabold">{{ type === 'attraction' ? '부산 관광지' : '부산 축제' }}</h1>
        <p class="mt-3 text-[var(--sub)]">{{ type === 'attraction' ? '부산의 다양한 장소를 살펴보세요.' : '진행 중, 예정, 종료된 축제를 확인하세요.' }}</p>
      </div>
      <span class="rounded-full bg-[var(--primary-soft)] px-4 py-2 text-sm font-bold text-[var(--link)]">전체 {{ pageInfo.total.toLocaleString() }}개</span>
    </div>

    <div class="mt-8 flex flex-col gap-3 md:flex-row">
      <label class="relative flex-1"><span class="sr-only">검색</span><Search class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--sub)]" :size="18"/><input v-model="q" class="input !pl-11" placeholder="현재 페이지에서 이름으로 검색"></label>
      <CustomSelect v-if="type === 'festival'" v-model="filter" class="md:w-44" label="축제 상태" :options="festivalOptions" />
    </div>

    <div v-if="app.state[type + 's'] === 'loading'" class="grid-cards mt-8"><div v-for="n in 6" :key="n" class="card h-72 animate-pulse bg-[var(--surface)]"></div></div>
    <div v-else-if="app.state[type + 's'] === 'error'" class="empty mt-8"><AlertTriangle class="mx-auto text-[var(--danger)]"/><h2 class="mt-3 text-lg font-bold">정보를 불러오지 못했습니다</h2><p class="mt-2 text-[var(--sub)]">{{ app.errors[type + 's'] }}</p><button class="btn mt-4" @click="load">다시 시도</button></div>
    <div v-else-if="!items.length" class="empty mt-8"><Search class="mx-auto text-[var(--sub)]"/><h2 class="mt-3 font-bold">검색 결과가 없습니다</h2></div>
    <div v-else class="grid-cards mt-8">
      <RouterLink v-for="item in items" :key="item.id" :to="`/${type === 'attraction' ? 'attractions' : 'festivals'}/${item.id}`" class="card card-hover overflow-hidden">
        <img v-if="item.image" :src="item.image" :alt="app.tr(item.name)" class="h-[170px] w-full object-cover"><div v-else class="placeholder h-[170px]">이미지 준비 중</div>
        <div class="p-5">
          <template v-if="type === 'attraction'"><h2 class="text-lg font-bold">{{ app.tr((item as any).name) }}</h2><p class="mt-2 text-sm text-[var(--sub)]">{{ app.tr((item as any).area) }}</p><StructuredInfoText compact :text="app.tr((item as any).description)"/><div class="mt-3"><TagBadge v-for="tag in (item as any).tags" :key="tag.label.ko" :tag="tag"/></div></template>
          <template v-else><FestivalStatusBadge :status="(item as any).status"/><h2 class="mt-3 text-lg font-bold">{{ app.tr((item as any).name) }}</h2><p class="mt-2 text-sm text-[var(--sub)]">{{ app.tr((item as any).place) }} · {{ app.tr((item as any).period) }}</p></template>
        </div>
      </RouterLink>
    </div>

    <nav v-if="pageInfo.total > size" class="mt-8 flex items-center justify-center gap-3" aria-label="목록 페이지">
      <button class="btn" :disabled="page <= 1" @click="move(page - 1)">이전</button>
      <span class="text-sm font-bold">{{ page }} / {{ totalPages }}</span>
      <button class="btn" :disabled="page >= totalPages" @click="move(page + 1)">다음</button>
    </nav>
  </div>
</template>
