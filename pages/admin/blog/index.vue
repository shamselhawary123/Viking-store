<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">{{ t("admin.content") }}</p>
        <h2 class="mt-2 text-3xl font-black">{{ t("admin.blog") }}</h2>
      </div>
      <NuxtLink to="/admin/blog/new" class="rounded-2xl bg-[#FF4D00] px-5 py-3 font-bold text-white transition hover:opacity-90">
        {{ t("admin.newPost") }}
      </NuxtLink>
    </div>

    <div class="grid gap-3 rounded-3xl border border-white/10 bg-[#111111] p-4 md:grid-cols-[1fr_12rem_14rem]">
      <input v-model="search" type="search" :placeholder="t('admin.searchBlog')" class="field" />
      <select v-model="statusFilter" class="field">
        <option value="all">{{ t("admin.allStatuses") }}</option>
        <option value="draft">{{ t("blog.draft") }}</option>
        <option value="published">{{ t("blog.published") }}</option>
      </select>
      <select v-model="categoryFilter" class="field">
        <option value="all">{{ t("admin.allCategories") }}</option>
        <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
      </select>
    </div>

    <p v-if="successMessage" class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">{{ successMessage }}</p>
    <p v-if="errorMessage" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{{ errorMessage }}</p>

    <div class="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[1040px] text-left text-sm">
          <thead class="bg-black text-gray-500">
            <tr>
              <th class="px-5 py-4">{{ t("admin.blogPost") }}</th>
              <th class="px-5 py-4">{{ t("admin.blogCategory") }}</th>
              <th class="px-5 py-4">{{ t("common.status") }}</th>
              <th class="px-5 py-4">{{ t("admin.publishedAt") }}</th>
              <th class="px-5 py-4">{{ t("common.created") }}</th>
              <th class="px-5 py-4 text-right">{{ t("common.actions") }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-for="post in visiblePosts" :key="post.id">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <img :src="post.cover_image || '/logo.png'" alt="" class="h-12 w-12 rounded-xl object-cover" loading="lazy" decoding="async" />
                  <div>
                    <p class="font-bold text-white">{{ post.title }}</p>
                    <p class="text-xs text-gray-500">{{ post.slug }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 text-gray-300">{{ post.category || "-" }}</td>
              <td class="px-5 py-4">
                <button
                  class="rounded-full border px-3 py-1 text-xs font-black capitalize transition disabled:opacity-50"
                  :class="post.status === 'published' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-yellow-400/30 bg-yellow-400/10 text-yellow-200'"
                  :disabled="savingId === post.id"
                  @click="togglePublish(post)"
                >
                  {{ t(post.status === "published" ? "blog.published" : "blog.draft") }}
                </button>
              </td>
              <td class="px-5 py-4 text-gray-400">{{ formatBlogDate(post.published_at, locale) }}</td>
              <td class="px-5 py-4 text-gray-400">{{ formatBlogDate(post.created_at, locale) }}</td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-2">
                  <NuxtLink v-if="post.status === 'published'" :to="`/blog/${post.slug}`" target="_blank" class="rounded-xl border border-white/10 px-4 py-2 font-bold transition hover:border-[#FF4D00]">
                    {{ t("admin.preview") }}
                  </NuxtLink>
                  <NuxtLink :to="`/admin/blog/${post.id}/edit`" class="rounded-xl border border-white/10 px-4 py-2 font-bold transition hover:border-[#FF4D00]">
                    {{ t("common.edit") }}
                  </NuxtLink>
                  <button class="rounded-xl border border-red-500/40 px-4 py-2 font-bold text-red-400 transition hover:bg-red-500 hover:text-white" @click="deletePost(post)">
                    {{ t("common.delete") }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-3 border-t border-white/10 p-4 md:flex-row md:items-center md:justify-between">
        <p class="text-sm text-gray-500">{{ t("admin.showingCount", { visible: visiblePosts.length, total: filteredPosts.length }) }}</p>
        <button v-if="visiblePosts.length < filteredPosts.length" class="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:border-[#FF4D00]" @click="limit += pageSize">
          {{ t("common.loadMore") }}
        </button>
      </div>

      <p v-if="loading" class="p-6 text-sm text-gray-500">{{ t("admin.loadingBlog") }}</p>
      <p v-else-if="!filteredPosts.length" class="p-6 text-sm text-gray-500">{{ t("admin.noBlogPosts") }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { filterAdminBlogPosts, formatBlogDate, type BlogPostId, type BlogPostLike } from "../../../utils/blog";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

type AdminBlogPost = BlogPostLike & {
  id: BlogPostId;
};

const supabase = useSupabase();
const { t, locale } = useI18n();
const posts = ref<AdminBlogPost[]>([]);
const loading = ref(true);
const savingId = ref<BlogPostId | null>(null);
const search = ref("");
const statusFilter = ref("all");
const categoryFilter = ref("all");
const limit = ref(12);
const pageSize = 12;
const errorMessage = ref("");
const successMessage = ref("");

const categories = computed(() =>
  Array.from(new Set(posts.value.map((post) => post.category).filter(Boolean) as string[])).sort(),
);
const filteredPosts = computed(() =>
  filterAdminBlogPosts(posts.value, {
    search: search.value,
    status: statusFilter.value,
    category: categoryFilter.value,
  }),
);
const visiblePosts = computed(() => filteredPosts.value.slice(0, limit.value));

watch([search, statusFilter, categoryFilter], () => {
  limit.value = pageSize;
});

const setMessage = (type: "success" | "error", message: string) => {
  successMessage.value = type === "success" ? message : "";
  errorMessage.value = type === "error" ? message : "";
};

const loadPosts = async () => {
  loading.value = true;
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    setMessage("error", error.message);
  } else {
    posts.value = (data || []) as AdminBlogPost[];
  }

  loading.value = false;
};

const togglePublish = async (post: AdminBlogPost) => {
  savingId.value = post.id;
  setMessage("error", "");

  const nextStatus = post.status === "published" ? "draft" : "published";
  const payload = {
    status: nextStatus,
    published_at: nextStatus === "published" ? post.published_at || new Date().toISOString() : null,
  };
  const { error } = await supabase.from("blog_posts").update(payload).eq("id", post.id);

  if (error) {
    setMessage("error", error.message);
  } else {
    post.status = nextStatus;
    post.published_at = payload.published_at;
    setMessage("success", nextStatus === "published" ? t("admin.blogPublished") : t("admin.blogUnpublished"));
  }

  savingId.value = null;
};

const deletePost = async (post: AdminBlogPost) => {
  if (!confirm(t("admin.deleteBlogConfirm", { title: post.title }))) return;

  const { error } = await supabase.from("blog_posts").delete().eq("id", post.id);
  if (error) {
    setMessage("error", error.message);
    return;
  }

  posts.value = posts.value.filter((item) => item.id !== post.id);
  setMessage("success", t("admin.blogDeleted"));
};

onMounted(loadPosts);
</script>

<style scoped>
.field {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: #000;
  padding: 0.875rem 1rem;
  color: #fff;
  outline: none;
}

.field:focus {
  border-color: #ff4d00;
}
</style>
