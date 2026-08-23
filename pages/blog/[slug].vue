<template>
  <article v-if="post" class="section-premium">
    <div class="container-premium">
      <nav class="mb-8 flex flex-wrap items-center gap-2 text-sm text-neutral-500" :aria-label="t('blog.breadcrumbs')">
        <NuxtLink to="/" class="premium-link">{{ t("nav.home") }}</NuxtLink>
        <Icon name="i-heroicons-chevron-right" class="text-xs" />
        <NuxtLink to="/blog" class="premium-link">{{ t("blog.blog") }}</NuxtLink>
        <Icon name="i-heroicons-chevron-right" class="text-xs" />
        <span class="text-white">{{ post.title }}</span>
      </nav>

      <header class="mx-auto max-w-5xl text-center">
        <p class="eyebrow">{{ post.category || t("blog.editorial") }}</p>
        <h1 class="mt-4 text-5xl font-black leading-tight text-white md:text-7xl">{{ post.title }}</h1>
        <p v-if="post.excerpt" class="mx-auto mt-6 max-w-3xl text-lg leading-8 text-neutral-400">{{ post.excerpt }}</p>
        <div class="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-neutral-500">
          <span v-if="authorName">{{ authorName }}</span>
          <span v-if="authorName">•</span>
          <span>{{ formatBlogDate(post.published_at, locale) }}</span>
          <span>•</span>
          <span>{{ t("blog.readingTime", { count: readingTime }) }}</span>
        </div>
      </header>

      <div class="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-black">
        <img
          :src="post.cover_image || '/train-hard.png'"
          :alt="post.title"
          width="1280"
          height="720"
          class="h-[320px] w-full object-cover md:h-[560px]"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
      </div>

      <div class="mx-auto mt-12 grid max-w-6xl gap-10 lg:grid-cols-[1fr_16rem]">
        <div class="min-w-0">
          <div class="blog-content rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-8" v-html="renderedContent" />

          <div v-if="post.tags?.length" class="mt-8 flex flex-wrap gap-2">
            <span v-for="tag in post.tags" :key="tag" class="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-bold text-neutral-300">
              #{{ tag }}
            </span>
          </div>

          <section class="mt-10 rounded-2xl border border-[#FF4D00]/30 bg-[#FF4D00]/10 p-6">
            <p class="eyebrow">{{ t("blog.storeCtaEyebrow") }}</p>
            <h2 class="mt-3 text-3xl font-black text-white">{{ t("blog.storeCtaTitle") }}</h2>
            <p class="mt-3 leading-7 text-neutral-300">{{ t("blog.storeCtaText") }}</p>
            <NuxtLink :to="blogCategoryShopUrl" class="premium-button premium-button-primary mt-6">
              {{ t("blog.storeCtaButton") }}
              <Icon name="i-heroicons-arrow-right" />
            </NuxtLink>
          </section>
        </div>

        <aside class="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <NuxtLink to="/blog" class="premium-button premium-button-secondary w-full justify-center">
            <Icon name="i-heroicons-arrow-left" />
            {{ t("blog.backToBlog") }}
          </NuxtLink>
          <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 class="font-black text-white">{{ t("blog.articleInfo") }}</h2>
            <dl class="mt-4 space-y-3 text-sm">
              <div>
                <dt class="text-neutral-500">{{ t("blog.category") }}</dt>
                <dd class="mt-1 font-bold text-white">{{ post.category || t("blog.editorial") }}</dd>
              </div>
              <div>
                <dt class="text-neutral-500">{{ t("blog.published") }}</dt>
                <dd class="mt-1 font-bold text-white">{{ formatBlogDate(post.published_at, locale) }}</dd>
              </div>
              <div>
                <dt class="text-neutral-500">{{ t("blog.readTime") }}</dt>
                <dd class="mt-1 font-bold text-white">{{ t("blog.readingTime", { count: readingTime }) }}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <section v-if="relatedPosts.length" class="mt-20">
        <div class="mb-8 flex items-end justify-between gap-4">
          <div>
            <p class="eyebrow">{{ t("blog.keepReading") }}</p>
            <h2 class="mt-3 text-4xl font-black text-white">{{ t("blog.relatedArticles") }}</h2>
          </div>
          <NuxtLink to="/blog" class="premium-link">{{ t("blog.viewAllArticles") }}</NuxtLink>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <article v-for="item in relatedPosts" :key="item.id" class="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
            <NuxtLink :to="`/blog/${item.slug}`" class="block overflow-hidden bg-black">
              <img :src="item.cover_image || '/train-hard.png'" :alt="item.title" width="420" height="260" class="h-48 w-full object-cover transition duration-700 hover:scale-105" loading="lazy" decoding="async" />
            </NuxtLink>
            <div class="p-5">
              <p class="text-xs font-black uppercase tracking-[0.18em] text-[#FF4D00]">{{ item.category || t("blog.editorial") }}</p>
              <NuxtLink :to="`/blog/${item.slug}`" class="mt-2 block text-xl font-black leading-tight text-white transition hover:text-[#FF4D00]">
                {{ item.title }}
              </NuxtLink>
            </div>
          </article>
        </div>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import { createClient } from "@supabase/supabase-js";
