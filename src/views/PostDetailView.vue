<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  LockKeyhole,
  MessageCircle,
  MessageSquareReply,
  Pencil,
  Trash2,
  X,
} from "@lucide/vue";
import TagBadge from "../components/TagBadge.vue";
import { useAppStore } from "../stores/app";
import { handoffEditPassword } from "../api/edit-session";
import type { Comment } from "../types";
const app = useAppStore(),
  route = useRoute(),
  router = useRouter();
const postId = computed(() => String(route.params.postId));
const post = computed(() => app.postById(postId.value));
const comments = computed(() => app.commentsFor(postId.value));
const loading = ref(true),
  error = ref(""),
  busy = ref(false);
const image = ref<number | null>(null);
const comment = ref(""),
  commentPassword = ref(""),
  commentError = ref("");
const replyTo = ref<string>(),
  replyText = ref(""),
  replyPassword = ref(""),
  replyError = ref("");
const postDialog = ref<"edit" | "delete" | null>(null),
  postPassword = ref(""),
  postError = ref(""),
  deleteConfirm = ref(false);
const commentDialog = ref<"edit-password" | "edit" | "delete" | null>(null),
  commentTarget = ref<Comment>(),
  actionPassword = ref(""),
  actionBody = ref(""),
  actionError = ref("");
const depth = (c: Comment) => {
  let d = 0,
    p = c;
  const seen = new Set<string>();
  while (p.parentId && !seen.has(p.id)) {
    seen.add(p.id);
    d++;
    const found = comments.value.find((x) => x.id === p.parentId);
    if (!found) break;
    p = found;
  }
  return d;
};
const parentOf = (c: Comment) =>
  comments.value.find((x) => x.id === c.parentId);
