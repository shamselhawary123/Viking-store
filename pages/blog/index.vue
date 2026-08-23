<template>
  <section class="section-premium">
    <div class="container-premium">
      <div class="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
        <p class="eyebrow">{{ t("blog.eyebrow") }}</p>
        <div class="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 class="display-heading text-6xl text-white md:text-7xl">{{ t("blog.title") }}</h1>
            <p class="mt-4 max-w-2xl leading-8 text-neutral-400">{{ t("blog.lead") }}</p>
          </div>
          <NuxtLink to="/shop" class="premium-button premium-button-secondary w-fit">
            {{ t("blog.shopCta") }}
            <Icon name="i-heroicons-arrow-right" />
          </NuxtLink>
        </div>
      </div>

      <p v-if="pending" class="premium-panel rounded-2xl p-6 text-neutral-400">{{ t("common.loading") }}</p>
      <p v-else-if="error" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">{{ t("blog.loadFailed") }}</p>
      <div v-else-if="posts.length" class="space-y-12">
        <article class="grid overflow-hidden rounded-2xl border border-white/10 bg-[#111111] md:grid-cols-[1.1fr_0.9fr]">
          <NuxtLink :to="`/blog/${featuredPost.slug}`" class="block overflow-hidden bg-black">
            <img
              :src="featuredPost.cover_image || '/train-hard.png'"
              :alt="featuredPost.title"
              width="980"
              height="620"
              class="h-full min-h-[320px] w-full object-cover transition duration-700 hover:scale-105"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
          </NuxtLink>
          <div class="flex flex-col justify-center p-6 md:p-8">
            <p class="eyebrow">{{ featuredPost.category || t("blog.featured") }}</p>
            <NuxtLink :to="`/blog/${featuredPost.slug}`" class="mt-4 block text-4xl font-black leading-tight text-white transition hover:text-[#FF4D00] md:text-5xl">
              {{ featuredPost.title }}
            </NuxtLink>
            <p class="mt-4 leading-8 text-neutral-400">{{ featuredPost.excerpt }}</p>
            <div class="mt-6 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
              <span>{{ formatBlogDate(featuredPost.published_at, locale) }}</span>
              <span>•</span>
              <span>{{ t("blog.readingTime", { count: calculateReadingTime(featuredPost.content || "") }) }}</span>
            </div>
            <NuxtLink :to="`/blog/${featuredPost.slug}`" class="premium-button premium-button-primary mt-8 w-fit">
              {{ t("blog.readArticle") }}
            </NuxtLink>
          </div>
        </article>

        <div class="grid gap-8 lg:grid-cols-[15rem_1fr]">
          <aside class="space-y-3">
            <h2 class="text-lg font-black text-white">{{ t("blog.categories") }}</h2>
            <button
              class="w-full rounded-xl border px-4 py-3 text-left text-sm font-bold transition"
              :class="selectedCategory === 'all' ? 'border-[#FF4D00] bg-[#FF4D00] text-white' : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-[#FF4D00]'"
              @click="selectedCategory = 'all'"
            >
              {{ t("common.all") }}
            </button>
            <button
              v-for="category in categories"
              :key="category"
              class="w-full rounded-xl border px-4 py-3 text-left text-sm font-bold transition"
              :class="selectedCategory === category ? 'border-[#FF4D00] bg-[#FF4D00] text-white' : 'border-white/10 bg-white/[0.03] text-neutral-300 hover:border-[#FF4D00]'"
              @click="selectedCategory = category"
            >
              {{ category }}
            </button>
          </aside>

          <div>
            <div class="mb-6 flex items-center justify-between gap-4">
              <h2 class="text-2xl font-black text-white">{{ t("blog.latestArticles") }}</h2>
              <p class="text-sm text-neutral-500">{{ t("blog.articleCount", { count: filteredPosts.length }) }}</p>
            </div>
            <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <article v-for="post in filteredPosts" :key="post.id" class="overflow-hidden rounded-2xl border border-white/10 bg-[#111111] transition duration-300 hover:-translate-y-1 hover:border-[#FF4D00]/60">
                <NuxtLink :to="`/blog/${post.slug}`" class="block overflow-hidden bg-black">
                  <img
                    :src="post.cover_image || '/train-hard.png'"
                    :alt="post.title"
                    width="520"
                    height="320"
                    class="h-56 w-full object-cover transition duration-700 hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                </NuxtLink>
                <div class="p-5">
                  <p class="text-xs font-black uppercase tracking-[0.18em] text-[#FF4D00]">{{ post.category || t("blog.editorial") }}</p>
                  <NuxtLink :to="`/blog/${post.slug}`" class="mt-3 block text-2xl font-black leading-tight text-white transition hover:text-[#FF4D00]">
                    {{ post.title }}
                  </NuxtLink>
                  <p class="mt-3 line-clamp-3 leading-7 text-neutral-400">{{ post.excerpt }}</p>
                  <div class="mt-5 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                    <span>{{ formatBlogDate(post.published_at, locale) }}</span>
                    <span>•</span>
                    <span>{{ t("blog.readingTime", { count: calculateReadingTime(post.content || "") }) }}</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="premium-panel rounded-2xl p-10 text-center">
        <h2 class="text-3xl font-black text-white">{{ t("blog.emptyTitle") }}</h2>
        <p class="mx-auto mt-3 max-w-xl text-neutral-400">{{ t("blog.emptyText") }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { createClient } from "@supabase/supabase-js";
import { computed, ref } from "vue";
import { calculateReadingTime, formatBlogDate, type BlogPostLike } from "../../utils/blog";
import { createPublicSupabaseReadOptions } from "../../utils/publicSupabase";
import { buildCanonicalUrl, normalizeSiteUrl } from "../../utils/seo";

type BlogPostRow = BlogPostLike & {
  id: number;
};

const { t, locale } = useI18n();
const config = useRuntimeConfig();
const siteUrl = normalizeSiteUrl(String(config.public.siteUrl || ""));
const canonicalUrl = computed(() => buildCanonicalUrl(siteUrl, "/blog"));
const selectedCategory = ref("all");

const supabase = createClient(
  config.public.supabaseUrl as string,
  config.public.supabaseKey as string,
  createPublicSupabaseReadOptions("viking-store-blog-index-readonly"),
);

const { data, pending, error } = await useAsyncData("published-blog-posts", async () => {
  const { data: posts, error: postsError } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,content,cover_image,category,tags,published_at,created_at,updated_at")
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (postsError) throw postsError;
  return (posts || []) as BlogPostRow[];
});

const posts = computed(() => data.value || []);
const featuredPost = computed(() => posts.value[0]);
const categories = computed(() =>
  Array.from(new Set(posts.value.map((post) => post.category).filter(Boolean) as string[])).sort(),
);
const filteredPosts = computed(() =>
  selectedCategory.value === "all"
    ? posts.value
    : posts.value.filter((post) => post.category === selectedCategory.value),
);

useSeoMeta({
  title: () => t("blog.metaTitle"),
  description: () => t("blog.metaDescription"),
  ogTitle: () => t("blog.metaTitle"),
  ogDescription: () => t("blog.metaDescription"),
  ogUrl: () => canonicalUrl.value,
  twitterCard: "summary_large_image",
});

useHead(() => ({
  link: [{ rel: "canonical", href: canonicalUrl.value }],
  script: [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: t("blog.metaTitle"),
        description: t("blog.metaDescription"),
        url: canonicalUrl.value,
      }),
    },
  ],
}));
</script>
