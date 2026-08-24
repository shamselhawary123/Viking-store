<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">{{ t("admin.catalog") }}</p>
        <h2 class="mt-2 text-3xl font-black">{{ t("admin.categories") }}</h2>
      </div>

      <button class="rounded-2xl bg-[#FF4D00] px-5 py-3 font-bold text-white transition hover:opacity-90" @click="openCreate">
        {{ t("admin.addCategory") }}
      </button>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      <article v-for="category in categories" :key="category.id" class="admin-mobile-card overflow-hidden rounded-2xl border border-white/10 bg-[#111111] sm:rounded-3xl">
        <img :src="category.image || '/logo.png'" :alt="category.name" class="h-36 w-full object-cover sm:h-44" />
        <div class="p-4 sm:p-5">
          <h3 class="text-xl font-black">{{ category.name }}</h3>
          <p class="mt-2 text-sm text-gray-500">{{ category.slug }}</p>
          <div class="mt-5 flex flex-wrap gap-2">
            <button class="min-h-11 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:border-[#FF4D00]" @click="openEdit(category)">
              {{ t("common.edit") }}
            </button>
            <button class="min-h-11 rounded-xl border border-red-500/40 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500 hover:text-white" @click="deleteCategory(category)">
              {{ t("common.delete") }}
            </button>
          </div>
        </div>
      </article>
    </div>

    <p v-if="!loading && !categories.length" class="text-sm text-gray-500">{{ t("admin.noCategories") }}</p>

    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <form class="max-h-[calc(100dvh-1rem)] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111111] p-4 sm:rounded-3xl sm:p-6" @submit.prevent="saveCategory">
        <div class="flex items-center justify-between gap-4">
          <h3 class="text-2xl font-black">{{ editingId ? t("admin.editCategory") : t("admin.addCategory") }}</h3>
          <button type="button" class="text-gray-400 hover:text-white" @click="closeModal">{{ t("admin.modalClose") }}</button>
        </div>

        <div class="mt-6 space-y-4">
          <label class="block">
            <span class="field-label">{{ t("common.name") }}</span>
            <input v-model="form.name" required class="field mt-2" />
          </label>
          <label class="block">
            <span class="field-label">{{ t("admin.slug") }}</span>
            <input v-model="form.slug" required class="field mt-2" />
          </label>
          <label class="block">
            <span class="field-label">{{ t("admin.imageUrl") }}</span>
            <input v-model="form.image" class="field mt-2" />
          </label>
        </div>

        <p v-if="errorMessage" class="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{{ errorMessage }}</p>

        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="rounded-2xl border border-white/10 px-5 py-3 font-bold" @click="closeModal">{{ t("common.cancel") }}</button>
          <button type="submit" :disabled="saving" class="rounded-2xl bg-[#FF4D00] px-5 py-3 font-bold text-white disabled:opacity-50">
            {{ saving ? t("admin.saving") : t("admin.saveCategory") }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  image?: string;
};

const supabase = useSupabase();
const { t } = useI18n();
const categories = ref<CategoryRow[]>([]);
const loading = ref(true);
const saving = ref(false);
const modalOpen = ref(false);
const editingId = ref<number | null>(null);
const errorMessage = ref("");

const form = ref({
  name: "",
  slug: "",
  image: "",
});

watch(
  () => form.value.name,
  (name) => {
    if (editingId.value || form.value.slug) return;
    form.value.slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  },
);

const loadCategories = async () => {
  loading.value = true;

  const { data, error } = await supabase.from("categories").select("*").order("id");
  if (error) alert(error.message);

  categories.value = (data || []) as CategoryRow[];
  loading.value = false;
};

const resetForm = () => {
  form.value = {
    name: "",
    slug: "",
    image: "",
  };
  editingId.value = null;
  errorMessage.value = "";
};

const openCreate = () => {
  resetForm();
  modalOpen.value = true;
};

const openEdit = (category: CategoryRow) => {
  editingId.value = category.id;
  form.value = {
    name: category.name,
    slug: category.slug,
    image: category.image || "",
  };
  errorMessage.value = "";
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
};

const saveCategory = async () => {
  try {
    saving.value = true;
    errorMessage.value = "";

    if (editingId.value) {
      const { error } = await supabase.from("categories").update(form.value).eq("id", editingId.value);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("categories").insert(form.value);
      if (error) throw error;
    }

    await loadCategories();
    closeModal();
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : t("admin.unableSaveCategory");
  } finally {
    saving.value = false;
  }
};

const deleteCategory = async (category: CategoryRow) => {
  if (!confirm(t("admin.deleteCategoryConfirm", { name: category.name }))) return;

  const { error } = await supabase.from("categories").delete().eq("id", category.id);
  if (error) {
    alert(error.message);
    return;
  }

  await loadCategories();
};

onMounted(loadCategories);
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
  border-color: #ff4d00;
}
</style>
