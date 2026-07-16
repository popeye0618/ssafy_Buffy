<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ImagePlus, Plus, Trash2, X } from "@lucide/vue";
import { useAppStore } from "../stores/app";
import type { Media, Tag } from "../types";
import { takeEditPassword } from "../api/edit-session";
const app = useAppStore(),
  route = useRoute(),
  router = useRouter();
const editing = computed(() => !!route.params.postId);
const existing = computed(() =>
  editing.value ? app.postById(String(route.params.postId)) : undefined,
);
const authorized = ref(!editing.value);
const verifiedPassword = ref("");
const title = ref(""),
  body = ref(""),
  password = ref(""),
  customTag = ref(""),
  error = ref(""),
  authError = ref("");
const saving = ref(false),
  loading = ref(true);
const selected = ref<Tag[]>([]);
const customNames = ref<string[]>([]);
const existingMedia = ref<Media[]>([]);
const files = ref<{ file: File; url: string }[]>([]);
const tagCount = computed(
  () => selected.value.length + customNames.value.length,
);
async function prepare() {
  loading.value = true;
  try {
    await app.loadTags();
    if (editing.value) {
      const id = String(route.params.postId);
      const item = await app.loadPost(id);
      title.value = app.postTitle(item);
      body.value = app.postBody(item);
      selected.value = [...item.tags];
      existingMedia.value = [...item.media];
      const handedOff = takeEditPassword(id);
      if (handedOff) {
        verifiedPassword.value = handedOff;
        authorized.value = true;
      }
    }
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}
onMounted(prepare);
onBeforeUnmount(() => files.value.forEach((x) => URL.revokeObjectURL(x.url)));
function toggle(tag: Tag) {
  const index = selected.value.findIndex((x) => x.id === tag.id);
  if (index >= 0) selected.value.splice(index, 1);
  else if (tagCount.value < 5) selected.value.push(tag);
}
function addCustomTag() {
  const value = customTag.value.trim().replace(/^#/, "").slice(0, 50);
  if (
    !value ||
    tagCount.value >= 5 ||
    customNames.value.includes(value) ||
    selected.value.some((x) => x.label.ko === value)
  )
    return;
  customNames.value.push(value);
  customTag.value = "";
}
function chooseFiles(event: Event) {
  const input = event.target as HTMLInputElement;
  for (const file of Array.from(input.files || []).slice(
    0,
    10 - existingMedia.value.length - files.value.length,
  )) {
    if (file.type.startsWith("image/"))
      files.value.push({ file, url: URL.createObjectURL(file) });
  }
  input.value = "";
}
function removeFile(target: { file: File; url: string }) {
  URL.revokeObjectURL(target.url);
  files.value = files.value.filter((x) => x !== target);
}
async function unlock() {
  authError.value = "";
  try {
    await app.verifyPostPassword(String(route.params.postId), password.value);
    verifiedPassword.value = password.value;
    password.value = "";
    authorized.value = true;
  } catch (e) {
    authError.value = (e as Error).message;
  }
}
async function submit() {
  error.value = "";
  if (title.value.trim().length < 2) {
    error.value = app.t("제목을 2자 이상 입력해 주세요.", "Enter a title of at least 2 characters.");
    return;
  }
  if (body.value.trim().length < 1) {
    error.value = app.t("본문을 입력해 주세요.", "Enter the post content.");
    return;
  }
  if (!editing.value && password.value.length < 4) {
    error.value = app.t("비밀번호를 4자 이상 입력해 주세요.", "Enter a password of at least 4 characters.");
    return;
  }
  if (!tagCount.value) {
    error.value = app.t("태그를 하나 이상 선택해 주세요.", "Select at least one tag.");
    return;
  }
  saving.value = true;
  try {
    const created = await Promise.all(
      customNames.value.map((name) => app.createTag(name)),
    );
    const media = [
      ...existingMedia.value,
      ...(await Promise.all(files.value.map((x) => app.uploadMedia(x.file)))),
    ];
    const tags = [...selected.value, ...created];
    if (editing.value) {
      const item = await app.updatePost(String(route.params.postId), {
        title: title.value.trim(),
        body: body.value.trim(),
        tags,
        media,
        password: verifiedPassword.value,
      });
      router.push(`/boards/${item.boardId}/posts/${item.id}`);
    } else {
      const item = await app.createPost({
        boardId: String(route.params.boardId),
        title: title.value.trim(),
        body: body.value.trim(),
        tags,
        media,
        password: password.value,
      });
      router.push(`/boards/${item.boardId}/posts/${item.id}`);
    }
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    saving.value = false;
  }
}
</script>
<template>
  <div class="page fade">
    <nav class="mb-5 text-sm text-[var(--sub)]">
      <RouterLink class="link" to="/boards">{{ app.t("커뮤니티", "Community") }}</RouterLink> ›
      {{ editing ? app.t("게시글 수정", "Edit post") : app.t("새 글 작성", "New post") }}
    </nav>
    <h1 class="text-4xl font-extrabold">
      {{ editing ? app.t("게시글 수정", "Edit post") : app.t("새 글 작성", "New post") }}
    </h1>
    <div
      v-if="loading"
      class="card mt-8 h-96 animate-pulse bg-[var(--surface)]"
    ></div>
    <form
      v-else-if="authorized"
      class="mt-8 space-y-7"
      @submit.prevent="submit"
    >
      <div>
        <label class="label" for="title">{{ app.t("제목", "Title") }}</label
        ><input
          id="title"
          v-model="title"
          class="input"
          maxlength="200"
          :placeholder="app.t('제목을 입력하세요', 'Enter a title')"
        />
        <p class="hint text-right">{{ title.length }} / 200</p>
      </div>
      <div>
        <label class="label" for="body">{{ app.t("본문", "Content") }}</label
        ><textarea
          id="body"
          v-model="body"
          class="input !min-h-56"
          :placeholder="app.t('다른 여행자에게 도움이 되는 정보를 나눠주세요', 'Share helpful information with other travelers')"
        ></textarea>
      </div>
      <div v-if="!editing">
        <label class="label" for="password">{{ app.t("게시글 비밀번호", "Post password") }}</label
        ><input
          id="password"
          v-model="password"
          type="password"
          class="input max-w-xl"
          autocomplete="new-password"
          :placeholder="app.t('4자 이상 입력', 'At least 4 characters')"
        />
      </div>
      <fieldset>
        <legend class="label">{{ app.t("태그", "Tags") }}</legend>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in app.tags"
            :key="tag.id"
            type="button"
            class="btn !min-h-10 !rounded-full !px-3"
            :class="selected.some((x) => x.id === tag.id) ? 'btn-soft' : ''"
            @click="toggle(tag)"
          >
            {{ app.tr(tag.label) }}
          </button>
        </div>
        <div v-if="customNames.length" class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="tag in customNames"
            :key="tag"
            class="tag tag-review gap-1"
            >#{{ tag
            }}<button
              type="button"
              @click="customNames = customNames.filter((x) => x !== tag)"
            >
              <X :size="14" /></button
          ></span>
        </div>
        <div class="mt-3 grid max-w-md grid-cols-[minmax(0,1fr)_96px] gap-2">
          <input
            v-model="customTag"
            class="input min-w-0"
            maxlength="50"
            :placeholder="app.t('직접 태그 입력', 'Enter a custom tag')"
            @keydown.enter.prevent="addCustomTag"
          /><button
            type="button"
            class="btn h-[46px] w-full !px-3"
            :disabled="tagCount >= 5"
            @click="addCustomTag"
          >
            <Plus :size="17" />{{ app.t("추가", "Add") }}
          </button>
        </div>
        <p class="hint">
          {{ app.t("기본·직접 입력 태그를 합해 최대 5개까지 선택할 수 있습니다.", "Select up to 5 default or custom tags.") }} ({{ tagCount }}/5)
        </p>
      </fieldset>
      <div>
        <div class="flex items-center justify-between">
          <div>
            <h2 class="label">{{ app.t("이미지", "Images") }}</h2>
            <p class="hint">{{ app.t("최대 10장까지 업로드할 수 있습니다.", "Upload up to 10 images.") }}</p>
          </div>
          <label
            class="btn"
            :class="{
              'pointer-events-none opacity-50':
                existingMedia.length + files.length >= 10,
            }"
            ><ImagePlus :size="18" />{{ app.t("이미지 선택", "Choose images") }}<input
              type="file"
              accept="image/*"
              multiple
              class="sr-only"
              @change="chooseFiles"
          /></label>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
          <div v-for="m in existingMedia" :key="m.id" class="relative">
            <img
              :src="m.url"
              :alt="app.t('업로드 이미지', 'Uploaded image')"
              class="h-28 w-full rounded-xl object-cover"
            /><button
              type="button"
              class="absolute right-2 top-2 rounded-md bg-[var(--card)] p-1"
              @click="
                existingMedia = existingMedia.filter((x) => x.id !== m.id)
              "
            >
              <Trash2 :size="16" />
            </button>
          </div>
          <div v-for="f in files" :key="f.url" class="relative">
            <img
              :src="f.url"
              :alt="f.file.name"
              class="h-28 w-full rounded-xl object-cover"
            /><button
              type="button"
              class="absolute right-2 top-2 rounded-md bg-[var(--card)] p-1"
              @click="removeFile(f)"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
      </div>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <div class="editor-actions">
        <button class="btn btn-primary" :disabled="saving">
          {{ saving ? app.t("저장 중…", "Saving…") : editing ? app.t("수정 완료", "Save changes") : app.t("등록하기", "Publish") }}</button
        ><button type="button" class="btn" @click="router.back()">{{ app.t("취소", "Cancel") }}</button>
      </div>
    </form>
    <div
      v-if="editing && !authorized && !loading"
      class="dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-auth-title"
    >
      <form class="dialog" @submit.prevent="unlock">
        <button type="button" class="float-right" @click="router.back()">
          <X />
        </button>
        <h2 id="edit-auth-title" class="text-xl font-bold">{{ app.t("비밀번호 확인", "Confirm password") }}</h2>
        <p class="mt-2 text-sm text-[var(--sub)]">
          {{ app.t("게시글 작성 시 설정한 비밀번호를 입력해 주세요.", "Enter the password set when the post was created.") }}
        </p>
        <input
          v-model="password"
          type="password"
          class="input mt-5"
          autofocus
        />
        <p v-if="authError" class="error">{{ authError }}</p>
        <button class="btn btn-primary mt-5 w-full">{{ app.t("확인 후 수정하기", "Confirm and edit") }}</button>
      </form>
    </div>
  </div>
</template>
