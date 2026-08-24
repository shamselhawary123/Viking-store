<template>
  <form class="space-y-6" @submit.prevent="savePost">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#CF1D1D]">{{ t(mode === "edit" ? "admin.blogEdit" : "admin.blogCreate") }}</p>
        <h2 class="mt-2 text-3xl font-black">{{ form.title || t("admin.blogPostDetails") }}</h2>
      </div>
      <div class="flex flex-wrap gap-3">
        <NuxtLink to="/admin/blog" class="rounded-2xl border border-white/10 px-5 py-3 font-bold transition hover:border-[#CF1D1D]">
          {{ t("common.cancel") }}
        </NuxtLink>
        <button type="submit" :disabled="saving" class="rounded-2xl bg-[#CF1D1D] px-5 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50">
          {{ saving ? t("admin.saving") : t("admin.savePost") }}
        </button>
      </div>
    </div>

    <p v-if="errorMessage" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
      {{ errorMessage }}
    </p>
    <p v-if="successMessage" class="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
      {{ successMessage }}
    </p>

    <div class="grid gap-6 xl:grid-cols-[1fr_0.72fr]">
      <section class="rounded-3xl border border-white/10 bg-[#171717] p-5">
        <h3 class="font-black">{{ t("admin.blogContent") }}</h3>
        <div class="mt-5 grid gap-4 md:grid-cols-2">
          <label class="block">
            <span class="field-label">{{ t("admin.blogTitle") }}</span>
            <input v-model="form.title" required class="field mt-2" />
          </label>
          <label class="block">
            <span class="field-label">{{ t("admin.blogSlug") }}</span>
            <input v-model="form.slug" required class="field mt-2" @blur="form.slug = normalizeBlogSlug(form.slug)" />
          </label>
          <label class="block md:col-span-2">
            <span class="field-label">{{ t("admin.blogExcerpt") }}</span>
            <textarea v-model="form.excerpt" rows="3" class="field mt-2" />
          </label>
          <label class="block md:col-span-2">
            <span class="field-label">{{ t("admin.blogBody") }}</span>
            <textarea v-model="form.content" required rows="16" class="field mt-2 font-mono text-sm leading-7" :placeholder="t('admin.blogBodyHint')" />
          </label>
        </div>
      </section>

      <aside class="space-y-6">
        <section class="rounded-3xl border border-white/10 bg-[#171717] p-5">
          <h3 class="font-black">{{ t("admin.publishing") }}</h3>
          <div class="mt-5 grid gap-4">
            <label class="block">
              <span class="field-label">{{ t("common.status") }}</span>
              <select v-model="form.status" class="field mt-2">
                <option value="draft">{{ t("blog.draft") }}</option>
                <option value="published">{{ t("blog.published") }}</option>
              </select>
            </label>
            <label class="block">
              <span class="field-label">{{ t("admin.publishedAt") }}</span>
              <input v-model="form.published_at" type="datetime-local" class="field mt-2" />
            </label>
            <NuxtLink v-if="savedPost?.status === 'published'" :to="`/blog/${savedPost.slug}`" target="_blank" class="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-bold transition hover:border-[#CF1D1D]">
              {{ t("admin.previewPost") }}
            </NuxtLink>
          </div>
        </section>

        <section class="rounded-3xl border border-white/10 bg-[#171717] p-5">
          <h3 class="font-black">{{ t("admin.blogMedia") }}</h3>
          <div class="mt-5 space-y-4">
            <label class="block">
              <span class="field-label">{{ t("admin.coverImage") }}</span>
              <input v-model="form.cover_image" class="field mt-2" />
            </label>
            <label class="inline-flex cursor-pointer rounded-xl border border-white/10 px-4 py-3 text-sm font-bold transition hover:border-[#CF1D1D]">
              {{ uploadingCover ? t("admin.uploading") : t("admin.uploadCoverImage") }}
              <input type="file" accept="image/*" class="hidden" :disabled="uploadingCover" @change="uploadImage($event, 'cover')" />
            </label>
            <img v-if="form.cover_image" :src="form.cover_image" alt="" class="h-44 w-full rounded-xl object-cover" loading="lazy" decoding="async" />
          </div>
        </section>

        <section class="rounded-3xl border border-white/10 bg-[#171717] p-5">
          <h3 class="font-black">{{ t("admin.metadata") }}</h3>
          <div class="mt-5 grid gap-4">
            <label class="block">
              <span class="field-label">{{ t("admin.blogCategory") }}</span>
              <input v-model="form.category" class="field mt-2" />
            </label>
            <label class="block">
              <span class="field-label">{{ t("admin.blogTags") }}</span>
              <input v-model="form.tags" class="field mt-2" :placeholder="t('admin.blogTagsHint')" />
            </label>
          </div>
        </section>

        <section class="rounded-3xl border border-white/10 bg-[#171717] p-5">
          <h3 class="font-black">{{ t("admin.seo") }}</h3>
          <div class="mt-5 grid gap-4">
            <label class="block">
              <span class="field-label">{{ t("admin.seoTitle") }}</span>
              <input v-model="form.seo_title" class="field mt-2" />
            </label>
            <label class="block">
              <span class="field-label">{{ t("admin.seoDescription") }}</span>
              <textarea v-model="form.seo_description" rows="3" class="field mt-2" />
            </label>
            <label class="block">
              <span class="field-label">{{ t("admin.ogImage") }}</span>
              <input v-model="form.og_image" class="field mt-2" />
            </label>
            <label class="inline-flex cursor-pointer rounded-xl border border-white/10 px-4 py-3 text-sm font-bold transition hover:border-[#CF1D1D]">
              {{ uploadingOg ? t("admin.uploading") : t("admin.uploadOgImage") }}
              <input type="file" accept="image/*" class="hidden" :disabled="uploadingOg" @change="uploadImage($event, 'og')" />
            </label>
          </div>
        </section>
      </aside>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  buildBlogImagePath,
  buildBlogPostPayload,
  normalizeBlogSlug,
  validateBlogPostForm,
  type BlogPostId,
  type BlogPostLike,
} from "../../utils/blog";

