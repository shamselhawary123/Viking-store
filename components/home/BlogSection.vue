<template>
  <section v-if="pending || posts.length" class="section-premium bg-black">
    <div class="container-premium">
      <div
        v-reveal
        class="mb-10 flex flex-col gap-5 text-center md:flex-row md:items-end md:justify-between md:text-start"
      >
        <div>
          <p class="eyebrow">{{ t("home.blogSection.eyebrow") }}</p>
          <h2 class="display-heading mt-4 text-6xl text-white md:text-7xl">
            {{ t("home.blogSection.title") }}
          </h2>
          <p class="mt-5 max-w-2xl leading-8 text-neutral-400">
            {{ t("home.blogSection.description") }}
          </p>
        </div>
        <NuxtLink
          to="/blog"
          class="premium-button premium-button-primary hidden md:inline-flex"
        >
          {{ t("home.blogSection.viewAll") }}
          <Icon name="i-heroicons-arrow-right" />
        </NuxtLink>
      </div>

      <p
        v-if="pending"
        class="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-neutral-400"
      >
        {{ t("common.loading") }}
      </p>

      <div v-else-if="posts.length" class="overflow-hidden">
        <div class="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
          <NuxtLink
            v-for="(post, index) in posts"
            :key="post.id"
            v-reveal="{ delay: index * 90 }"
            :to="`/blog/${post.slug}`"
            class="group relative min-h-[18rem] overflow-hidden rounded-2xl border border-white/10 bg-[#171717] transition duration-300 hover:-translate-y-2 hover:border-[#CF1D1D]/70"
          >
            <img
              :src="post.cover_image || '/train-hard.png'"
              :alt="post.title"
              width="640"
              height="640"
              class="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-700 group-hover:scale-110 group-hover:opacity-75"
              loading="lazy"
              decoding="async"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/10"
            />
            <div class="absolute inset-x-5 bottom-5">
              <p
                class="text-xs font-black uppercase tracking-[0.2em] text-[#CF1D1D]"
              >
                {{ post.category || t("home.blogSection.article") }}
              </p>
              <h3
                class="mt-2 line-clamp-2 text-2xl font-black leading-tight text-white"
              >
                {{ post.title }}
              </h3>
              <p
                v-if="post.excerpt"
                class="mt-3 line-clamp-2 text-sm leading-6 text-neutral-300"
              >
                {{ post.excerpt }}
              </p>
            </div>
          </NuxtLink>
        </div>

        <div v-reveal class="md:hidden">
          <div
            class="overflow-hidden"
            @touchstart.passive="handleTouchStart"
            @touchend.passive="handleTouchEnd"
          >
            <Transition :name="transitionName" mode="out-in">
              <NuxtLink
                v-if="currentPost"
                :key="currentPost.id"
                :to="`/blog/${currentPost.slug}`"
                class="block overflow-hidden rounded-2xl border border-white/10 bg-[#171717]"
              >
                <img
                  :src="currentPost.cover_image || '/train-hard.png'"
                  :alt="currentPost.title"
                  width="720"
                  height="440"
                  class="h-64 w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div class="p-5">
                  <p
                    class="text-xs font-black uppercase tracking-[0.2em] text-[#CF1D1D]"
                  >
                    {{ currentPost.category || t("home.blogSection.article") }}
                  </p>
                  <h3 class="mt-2 text-2xl font-black leading-tight text-white">
                    {{ currentPost.title }}
                  </h3>
                  <p
                    v-if="currentPost.excerpt"
                    class="mt-3 line-clamp-3 text-sm leading-6 text-neutral-400"
                  >
                    {{ currentPost.excerpt }}
                  </p>
                </div>
              </NuxtLink>
            </Transition>
          </div>

          <div class="mt-5 flex items-center justify-center gap-4">
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:border-[#CF1D1D] hover:text-[#CF1D1D]"
              :aria-label="t('home.blogSection.previous')"
              @click="goPrevious"
            >
              <Icon :name="previousIcon" />
            </button>
            <span
              class="text-xs font-black uppercase tracking-[0.18em] text-neutral-500"
            >
              {{ activeIndex + 1 }} / {{ posts.length }}
            </span>
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:border-[#CF1D1D] hover:text-[#CF1D1D]"
              :aria-label="t('home.blogSection.next')"
              @click="goNext"
            >
              <Icon :name="nextIcon" />
            </button>
          </div>

          <div class="mt-7 text-center">
            <NuxtLink
              to="/blog"
              class="premium-button premium-button-secondary"
            >
              {{ t("home.blogSection.viewAll") }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { BlogPostLike } from "../../utils/blog";
import { getPublicSupabaseClient } from "../../utils/publicSupabase";

type HomeBlogPost = BlogPostLike & {
  id: number | string;
};

const { locale, t } = useI18n();
const config = useRuntimeConfig();
const activeIndex = ref(0);
const touchStartX = ref(0);
const slideDirection = ref<"next" | "previous">("next");
const supabase = getPublicSupabaseClient(
  config.public.supabaseUrl as string,
  config.public.supabaseKey as string,
);

const { data, pending } = await useLazyAsyncData("home-blog-posts", async () => {
  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select(
      "id,title,slug,excerpt,cover_image,category,published_at,created_at",
    )
    .eq("status", "published")
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(4);

  if (error) return [];
  return (posts || []).filter((post) => post.slug) as HomeBlogPost[];
});

const posts = computed(() => data.value || []);
const currentPost = computed(() => posts.value[activeIndex.value] || null);
const isRtl = computed(() => locale.value === "ar");
const previousIcon = computed(() =>
  isRtl.value ? "i-heroicons-chevron-right" : "i-heroicons-chevron-left",
);
const nextIcon = computed(() =>
  isRtl.value ? "i-heroicons-chevron-left" : "i-heroicons-chevron-right",
);
const transitionName = computed(() =>
  slideDirection.value === "next" ? "blog-slide-next" : "blog-slide-previous",
);

const move = (direction: "next" | "previous") => {
  if (posts.value.length < 2) return;

  slideDirection.value = direction;
  const offset = direction === "next" ? 1 : -1;
  activeIndex.value =
    (activeIndex.value + offset + posts.value.length) % posts.value.length;
};

const goPrevious = () => move("previous");
const goNext = () => move("next");

const handleTouchStart = (event: TouchEvent) => {
  touchStartX.value = event.changedTouches[0]?.clientX || 0;
};

const handleTouchEnd = (event: TouchEvent) => {
  const endX = event.changedTouches[0]?.clientX || 0;
  const delta = touchStartX.value - endX;

  if (Math.abs(delta) < 45) return;

  if (isRtl.value) {
    delta > 0 ? goPrevious() : goNext();
  } else {
    delta > 0 ? goNext() : goPrevious();
  }
};
</script>

<style scoped>
.blog-slide-next-enter-active,
.blog-slide-next-leave-active,
.blog-slide-previous-enter-active,
.blog-slide-previous-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.blog-slide-next-enter-from,
.blog-slide-previous-leave-to {
  opacity: 0;
  transform: translateX(18px);
}

.blog-slide-next-leave-to,
.blog-slide-previous-enter-from {
  opacity: 0;
  transform: translateX(-18px);
}

@media (prefers-reduced-motion: reduce) {
  .blog-slide-next-enter-active,
  .blog-slide-next-leave-active,
  .blog-slide-previous-enter-active,
  .blog-slide-previous-leave-active {
    transition: none;
  }
}
</style>
