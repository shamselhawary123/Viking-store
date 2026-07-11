<template>
  <section class="space-y-6">
    <div>
      <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">
        Catalog
      </p>
      <h2 class="mt-2 text-3xl font-black">Categories</h2>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="category in categories"
        :key="category.id"
        class="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]"
      >
        <img
          :src="category.image || '/logo.png'"
          :alt="category.name"
          class="h-48 w-full object-cover"
        />
        <div class="p-5">
          <h3 class="text-xl font-black">{{ category.name }}</h3>
          <p class="mt-2 text-sm text-gray-500">{{ category.slug }}</p>
        </div>
      </div>
    </div>

    <p v-if="!loading && !categories.length" class="text-sm text-gray-500">
      No categories found.
    </p>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  image?: string;
};

const supabase = useSupabase();
const categories = ref<CategoryRow[]>([]);
const loading = ref(true);

onMounted(async () => {
  const { data } = await supabase.from("categories").select("*").order("id");
  categories.value = (data || []) as CategoryRow[];
  loading.value = false;
});
</script>