import { computed } from "vue";
import {
  buildBlogCanonicalUrl,
  buildBlogSeoMeta,
  buildBlogStructuredData,
  calculateReadingTime,
  formatBlogDate,
  renderSafeBlogContent,
  type BlogPostLike,
} from "../../utils/blog";
import { createPublicSupabaseReadOptions } from "../../utils/publicSupabase";
import {
  buildShopCategoryUrl,
  getCategorySeoIntent,
  normalizeSiteUrl,
} from "../../utils/seo";

type BlogPostRow = BlogPostLike & {
  id: number;
  author_id?: string | null;
};

const route = useRoute();
const { t, locale } = useI18n();
const config = useRuntimeConfig();
const siteUrl = normalizeSiteUrl(String(config.public.siteUrl || ""));
const slug = String(route.params.slug || "");
const supabase = createClient(
  config.public.supabaseUrl as string,
  config.public.supabaseKey as string,
  createPublicSupabaseReadOptions("viking-store-blog-detail-readonly"),
);

const { data: post } = await useAsyncData(`blog-post-${slug}`, async () => {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,content,cover_image,category,tags,author_id,published_at,created_at,updated_at,seo_title,seo_description,og_image")
    .eq("slug", slug)
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .single();

  if (error) return null;
  return data as BlogPostRow;
});

if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Blog post not found",
  });
}

const { data: relatedPostsData } = await useAsyncData(`blog-related-${slug}`, async () => {
  if (!post.value?.category) return [];

  const { data } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,cover_image,category,published_at")
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .eq("category", post.value.category)
    .neq("id", post.value.id)
    .order("published_at", { ascending: false })
    .limit(3);

  return (data || []) as BlogPostRow[];
});

const { data: authorData } = await useAsyncData(`blog-author-${post.value.author_id || "none"}`, async () => {
  if (!post.value?.author_id) return null;

  const { data } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", post.value.author_id)
    .single();

  return data as { full_name?: string | null } | null;
});

const canonicalUrl = computed(() => buildBlogCanonicalUrl(siteUrl, post.value!.slug));
const readingTime = computed(() => calculateReadingTime(post.value?.content || ""));
const renderedContent = computed(() => renderSafeBlogContent(post.value?.content || ""));
const relatedPosts = computed(() => relatedPostsData.value || []);
const authorName = computed(() => authorData.value?.full_name || "");
const blogCategoryIntent = computed(() => getCategorySeoIntent({ name: post.value?.category || "" }, locale.value));
const blogCategoryShopUrl = computed(() =>
  blogCategoryIntent.value.known ? buildShopCategoryUrl(blogCategoryIntent.value.slug) : "/shop",
);
const structuredData = computed(() =>
  buildBlogStructuredData(post.value!, canonicalUrl.value, "Viking Store", authorName.value),
);

useSeoMeta(() => buildBlogSeoMeta(post.value!, canonicalUrl.value));
useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl.value }],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify(structuredData.value.article),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify(structuredData.value.breadcrumb),
    },
  ],
}));
</script>

<style scoped>
.blog-content {
  color: #d4d4d4;
  line-height: 1.85;
}

.blog-content :deep(h2),
.blog-content :deep(h3) {
  color: #fff;
  font-weight: 900;
  line-height: 1.15;
  margin: 2rem 0 1rem;
}

.blog-content :deep(h2) {
  font-size: 2rem;
}

.blog-content :deep(h3) {
  font-size: 1.45rem;
}

.blog-content :deep(p),
.blog-content :deep(ul) {
  margin-top: 1.1rem;
}

.blog-content :deep(ul) {
  list-style: disc;
  padding-left: 1.4rem;
}

.blog-content :deep(a) {
  color: #ff4d00;
  font-weight: 800;
}
</style>
