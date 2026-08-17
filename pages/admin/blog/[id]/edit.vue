<template>
  <section>
    <p v-if="loading" class="text-sm font-semibold text-gray-400">
      {{ t("common.loading") }}
    </p>

    <p v-else-if="errorMessage" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-200">
      {{ errorMessage }}
    </p>

    <SharedBlogPostForm v-else-if="post" :post="post" mode="edit" />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { normalizeBlogRouteId, type BlogPostId, type BlogPostLike } from "../../../../utils/blog";

definePageMeta({ layout: "admin", middleware: ["admin"] });

type AdminBlogPost = BlogPostLike & { id: BlogPostId };

const route = useRoute();
const supabase = useSupabase();
const { t } = useI18n();

const post = ref<AdminBlogPost | null>(null);
const loading = ref(true);
const errorMessage = ref("");

onMounted(async () => {
  const id = normalizeBlogRouteId(route.params.id);

  if (!id) {
    errorMessage.value = t("admin.blogNotFound");
    loading.value = false;
    return;
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    errorMessage.value = error?.message || t("admin.blogNotFound");
  } else {
    post.value = data as AdminBlogPost;
  }

  loading.value = false;
});
</script>
