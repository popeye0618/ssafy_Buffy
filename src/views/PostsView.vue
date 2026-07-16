<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Eye,
  Heart,
  MessageCircle,
  Search,
  PenLine,
  AlertTriangle,
} from "@lucide/vue";
import TagBadge from "../components/TagBadge.vue";
import CustomSelect from "../components/CustomSelect.vue";
import { useAppStore } from "../stores/app";
const app = useAppStore(),
  route = useRoute(),
  router = useRouter();
const boardId = computed(() => String(route.params.boardId));
const board = computed(() => app.boardById(boardId.value));
const q = ref(String(route.query.keyword || ""));
const sort = ref(String(route.query.sort || "latest"));
const tagFilter = ref(String(route.query.tagId || ""));
const page = ref(Number(route.query.page || 1));
let timer = 0;
const sortOptions = computed(() => [
  { value: "latest", label: app.t("최신순", "Latest") },
  { value: "comments", label: app.t("댓글순", "Most commented") },
  { value: "views", label: app.t("조회순", "Most viewed") },
  { value: "likes", label: app.t("추천순", "Most liked") },
]);
const tagOptions = computed(() => [
  { value: "", label: app.t("모든 태그", "All tags") },
  ...app.tags.map((t) => ({ value: String(t.id), label: app.tr(t.label) })),
]);
async function load() {
  router.replace({
    query: {
      keyword: q.value || undefined,
      sort: sort.value === "latest" ? undefined : sort.value,
      tagId: tagFilter.value || undefined,
      page: page.value > 1 ? String(page.value) : undefined,
    },
  });
  await Promise.all([
    app.loadBoard(boardId.value),
    app.loadTags(),
    app.loadPosts(boardId.value, {
      keyword: q.value || undefined,
      sort: sort.value,
      page: page.value,
      size: 10,
      tagId: tagFilter.value ? Number(tagFilter.value) : undefined,
    }),
  ]).catch(() => {});
}
onMounted(load);
watch([q, sort, tagFilter], () => {
  page.value = 1;
  clearTimeout(timer);
  timer = window.setTimeout(load, 250);
});
watch(page, load);
watch(
  () => app.latestPostEvent,
  (event) => {
    if (event && String(event.boardId) === boardId.value) load();
  },
);
</script>
<template>
  <div class="page fade">
    <nav class="mb-5 text-sm text-[var(--sub)]">
      <RouterLink class="link" to="/boards">{{
        app.t("커뮤니티", "Community")
      }}</RouterLink>
      › {{ board ? app.tr(board.name) : app.t("게시판", "Board") }}
    </nav>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-4xl font-extrabold">
          {{ board ? app.tr(board.name) : app.t("게시판", "Board") }}
        </h1>
        <p class="mt-3 text-[var(--sub)]">
          {{
            board
              ? app.tr(board.description)
              : app.t(
                  "장소 이야기를 불러오고 있습니다.",
                  "Loading local stories.",
                )
          }}
        </p>
      </div>
      <RouterLink class="btn btn-primary" :to="`/boards/${boardId}/posts/new`"
        ><PenLine :size="18" />{{ app.t("글쓰기", "New post") }}</RouterLink
      >
    </div>
    <div class="mt-7 grid gap-3 md:grid-cols-[1fr_168px_148px]">
      <label class="relative"
        ><Search
          class="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--sub)]"
          :size="18" /><input
          v-model="q"
          class="input !pl-11"
          :placeholder="app.t('게시글 검색', 'Search posts')" /></label
      ><CustomSelect
        v-model="tagFilter"
        :options="tagOptions"
        :label="app.t('태그 필터', 'Tag filter')"
      /><CustomSelect
        v-model="sort"
        :options="sortOptions"
        :label="app.t('정렬', 'Sort')"
      />
    </div>
    <div v-if="app.state.posts === 'loading'" class="mt-7 space-y-3">
      <div
        v-for="n in 5"
        :key="n"
        class="card h-24 animate-pulse bg-[var(--surface)]"
      ></div>
    </div>
    <div v-else-if="app.state.posts === 'error'" class="empty mt-7">
      <AlertTriangle class="mx-auto text-[var(--danger)]" />
      <p class="mt-3">{{ app.errors.posts }}</p>
      <button class="btn mt-4" @click="load">{{ app.t("다시 시도", "Try again") }}</button>
    </div>
    <div v-else-if="!app.postPage.items.length" class="empty mt-7">
      <h2 class="font-bold">{{ app.t("게시글이 없습니다", "No posts yet") }}</h2>
    </div>
    <div v-else class="mt-7 card overflow-hidden">
      <RouterLink
        v-for="p in app.postPage.items"
        :key="p.id"
        :to="`/boards/${p.boardId}/posts/${p.id}`"
        class="block border-b border-[var(--border)] p-5 last:border-0 hover:bg-[var(--highlight)]"
        ><h2 class="font-bold">{{ app.postTitle(p) }}</h2>
        <div class="mt-2 flex flex-wrap gap-1">
          <TagBadge v-for="t in p.tags" :key="t.id || t.label.ko" :tag="t" />
        </div>
        <div class="mt-3 flex gap-4 text-xs text-[var(--sub)]">
          <span class="metric"
            ><Eye :size="14" />{{ p.views.toLocaleString() }}</span
          ><span class="metric text-red-500"
            ><Heart :size="14" />{{ p.likes }}</span
          ><span class="metric"
            ><MessageCircle :size="14" />{{ p.comments }}</span
          ><span>{{
            p.date ? new Date(p.date).toLocaleDateString() : "-"
          }}</span>
        </div></RouterLink
      >
    </div>
    <nav
      v-if="app.postPage.total > app.postPage.size"
      class="mt-8 flex justify-center gap-3"
    >
      <button class="btn" :disabled="page <= 1" @click="page--">{{ app.t("이전", "Previous") }}</button
      ><span class="self-center text-sm font-bold"
        >{{ page }} /
        {{ Math.ceil(app.postPage.total / app.postPage.size) }}</span
      ><button
        class="btn"
        :disabled="page >= Math.ceil(app.postPage.total / app.postPage.size)"
        @click="page++"
      >
        {{ app.t("다음", "Next") }}
      </button>
    </nav>
  </div>
</template>