async function load() {
  loading.value = true;
  error.value = "";
  try {
    await app.loadPost(postId.value);
    await Promise.all([
      app.loadComments(postId.value),
      app.loadLike(postId.value).catch(() => undefined),
    ]);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}
onMounted(load);
watch(postId, load);
async function like() {
  if (!post.value || busy.value) return;
  busy.value = true;
  try {
    await app.toggleLike(post.value.id);
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    busy.value = false;
  }
}
async function submitComment(parentId?: string) {
  const text = parentId ? replyText.value : comment.value,
    pw = parentId ? replyPassword.value : commentPassword.value;
  if (!text.trim() || pw.length < 4) {
    (parentId ? replyError : commentError).value =
      app.t("내용과 4자 이상의 비밀번호를 입력해 주세요.", "Enter a comment and a password of at least 4 characters.");
    return;
  }
  try {
    await app.addComment(postId.value, text.trim(), pw, parentId);
    if (parentId) {
      replyText.value = "";
      replyPassword.value = "";
      replyError.value = "";
      replyTo.value = undefined;
    } else {
      comment.value = "";
      commentPassword.value = "";
      commentError.value = "";
    }
  } catch (e) {
    (parentId ? replyError : commentError).value = (e as Error).message;
  }
}
function openPost(action: "edit" | "delete") {
  postDialog.value = action;
  postPassword.value = "";
  postError.value = "";
  deleteConfirm.value = false;
}
async function authorizeEdit() {
  if (!post.value) return;
  try {
    await app.verifyPostPassword(post.value.id, postPassword.value);
    handoffEditPassword(post.value.id, postPassword.value);
    router.push(`/boards/${post.value.boardId}/posts/${post.value.id}/edit`);
  } catch (e) {
    postError.value = (e as Error).message;
  }
}
async function removePost() {
  if (!post.value) return;
  const { id, boardId } = post.value;
  try {
    await app.deletePost(id, postPassword.value);
    postDialog.value = null;
    await router.replace(`/boards/${boardId}/posts`);
  } catch (e) {
    postError.value = (e as Error).message;
  }
}
function openComment(target: Comment, action: "edit" | "delete") {
  commentTarget.value = target;
  commentDialog.value = action === "edit" ? "edit-password" : "delete";
  actionPassword.value = "";
  actionBody.value = target.body;
  actionError.value = "";
}
function nextEdit() {
  if (actionPassword.value) {
    commentDialog.value = "edit";
  } else actionError.value = app.t("비밀번호를 입력해 주세요.", "Enter your password.");
}
async function completeComment() {
  if (!commentTarget.value) return;
  try {
    if (commentDialog.value === "edit")
      await app.updateComment(
        commentTarget.value.id,
        actionBody.value.trim(),
        actionPassword.value,
      );
    else await app.deleteComment(commentTarget.value.id, actionPassword.value);
    commentDialog.value = null;
  } catch (e) {
    actionError.value = (e as Error).message;
  }
}
</script>
<template>
  <div class="page fade">
    <div
      v-if="loading"
      class="card h-[560px] animate-pulse bg-[var(--surface)]"
    ></div>
    <div v-else-if="error && !post" class="empty">
      <AlertTriangle class="mx-auto text-[var(--danger)]" />
      <h1 class="mt-3 font-bold">{{ app.t("게시글을 불러오지 못했습니다", "Unable to load the post") }}</h1>
      <p class="mt-2">{{ error }}</p>
      <button class="btn mt-4" @click="load">{{ app.t("다시 시도", "Try again") }}</button>
    </div>
    <template v-else-if="post"
      ><nav class="mb-5 text-sm text-[var(--sub)]">
        <RouterLink class="link" :to="`/boards/${post.boardId}/posts`"
          >← {{ app.t("목록으로", "Back to list") }}</RouterLink
        >
      </nav>
      <article class="card p-6 md:p-9">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="flex flex-wrap gap-1">
              <TagBadge
                v-for="t in post.tags"
                :key="t.id || t.label.ko"
                :tag="t"
              />
            </div>
            <h1 class="mt-4 text-3xl font-extrabold md:text-4xl">
              {{ app.postTitle(post) }}
            </h1>
            <p class="mt-3 text-sm text-[var(--sub)]">
              {{ app.t("익명", "Anonymous") }} {{ post.author }} ·
              {{ post.date ? new Date(post.date).toLocaleString(app.lang === "ko" ? "ko-KR" : "en-US") : "-" }}
            </p>
          </div>
          <div class="flex gap-2">
            <button class="btn" @click="openPost('edit')">
              <Pencil :size="16" />{{ app.t("수정", "Edit") }}</button
            ><button class="btn" @click="openPost('delete')">
              <Trash2 :size="16" />{{ app.t("삭제", "Delete") }}
            </button>
          </div>
        </div>
        <div class="mt-7 whitespace-pre-wrap text-lg leading-8">
          {{ app.postBody(post) }}
        </div>
        <div
          v-if="post.media.length"
          class="mt-8 flex gap-3 overflow-x-auto pb-2"
        >
          <button
            v-for="(m, i) in post.media"
            :key="m.id"
            class="w-44 shrink-0"
            @click="image = i"
          >
            <img
              :src="m.url"
              :alt="app.t('게시글 이미지', 'Post image')"
              class="h-28 w-full rounded-xl object-cover"
            />
          </button>
        </div>
        <div
          class="mt-8 flex flex-wrap items-center gap-5 border-t border-[var(--border)] pt-5 text-sm text-[var(--sub)]"
        >
          <span class="metric"
            ><Eye :size="18" />{{ app.t("조회", "Views") }} {{ post.views.toLocaleString() }}</span
          ><button
            class="metric font-bold"
            :class="post.liked ? 'text-red-500' : ''"
            :disabled="busy"
            @click="like"
          >
            <Heart
              :size="18"
              :fill="post.liked ? 'currentColor' : 'none'"
            />{{ app.t("추천", "Likes") }} {{ post.likes.toLocaleString() }}</button
          ><span class="metric"
            ><MessageCircle :size="18" />{{ app.t("댓글", "Comments") }} {{ post.comments }}</span
          >
        </div>
      </article>
      <section class="mt-8">
        <h2 class="text-2xl font-bold">{{ app.t("댓글", "Comments") }}</h2>
        <form class="card mt-4 p-5" @submit.prevent="submitComment()">
          <textarea
            v-model="comment"
            class="input !min-h-28"
            :placeholder="app.t('댓글을 입력하세요', 'Write a comment')"
          ></textarea>
          <div class="comment-submit-row mt-3">
            <div>
              <label class="comment-password"
                ><LockKeyhole :size="16" /><input
                  v-model="commentPassword"
                  type="password"
                  autocomplete="new-password"
                  :placeholder="app.t('비밀번호 4자 이상', 'Password (4+ characters)')"
              /></label>
              <p v-if="commentError" class="error">{{ commentError }}</p>
            </div>
            <button class="btn btn-primary">{{ app.t("댓글 등록", "Post comment") }}</button>
          </div>
        </form>
        <div class="mt-5 space-y-3">
          <article
            v-for="c in comments"
            :key="c.id"
            class="reply-card card p-4"
            :class="{ 'is-reply': !!c.parentId }"
            :style="{ marginLeft: `${Math.min(depth(c), 8) * 28}px` }"
          >
            <template v-if="c.deleted"
              ><p class="italic text-[var(--sub)]">
                {{ app.t("삭제된 댓글입니다.", "This comment has been deleted.") }}
              </p></template
            ><template v-else
              ><div class="flex justify-between gap-3">
                <strong>{{ app.t("익명", "Anonymous") }} {{ c.author }}</strong
                ><time class="text-xs text-[var(--sub)]">{{
                  c.date ? new Date(c.date).toLocaleString(app.lang === "ko" ? "ko-KR" : "en-US") : "-"
                }}</time>
              </div>
              <div v-if="c.parentId" class="reply-target mt-2">
                <MessageSquareReply :size="15" />{{ app.t("익명", "Anonymous") }}
                {{ parentOf(c)?.author || app.t("삭제됨", "Deleted") }}{{ app.t("에게 답글", " · Reply") }}
              </div>
              <p class="mt-2 whitespace-pre-wrap leading-7">{{ c.body }}</p>
              <div class="mt-3 flex flex-wrap gap-4">
                <button class="reply-action !mt-0" @click="replyTo = c.id">
                  <MessageSquareReply :size="16" />{{ app.t("답글", "Reply") }}</button
                ><button class="comment-action" @click="openComment(c, 'edit')">
                  <Pencil :size="14" />{{ app.t("수정", "Edit") }}</button
                ><button
                  class="comment-action text-[var(--danger)]"
                  @click="openComment(c, 'delete')"
                >
                  <Trash2 :size="14" />{{ app.t("삭제", "Delete") }}
                </button>
              </div>
              <form
                v-if="replyTo === c.id"
                class="inline-reply"
                @submit.prevent="submitComment(c.id)"
              >
                <textarea
                  v-model="replyText"
                  class="input"
                  :placeholder="app.t('답글을 입력하세요', 'Write a reply')"
                ></textarea>
                <div class="comment-submit-row mt-2">
                  <div>
                    <label class="comment-password"
                      ><LockKeyhole :size="16" /><input
                        v-model="replyPassword"
                        type="password"
                        :placeholder="app.t('비밀번호 4자 이상', 'Password (4+ characters)')"
                    /></label>
                    <p v-if="replyError" class="error">{{ replyError }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="btn"
                      @click="replyTo = undefined"
                    >
                      {{ app.t("취소", "Cancel") }}</button
                    ><button class="btn btn-primary">{{ app.t("답글 등록", "Post reply") }}</button>
                  </div>
                </div>
              </form></template
            >
          </article>
        </div>
      </section>
      <div
        v-if="image !== null"
        class="dialog-backdrop"
        role="dialog"
        aria-modal="true"
      >
        <button class="absolute right-5 top-5 icon-btn" @click="image = null">
          <X /></button
        ><button
          class="absolute left-5 icon-btn"
          @click="image = (image - 1 + post.media.length) % post.media.length"
        >
          <ChevronLeft /></button
        ><img
          :src="post.media[image].url"
          :alt="app.t('확대 이미지', 'Enlarged image')"
          class="max-h-[80vh] max-w-[80vw] rounded-2xl object-contain"
        /><button
          class="absolute right-5 icon-btn"
          @click="image = (image + 1) % post.media.length"
        >
          <ChevronRight />
        </button>
      </div>
      <div
        v-if="postDialog"
        class="dialog-backdrop"
        role="dialog"
        aria-modal="true"
      >
        <form
          class="dialog"
          @submit.prevent="
            postDialog === 'edit'
              ? authorizeEdit()
              : deleteConfirm
                ? removePost()
                : (deleteConfirm = true)
          "
        >
          <button type="button" class="float-right" @click="postDialog = null">
            <X />
          </button>
          <h2 class="text-xl font-bold">
            {{
              postDialog === "edit"
                ? app.t("비밀번호 확인", "Confirm password")
                : deleteConfirm
                  ? app.t("게시글 삭제", "Delete post")
                  : app.t("삭제 비밀번호 확인", "Confirm password to delete")
            }}
          </h2>
          <template v-if="!deleteConfirm"
            ><p class="mt-2 text-sm text-[var(--sub)]">
              {{ app.t("작성 시 설정한 비밀번호를 입력해 주세요.", "Enter the password set when the post was created.") }}
            </p>
            <input
              v-model="postPassword"
              type="password"
              class="input mt-5"
              autofocus
            />
            <p v-if="postError" class="error">{{ postError }}</p>
            <button
              class="btn mt-5 w-full"
              :class="postDialog === 'delete' ? 'btn-danger' : 'btn-primary'"
            >
              {{ postDialog === "edit" ? app.t("확인 후 수정하기", "Confirm and edit") : app.t("다음", "Next") }}
            </button></template
          ><template v-else
            ><p class="mt-3 text-[var(--sub)]">
              {{ app.t("삭제한 글은 복구할 수 없습니다.", "Deleted posts cannot be recovered.") }}
            </p>
            <p v-if="postError" class="error">{{ postError }}</p>
            <button class="btn btn-danger mt-5 w-full">{{ app.t("삭제", "Delete") }}</button></template
          >
        </form>
      </div>
      <div
        v-if="commentDialog && commentTarget"
        class="dialog-backdrop"
        role="dialog"
        aria-modal="true"
      >
        <form
          class="dialog"
          @submit.prevent="
            commentDialog === 'edit-password' ? nextEdit() : completeComment()
          "
        >
          <button
            type="button"
            class="float-right"
            @click="commentDialog = null"
          >
            <X />
          </button>
          <h2 class="text-xl font-bold">
            {{
              commentDialog === "edit-password"
                ? app.t("댓글 비밀번호 확인", "Confirm comment password")
                : commentDialog === "edit"
                  ? app.t("댓글 수정", "Edit comment")
                  : app.t("댓글 삭제", "Delete comment")
            }}
          </h2>
          <template v-if="commentDialog === 'edit-password'"
            ><input
              v-model="actionPassword"
              type="password"
              class="input mt-5"
              autofocus
              :placeholder="app.t('비밀번호', 'Password')"
            /><button class="btn btn-primary mt-5 w-full">
              {{ app.t("다음", "Next") }}
            </button></template
          ><template v-else-if="commentDialog === 'edit'">
            <textarea
              v-model="actionBody"
              class="input mt-5 !min-h-28"
            ></textarea
            ><button class="btn btn-primary mt-5 w-full">
              {{ app.t("수정 완료", "Save changes") }}
            </button></template
          ><template v-else
            ><p class="mt-4 text-[var(--sub)]">
              {{ app.t("비밀번호를 입력하면 댓글 내용이 삭제됩니다. 답글 구조는 유지됩니다.", "Entering the password will delete the comment content while preserving the reply thread.") }}
            </p>
            <input
              v-model="actionPassword"
              type="password"
              class="input mt-5"
              :placeholder="app.t('비밀번호', 'Password')"
            /><button class="btn btn-danger mt-5 w-full">
              {{ app.t("댓글 삭제", "Delete comment") }}
            </button></template
          >
          <p v-if="actionError" class="error">{{ actionError }}</p>
        </form>
      </div></template
    >
  </div>
</template>