const props = defineProps<{
  post?: (BlogPostLike & { id?: BlogPostId }) | null;
  mode: "create" | "edit";
}>();

const supabase = useSupabase();
const router = useRouter();
const { t } = useI18n();

const validationMessageKeys: Record<string, string> = {
  "Title is required.": "admin.blogTitleRequired",
  "Slug is required.": "admin.blogSlugRequired",
  "Content is required.": "admin.blogContentRequired",
  "Status must be draft or published.": "admin.blogStatusRequired",
};
const saving = ref(false);
const uploadingCover = ref(false);
const uploadingOg = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const savedPost = ref(props.post || null);

const toDatetimeLocal = (date?: string | null) => {
  if (!date) return "";
  const parsed = new Date(date);
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const form = ref({
  title: props.post?.title || "",
  slug: props.post?.slug || "",
  excerpt: props.post?.excerpt || "",
  content: props.post?.content || "",
  cover_image: props.post?.cover_image || "",
  category: props.post?.category || "",
  tags: (props.post?.tags || []).join(", "),
  status: props.post?.status || "draft",
  published_at: toDatetimeLocal(props.post?.published_at),
  seo_title: props.post?.seo_title || "",
  seo_description: props.post?.seo_description || "",
  og_image: props.post?.og_image || "",
});

const editingId = computed(() => props.post?.id || null);

watch(
  () => form.value.title,
  (title) => {
    if (editingId.value || form.value.slug) return;
    form.value.slug = normalizeBlogSlug(title);
  },
);

const uploadImage = async (event: Event, target: "cover" | "og") => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const uploading = target === "cover" ? uploadingCover : uploadingOg;
  uploading.value = true;
  errorMessage.value = "";

  try {
    const path = buildBlogImagePath(file.name);
    const { error: uploadError } = await supabase.storage.from("products").upload(path, file);
    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(path);

    if (target === "cover") {
      form.value.cover_image = publicUrl;
    } else {
      form.value.og_image = publicUrl;
    }
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : t("admin.uploadFailed");
  } finally {
    uploading.value = false;
    input.value = "";
  }
};

const savePost = async () => {
  saving.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    form.value.slug = normalizeBlogSlug(form.value.slug);
    const validationError = validateBlogPostForm(form.value);
    if (validationError) {
      errorMessage.value = t(validationMessageKeys[validationError] || "admin.blogSaveFailed");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw userError || new Error(t("admin.loadAdminFailed"));

    const payload = buildBlogPostPayload(form.value, user.id);
    let savedId = editingId.value;

    if (savedId) {
      const { data, error } = await supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", savedId)
        .select("*")
        .single();
      if (error) throw error;
      savedPost.value = data;
    } else {
      const { data, error } = await supabase
        .from("blog_posts")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      savedId = data.id;
      savedPost.value = data;
    }

    successMessage.value = t("admin.blogSaved");
    await router.push(`/admin/blog/${savedId}/edit`);
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : t("admin.blogSaveFailed");
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.field-label {
  font-size: 0.875rem;
  font-weight: 700;
  color: #d4d4d4;
}

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
  border-color: #cf1d1d;
}
</style>
