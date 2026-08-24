<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">{{ t("admin.catalog") }}</p>
        <h2 class="mt-2 text-3xl font-black">{{ t("admin.products") }}</h2>
      </div>

      <button class="rounded-2xl bg-[#FF4D00] px-5 py-3 font-bold text-white transition hover:opacity-90" @click="openCreate">
        {{ t("admin.addProduct") }}
      </button>
    </div>

    <div class="grid gap-3 rounded-3xl border border-white/10 bg-[#111111] p-4 md:grid-cols-[1fr_14rem_12rem_12rem]">
      <input v-model="search" type="search" :placeholder="t('admin.searchProducts')" class="field" />
      <select v-model.number="categoryFilter" class="field">
        <option :value="0">{{ t("admin.allCategories") }}</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
      </select>
      <select v-model="stockFilter" class="field">
        <option value="all">{{ t("admin.allStatusesFilter") }}</option>
        <option value="in">{{ t("admin.inStock") }}</option>
        <option value="out">{{ t("admin.outOfStock") }}</option>
      </select>
      <select v-model="sortBy" class="field">
        <option value="manual">{{ t("admin.manualOrder") }}</option>
        <option value="newest">{{ t("admin.newest") }}</option>
        <option value="name">{{ t("common.name") }}</option>
        <option value="price-asc">{{ t("admin.priceLow") }}</option>
        <option value="price-desc">{{ t("admin.priceHigh") }}</option>
      </select>
    </div>

    <p
      v-if="isReorderMode && reorderLoading"
      class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-gray-300"
    >
      {{ t("admin.loadingFullOrder") }}
    </p>
    <p
      v-else-if="isDragOrderingBlockedByView"
      class="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-200"
    >
      {{ reorderError || t("admin.reorderDisabled") }}
    </p>

    <div class="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
      <div class="hidden overflow-x-auto md:block">
        <table class="w-full min-w-[1220px] text-left text-sm">
          <thead class="bg-black text-gray-500">
            <tr>
              <th class="px-5 py-4 text-center">{{ t("admin.drag") }}</th>
              <th class="px-5 py-4">{{ t("common.product") }}</th>
              <th class="px-5 py-4">{{ t("common.category") }}</th>
              <th class="px-5 py-4">{{ t("common.price") }} (EGP)</th>
              <th class="px-5 py-4">{{ t("common.status") }}</th>
              <th class="px-5 py-4">{{ t("admin.state") }}</th>
              <th class="px-5 py-4">{{ t("common.created") }}</th>
              <th class="px-5 py-4 text-center">{{ t("admin.order") }}</th>
              <th class="px-5 py-4 text-right">{{ t("common.actions") }}</th>
            </tr>
          </thead>
          <tbody ref="productTableBody" class="divide-y divide-white/10">
            <tr
              v-for="product in dragProducts"
              :key="product.id"
              :data-product-id="product.id"
              class="transition-colors"
              :class="{ 'bg-[#FF4D00]/5': draggingProductId === product.id }"
            >
              <td class="px-5 py-4 text-center">
                <button
                  class="product-drag-handle inline-flex h-9 w-9 cursor-grab items-center justify-center rounded-xl border border-white/10 bg-black/40 text-gray-400 shadow-sm transition hover:border-[#FF4D00] hover:text-[#FF4D00] active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-35"
                  type="button"
                  :disabled="isDragOrderingDisabled"
                  :aria-label="t('admin.dragProduct', { title: product.title })"
                >
                  <Icon name="i-heroicons-bars-3" />
                </button>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <img :src="product.cover_image || firstProductImage(product) || '/logo.png'" alt="" class="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <p class="font-bold">{{ product.title }}</p>
                    <p class="text-xs text-gray-500">{{ product.slug }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 text-gray-300">{{ product.categories?.name || t("admin.uncategorized") }}</td>
              <td class="px-5 py-4">
                <span v-if="product.price !== undefined" class="font-black text-[#FF4D00]">{{ formatProductPrice(product.price) }}</span>
                <span v-else class="text-gray-500">-</span>
                <span v-if="product.old_price" class="ml-2 text-gray-500 line-through">{{ formatProductPrice(product.old_price) }}</span>
              </td>
              <td class="px-5 py-4 text-gray-300">
                <span v-if="product.product_sizes">{{ inStockCount(product) }} / {{ product.product_sizes.length }}</span>
                <span v-else>-</span>
              </td>
              <td class="px-5 py-4">
                <span
                  v-if="product.product_sizes"
                  class="rounded-full border px-3 py-1 text-xs font-black"
                  :class="inStockCount(product) ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-red-400/30 bg-red-400/10 text-red-300'"
                >
                  {{ inStockCount(product) ? t("admin.inStock") : t("admin.outOfStock") }}
                </span>
                <span v-else class="rounded-full border border-white/10 px-3 py-1 text-xs font-black text-gray-500">{{ t("admin.orderOnly") }}</span>
              </td>
              <td class="px-5 py-4 text-gray-400">{{ formatDate(product.created_at) }}</td>
              <td class="px-5 py-4">
                <div class="flex justify-center gap-2">
                  <button
                    class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 font-black transition hover:border-[#FF4D00] disabled:cursor-not-allowed disabled:opacity-40"
                    type="button"
                    :disabled="movingProductId !== null || dragSaving || !getProductMoveState(activeOrderedProducts, product.id).canMoveUp"
                    :aria-label="t('admin.moveProductUp', { title: product.title })"
                    @click="moveProduct(product, 'up')"
                  >
                    <Icon name="i-heroicons-arrow-up" />
                  </button>
                  <button
                    class="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 font-black transition hover:border-[#FF4D00] disabled:cursor-not-allowed disabled:opacity-40"
                    type="button"
                    :disabled="movingProductId !== null || dragSaving || !getProductMoveState(activeOrderedProducts, product.id).canMoveDown"
                    :aria-label="t('admin.moveProductDown', { title: product.title })"
                    @click="moveProduct(product, 'down')"
                  >
                    <Icon name="i-heroicons-arrow-down" />
                  </button>
                </div>
              </td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-2">
                  <button class="rounded-xl border border-white/10 px-4 py-2 font-bold transition hover:border-[#FF4D00]" @click="openEdit(product)">
                    {{ t("common.edit") }}
                  </button>
                  <button class="rounded-xl border border-red-500/40 px-4 py-2 font-bold text-red-400 transition hover:bg-red-500 hover:text-white" @click="deleteProduct(product)">
                    {{ t("common.delete") }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div ref="productCardList" class="grid gap-3 p-3 md:hidden">
        <article
          v-for="product in dragProducts"
          :key="product.id"
          :data-product-id="product.id"
          class="admin-mobile-card rounded-2xl border border-white/10 bg-black p-3 transition-colors"
          :class="{ 'bg-[#FF4D00]/5': draggingProductId === product.id }"
        >
          <div class="flex gap-3">
            <button
              class="product-drag-handle flex h-11 w-11 shrink-0 cursor-grab items-center justify-center rounded-xl border border-white/10 bg-[#111111] text-gray-400 shadow-sm transition hover:border-[#FF4D00] hover:text-[#FF4D00] active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-35"
              type="button"
              :disabled="isDragOrderingDisabled"
              :aria-label="t('admin.dragProduct', { title: product.title })"
            >
              <Icon name="i-heroicons-bars-3" />
            </button>
            <img :src="product.cover_image || firstProductImage(product) || '/logo.png'" alt="" class="h-14 w-14 shrink-0 rounded-xl object-cover" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-black">{{ product.title }}</p>
              <p class="mt-1 truncate text-xs text-gray-500">{{ product.slug }}</p>
              <p class="mt-2 text-sm text-gray-300">{{ product.categories?.name || t("admin.uncategorized") }}</p>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div class="rounded-xl border border-white/10 bg-[#111111] p-3">
              <p class="text-xs text-gray-500">{{ t("common.price") }}</p>
              <p class="mt-1 font-black text-[#FF4D00]">{{ formatProductPrice(product.price) }}</p>
            </div>
            <div class="rounded-xl border border-white/10 bg-[#111111] p-3">
              <p class="text-xs text-gray-500">{{ t("common.status") }}</p>
              <p class="mt-1 font-bold text-gray-200">
                {{ product.product_sizes ? (inStockCount(product) ? t("admin.inStock") : t("admin.outOfStock")) : t("admin.orderOnly") }}
              </p>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div class="flex gap-2">
              <button
                class="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 font-black transition hover:border-[#FF4D00] disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
                :disabled="movingProductId !== null || dragSaving || !getProductMoveState(activeOrderedProducts, product.id).canMoveUp"
                :aria-label="t('admin.moveProductUp', { title: product.title })"
                @click="moveProduct(product, 'up')"
              >
                <Icon name="i-heroicons-arrow-up" />
              </button>
              <button
                class="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 font-black transition hover:border-[#FF4D00] disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
                :disabled="movingProductId !== null || dragSaving || !getProductMoveState(activeOrderedProducts, product.id).canMoveDown"
                :aria-label="t('admin.moveProductDown', { title: product.title })"
                @click="moveProduct(product, 'down')"
              >
                <Icon name="i-heroicons-arrow-down" />
              </button>
            </div>
            <div class="flex gap-2">
              <button class="min-h-11 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:border-[#FF4D00]" @click="openEdit(product)">
                {{ t("common.edit") }}
              </button>
              <button class="min-h-11 rounded-xl border border-red-500/40 px-4 py-2 text-sm font-bold text-red-400 transition hover:bg-red-500 hover:text-white" @click="deleteProduct(product)">
                {{ t("common.delete") }}
              </button>
            </div>
          </div>
        </article>
      </div>

      <div class="flex flex-col gap-3 border-t border-white/10 p-4 md:flex-row md:items-center md:justify-between">
        <p class="text-sm text-gray-500">{{ t("admin.showingCount", { visible: displayedProductCount, total: displayedProductTotal }) }}</p>
        <button v-if="!isReorderMode && visibleProducts.length < filteredProducts.length" class="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:border-[#FF4D00]" @click="limit += pageSize">
          {{ t("admin.loadMore") }}
        </button>
      </div>

      <p v-if="loading" class="p-6 text-sm text-gray-500">{{ t("admin.loadingProducts") }}</p>
      <p v-else-if="!filteredProducts.length" class="p-6 text-sm text-gray-500">{{ t("admin.noProducts") }}</p>
    </div>

    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <form class="max-h-[calc(100dvh-1rem)] w-full max-w-5xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111111] p-4 sm:rounded-3xl sm:p-6" @submit.prevent="saveProduct">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">{{ editingId ? t("admin.editProduct") : t("admin.createProduct") }}</p>
            <h3 class="mt-2 text-2xl font-black">{{ form.name || t("admin.productDetails") }}</h3>
          </div>
          <button type="button" class="text-gray-400 hover:text-white" @click="closeModal">{{ t("admin.modalClose") }}</button>
        </div>

        <div class="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div class="space-y-5">
            <section class="rounded-2xl border border-white/10 bg-black p-5">
              <h4 class="font-black">{{ t("common.product") }}</h4>
              <div class="mt-4 grid gap-4 md:grid-cols-2">
                <label class="block">
                  <span class="field-label">{{ t("common.name") }}</span>
                  <input v-model="form.name" required class="field mt-2" />
                </label>
                <label class="block">
                  <span class="field-label">{{ t("admin.slug") }}</span>
                  <input v-model="form.slug" required class="field mt-2" />
                </label>
                <label class="block">
                  <span class="field-label">{{ t("common.price") }} (EGP)</span>
                  <input v-model.number="form.price" required type="number" min="0" step="0.01" class="field mt-2" />
                </label>
                <label class="block">
                  <span class="field-label">{{ t("admin.oldPrice") }}</span>
                  <input v-model.number="form.old_price" type="number" min="0" step="0.01" class="field mt-2" />
                </label>
                <label class="block md:col-span-2">
                  <span class="field-label">{{ t("common.category") }}</span>
                  <select v-model.number="form.category_id" required class="field mt-2">
                    <option :value="0" disabled>{{ t("admin.selectCategory") }}</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                  </select>
                </label>
                <label class="block md:col-span-2">
                  <span class="field-label">{{ t("admin.description") }}</span>
                  <textarea v-model="form.description" rows="4" class="field mt-2" />
                </label>
              </div>
            </section>

            <section class="rounded-2xl border border-white/10 bg-black p-5">
              <div class="flex items-center justify-between gap-3">
                <h4 class="font-black">{{ t("admin.sizes") }}</h4>
                <button type="button" class="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold hover:border-[#FF4D00]" @click="addSize">
                  {{ t("admin.addSize") }}
                </button>
              </div>
              <div class="mt-4 space-y-3">
                <div v-for="(size, index) in sizes" :key="size.key" class="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <input v-model="size.size" :placeholder="t('admin.sizePlaceholder')" class="field" />
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-300">
                    <input v-model="size.in_stock" type="checkbox" class="h-4 w-4 accent-[#FF4D00]" />
                    {{ t("admin.inStock") }}
                  </label>
                  <button type="button" class="rounded-xl border border-red-500/40 px-3 py-2 text-sm font-bold text-red-300" @click="removeSize(index)">
                    {{ t("common.remove") }}
                  </button>
                </div>
                <p v-if="!sizes.length" class="text-sm text-gray-500">{{ t("admin.noSizes") }}</p>
              </div>
            </section>
          </div>

          <section class="rounded-2xl border border-white/10 bg-black p-5">
            <div class="flex items-center justify-between gap-3">
              <h4 class="font-black">{{ t("admin.colorsImages") }}</h4>
              <button type="button" class="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold hover:border-[#FF4D00]" @click="addColor">
                {{ t("admin.addColor") }}
              </button>
            </div>

            <div class="mt-4 space-y-4">
              <div v-for="(color, colorIndex) in colors" :key="color.key" class="rounded-2xl border border-white/10 bg-[#111111] p-4">
                <div class="grid gap-3 md:grid-cols-[1fr_8rem_auto] md:items-end">
                  <label class="block">
                    <span class="field-label">{{ t("admin.colorName") }}</span>
                    <input v-model="color.name" :placeholder="t('admin.colorPlaceholder')" class="field mt-2" />
                  </label>
                  <label class="block">
                    <span class="field-label">{{ t("admin.colorValue") }}</span>
                    <input v-model="color.value" type="color" class="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black p-1" />
                  </label>
                  <button type="button" class="rounded-xl border border-red-500/40 px-3 py-2 text-sm font-bold text-red-300" @click="removeColor(colorIndex)">
                    {{ t("common.remove") }}
                  </button>
                </div>

                <div class="mt-4">
                  <label class="inline-flex cursor-pointer rounded-xl border border-white/10 px-3 py-2 text-sm font-bold hover:border-[#FF4D00]">
                    {{ t("admin.selectImages") }}
                    <input type="file" accept="image/*" multiple class="hidden" @change="selectImages(colorIndex, $event)" />
                  </label>
                  <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div v-for="(image, imageIndex) in color.images" :key="image.key" class="relative overflow-hidden rounded-xl border border-white/10">
                      <button type="button" class="absolute right-2 top-2 z-10 rounded-lg bg-black/80 px-2 py-1 text-xs font-bold text-red-300" @click="removeImage(colorIndex, imageIndex)">
                        {{ t("common.remove") }}
                      </button>
                      <button type="button" class="absolute bottom-2 left-2 z-10 rounded-lg bg-black/80 px-2 py-1 text-xs font-bold text-white" @click="form.cover_image = image.preview">
                        {{ t("admin.main") }}
                      </button>
                      <img :src="image.preview" alt="" class="h-28 w-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="!colors.length" class="text-sm text-gray-500">{{ t("admin.noColors") }}</p>
            </div>
          </section>
        </div>

        <p v-if="successMessage" class="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{{ successMessage }}</p>
        <p v-if="errorMessage" class="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{{ errorMessage }}</p>

        <div class="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
          <button type="button" class="rounded-2xl border border-white/10 px-5 py-3 font-bold" @click="closeModal">{{ t("common.cancel") }}</button>
          <button type="submit" :disabled="saving" class="rounded-2xl bg-[#FF4D00] px-5 py-3 font-bold text-white disabled:opacity-50">
            {{ saving ? t("admin.savingProduct") : t("admin.saveProduct") }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useDraggable, type DraggableEvent } from "vue-draggable-plus";
import {
  buildProductImagePath,
  buildProductPayload,
  formatDate,
  getOptimisticShopPositions,
  getProductDragReorder,
  getProductMoveState,
  isProductDragOrderingDisabled,
  isProductReorderMode,
  sortProductsByShopPosition,
} from "../../utils/admin";
import type { ProductMoveDirection } from "../../utils/admin";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

type CategoryRow = {
  id: number;
  name: string;
};

type ProductImageRow = {
  id: number;
  color_id: number;
  image_url: string;
};

type ProductColorRow = {
  id: number;
  name: string;
  value?: string;
  product_images?: ProductImageRow[];
};

type ProductSizeRow = {
  id: number;
  size: string;
  in_stock: boolean;
};

type ProductRow = {
  id: number;
  title: string;
  slug: string;
  description?: string;
  price?: number;
  old_price?: number | null;
  cover_image?: string;
  category_id?: number;
  created_at?: string;
  shop_position?: number | null;
  categories?: { name?: string };
  product_colors?: ProductColorRow[];
  product_sizes?: ProductSizeRow[];
};

type SizeForm = {
  key: string;
  id?: number;
  size: string;
  in_stock: boolean;
};

type ImageForm = {
  key: string;
  id?: number;
  image_url?: string;
  file?: File;
  preview: string;
};

type ColorForm = {
  key: string;
  id?: number;
  name: string;
  value: string;
  images: ImageForm[];
};

const supabase = useSupabase();
const { t } = useI18n();
const products = ref<ProductRow[]>([]);
const categories = ref<CategoryRow[]>([]);
const loading = ref(true);
const saving = ref(false);
const modalOpen = ref(false);
const editingId = ref<number | null>(null);
const editingProduct = ref<ProductRow | null>(null);
const search = ref("");
const categoryFilter = ref(0);
const stockFilter = ref<"all" | "in" | "out">("all");
const sortBy = ref("manual");
const limit = ref(12);
const pageSize = 12;
const errorMessage = ref("");
const successMessage = ref("");
const movingProductId = ref<number | null>(null);
const dragSaving = ref(false);
const draggingProductId = ref<number | null>(null);
const dragStartProducts = ref<ProductRow[]>([]);
const dragProducts = ref<ProductRow[]>([]);
const reorderProducts = ref<ProductRow[]>([]);
const reorderLoading = ref(false);
const reorderProductsLoaded = ref(false);
const reorderError = ref("");
const productTableBody = ref<HTMLElement | null>(null);
const productCardList = ref<HTMLElement | null>(null);
const sizes = ref<SizeForm[]>([]);
const colors = ref<ColorForm[]>([]);

const form = ref({
  name: "",
  slug: "",
  description: "",
  price: 0,
  old_price: null as number | null,
  category_id: 0,
  cover_image: "",
});

const newKey = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const formatProductPrice = (value: number | string | null | undefined) =>
  `${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} EGP`;

const inStockCount = (product: ProductRow) =>
  product.product_sizes?.filter((size) => size.in_stock).length || 0;

const firstProductImage = (product: ProductRow) =>
  product.product_colors?.flatMap((color) => color.product_images || [])[0]?.image_url || "";

const orderedProducts = computed(() => sortProductsByShopPosition(products.value));

const filteredProducts = computed(() => {
  const term = search.value.trim().toLowerCase();
  let result = [...products.value];

  if (term) {
    result = result.filter((product) =>
      [product.title, product.slug, product.categories?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }

  if (categoryFilter.value) {
    result = result.filter((product) => product.category_id === categoryFilter.value);
  }

  if (stockFilter.value !== "all") {
    result = result.filter((product) =>
      stockFilter.value === "in" ? inStockCount(product) > 0 : inStockCount(product) === 0,
    );
  }

  if (sortBy.value === "manual") {
    return sortProductsByShopPosition(result);
  }

  return result.sort((a, b) => {
    if (sortBy.value === "name") return a.title.localeCompare(b.title);
    if (sortBy.value === "price-asc") return Number(a.price || 0) - Number(b.price || 0);
    if (sortBy.value === "price-desc") return Number(b.price || 0) - Number(a.price || 0);
    return Number(b.id || 0) - Number(a.id || 0);
  });
});

const visibleProducts = computed(() => filteredProducts.value.slice(0, limit.value));

const isReorderMode = computed(() =>
  isProductReorderMode({
    search: search.value,
    categoryFilter: categoryFilter.value,
    stockFilter: stockFilter.value,
    sortBy: sortBy.value,
  }),
);

const reorderDisplayProducts = computed(() => {
  const productById = new Map(products.value.map((product) => [product.id, product]));

  return reorderProducts.value.map((product) => ({
    ...productById.get(product.id),
    ...product,
  }));
});

const tableProducts = computed(() =>
  isReorderMode.value && reorderProductsLoaded.value
    ? reorderDisplayProducts.value
    : visibleProducts.value,
);

const activeOrderedProducts = computed(() =>
  isReorderMode.value && reorderProductsLoaded.value
    ? reorderDisplayProducts.value
    : orderedProducts.value,
);

const displayedProductCount = computed(() => tableProducts.value.length);
const displayedProductTotal = computed(() =>
  isReorderMode.value && reorderProductsLoaded.value
    ? reorderProducts.value.length
    : filteredProducts.value.length,
);

const isDragOrderingBlockedByView = computed(() =>
  !isReorderMode.value || Boolean(reorderError.value),
);

const isDragOrderingDisabled = computed(() =>
  isProductDragOrderingDisabled({
    search: search.value,
    categoryFilter: categoryFilter.value,
    stockFilter: stockFilter.value,
    sortBy: sortBy.value,
    reorderListLoaded: reorderProductsLoaded.value,
    reorderListFailed: Boolean(reorderError.value),
  }) ||
  movingProductId.value !== null ||
  dragSaving.value ||
  reorderLoading.value,
);

watch([search, categoryFilter, stockFilter, sortBy], () => {
  limit.value = pageSize;
});

watch(isReorderMode, (active) => {
  if (active && !reorderProductsLoaded.value && !reorderLoading.value) {
    void loadReorderProducts();
  }
});

watch(
  tableProducts,
  (items) => {
    if (draggingProductId.value !== null || dragSaving.value) return;
    dragProducts.value = [...items];
  },
  { immediate: true },
);

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

const loadData = async () => {
  loading.value = true;

  const [{ data: productsData, error: productsError }, { data: categoriesData, error: categoriesError }] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(id, name), product_colors(*, product_images(*)), product_sizes(*)")
      .order("shop_position", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true }),
    supabase.from("categories").select("id, name").order("id"),
  ]);

  if (productsError) alert(productsError.message);
  if (categoriesError) alert(categoriesError.message);

  products.value = (productsData || []) as ProductRow[];
  categories.value = (categoriesData || []) as CategoryRow[];
  loading.value = false;
};

const loadReorderProducts = async () => {
  try {
    reorderLoading.value = true;
    reorderError.value = "";

    const { data, error } = await supabase
      .from("products")
      .select("id, title, slug, cover_image, shop_position")
      .order("shop_position", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true });

    if (error) throw error;

    reorderProducts.value = (data || []) as ProductRow[];
    reorderProductsLoaded.value = true;
  } catch (error: unknown) {
    reorderProducts.value = [];
    reorderProductsLoaded.value = false;
    reorderError.value =
      error instanceof Error ? error.message : t("admin.unableLoadFullOrder");
  } finally {
    reorderLoading.value = false;
  }
};

const refreshReorderProducts = async () => {
  reorderProductsLoaded.value = false;
  await loadReorderProducts();
};

const resetForm = () => {
  form.value = {
    name: "",
    slug: "",
    description: "",
    price: 0,
    old_price: null,
    category_id: categories.value[0]?.id || 0,
    cover_image: "",
  };
  sizes.value = [];
  colors.value = [];
  editingId.value = null;
  editingProduct.value = null;
  errorMessage.value = "";
  successMessage.value = "";
};

const openCreate = () => {
  resetForm();
  addSize();
  addColor();
  modalOpen.value = true;
};

const openEdit = (product: ProductRow) => {
  editingProduct.value = product;
  editingId.value = product.id;
  form.value = {
    name: product.title,
    slug: product.slug,
    description: product.description || "",
    price: Number(product.price || 0),
    old_price: product.old_price || null,
    category_id: product.category_id || 0,
    cover_image: product.cover_image || firstProductImage(product),
  };
  sizes.value = (product.product_sizes || []).map((size) => ({
    key: newKey(),
    id: size.id,
    size: size.size,
    in_stock: size.in_stock,
  }));
  colors.value = (product.product_colors || []).map((color) => ({
    key: newKey(),
    id: color.id,
    name: color.name,
    value: color.value || "#000000",
    images: (color.product_images || []).map((image) => ({
      key: newKey(),
      id: image.id,
      image_url: image.image_url,
      preview: image.image_url,
    })),
  }));
  errorMessage.value = "";
  successMessage.value = "";
  modalOpen.value = true;
};

const closeModal = () => {
  colors.value.forEach((color) => {
    color.images.forEach((image) => {
      if (image.file) URL.revokeObjectURL(image.preview);
    });
  });
  modalOpen.value = false;
};

const addSize = () => {
  sizes.value.push({
    key: newKey(),
    size: "",
    in_stock: true,
  });
};

const removeSize = (index: number) => {
  sizes.value.splice(index, 1);
};

const addColor = () => {
  colors.value.push({
    key: newKey(),
    name: "",
    value: "#000000",
    images: [],
  });
};

const removeColor = (index: number) => {
  colors.value[index]?.images.forEach((image) => {
    if (image.file) URL.revokeObjectURL(image.preview);
  });
  colors.value.splice(index, 1);
};

const selectImages = (colorIndex: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  const color = colors.value[colorIndex];
  if (!color) return;

  color.images.push(
    ...files.map((file) => ({
      key: newKey(),
      file,
      preview: URL.createObjectURL(file),
    })),
  );

  if (!form.value.cover_image && color.images[0]) {
    form.value.cover_image = color.images[0].preview;
  }

  input.value = "";
};

const removeImage = (colorIndex: number, imageIndex: number) => {
  const image = colors.value[colorIndex]?.images[imageIndex];
  if (image?.file) URL.revokeObjectURL(image.preview);
  colors.value[colorIndex]?.images.splice(imageIndex, 1);
};

const validateForm = () => {
  if (!form.value.name.trim()) return t("admin.productNameRequired");
  if (!form.value.slug.trim()) return t("admin.productSlugRequired");
  if (!form.value.category_id) return t("admin.categoryRequired");
  if (Number(form.value.price) < 0) return t("admin.priceInvalid");

  const cleanSizes = sizes.value.map((size) => size.size.trim()).filter(Boolean);
  if (new Set(cleanSizes.map((size) => size.toLowerCase())).size !== cleanSizes.length) {
    return t("admin.duplicateSizes");
  }

  const invalidColor = colors.value.find((color) => color.name.trim() && !color.value.trim());
  if (invalidColor) return t("admin.colorValueRequired", { name: invalidColor.name });

  return "";
};

const saveSizes = async (productId: number) => {
  const originalIds = new Set((editingProduct.value?.product_sizes || []).map((size) => size.id));
  const currentIds = new Set(sizes.value.map((size) => size.id).filter(Boolean));
  const removedIds = [...originalIds].filter((id) => !currentIds.has(id));

  if (removedIds.length) {
    const { error } = await supabase.from("product_sizes").delete().in("id", removedIds);
    if (error) throw error;
  }

  for (const size of sizes.value.filter((item) => item.size.trim())) {
    const payload = {
      product_id: productId,
      size: size.size.trim(),
      in_stock: size.in_stock,
    };

    if (size.id) {
      const { error } = await supabase.from("product_sizes").update(payload).eq("id", size.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("product_sizes").insert(payload);
      if (error) throw error;
    }
  }
};

const storagePathFromUrl = (url: string) => {
  const marker = "/products/";
  const index = url.indexOf(marker);
  if (index === -1) return "";
  return decodeURIComponent(url.slice(index + marker.length));
};

const removeImageRecord = async (image: ProductImageRow) => {
  const path = storagePathFromUrl(image.image_url);
  if (path) {
    await supabase.storage.from("products").remove([path]);
  }

  const { error } = await supabase.from("product_images").delete().eq("id", image.id);
  if (error) throw error;
};

const saveColorsAndImages = async (productId: number) => {
  const originalColors = editingProduct.value?.product_colors || [];
  const originalColorIds = new Set(originalColors.map((color) => color.id));
  const currentColorIds = new Set(colors.value.map((color) => color.id).filter(Boolean));
  const removedColors = originalColors.filter((color) => !currentColorIds.has(color.id));

  for (const color of removedColors) {
    for (const image of color.product_images || []) {
      await removeImageRecord(image);
    }
    const { error } = await supabase.from("product_colors").delete().eq("id", color.id);
    if (error) throw error;
  }

  for (const color of colors.value.filter((item) => item.name.trim())) {
    let colorId = color.id;
    const colorPayload = {
      product_id: productId,
      name: color.name.trim(),
      value: color.value || "#000000",
    };

    if (colorId && originalColorIds.has(colorId)) {
      const { error } = await supabase.from("product_colors").update(colorPayload).eq("id", colorId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("product_colors").insert(colorPayload).select("id").single();
      if (error) throw error;
      colorId = data.id;
    }

    const originalImages = originalColors.find((item) => item.id === color.id)?.product_images || [];
    const currentImageIds = new Set(color.images.map((image) => image.id).filter(Boolean));
    const removedImages = originalImages.filter((image) => !currentImageIds.has(image.id));

    for (const image of removedImages) {
      await removeImageRecord(image);
    }

    for (const image of color.images.filter((item) => item.file)) {
      if (!image.file || !colorId) continue;

      const path = buildProductImagePath(image.file.name);
      const { error: uploadError } = await supabase.storage.from("products").upload(path, image.file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(path);

      const { error: imageError } = await supabase.from("product_images").insert({
        color_id: colorId,
        image_url: publicUrl,
      });

      if (imageError) {
        await supabase.storage.from("products").remove([path]);
        throw imageError;
      }

      if (form.value.cover_image === image.preview) {
        form.value.cover_image = publicUrl;
      } else if (!form.value.cover_image) {
        form.value.cover_image = publicUrl;
      }
    }
  }
};

const saveProduct = async () => {
  try {
    saving.value = true;
    errorMessage.value = "";
    successMessage.value = "";

    const validationError = validateForm();
    if (validationError) {
      errorMessage.value = validationError;
      return;
    }

    const payload = buildProductPayload({
      ...form.value,
      cover_image: form.value.cover_image.startsWith("blob:") ? "" : form.value.cover_image,
    });
    let productId = editingId.value;

    if (productId) {
      const { error } = await supabase.from("products").update(payload).eq("id", productId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error) throw error;
      productId = data.id;
    }

    await saveSizes(productId);
    await saveColorsAndImages(productId);

    if (form.value.cover_image && form.value.cover_image !== payload.cover_image) {
      const { error } = await supabase
        .from("products")
        .update({ cover_image: form.value.cover_image })
        .eq("id", productId);
      if (error) throw error;
    }

    await loadData();
    if (reorderProductsLoaded.value || isReorderMode.value) {
      await refreshReorderProducts();
    }
    successMessage.value = t("admin.productSaved");
    setTimeout(() => closeModal(), 500);
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : t("admin.unableSaveProduct");
  } finally {
    saving.value = false;
  }
};

const deleteProduct = async (product: ProductRow) => {
  if (!confirm(t("admin.deleteProductConfirm", { title: product.title }))) return;

  try {
    saving.value = true;

    for (const color of product.product_colors || []) {
      for (const image of color.product_images || []) {
        await removeImageRecord(image);
      }
    }

    await supabase.from("product_sizes").delete().eq("product_id", product.id);
    await supabase.from("product_colors").delete().eq("product_id", product.id);
    const { error } = await supabase.from("products").delete().eq("id", product.id);

    if (error) throw error;
    await loadData();
    if (reorderProductsLoaded.value || isReorderMode.value) {
      await refreshReorderProducts();
    }
  } catch (error: unknown) {
    alert(error instanceof Error ? error.message : t("admin.unableDeleteProduct"));
  } finally {
    saving.value = false;
  }
};

const moveProduct = async (product: ProductRow, direction: ProductMoveDirection) => {
  if (movingProductId.value !== null || dragSaving.value) return;

  const moveState = getProductMoveState(activeOrderedProducts.value, product.id);
  if (direction === "up" && !moveState.canMoveUp) return;
  if (direction === "down" && !moveState.canMoveDown) return;

  const previousProducts = products.value;

  try {
    movingProductId.value = product.id;
    errorMessage.value = "";

    const { error } = await supabase.rpc("move_product_shop_position", {
      p_product_id: product.id,
      p_direction: direction,
    });

    if (error) throw error;
    await loadData();
    if (reorderProductsLoaded.value || isReorderMode.value) {
      await refreshReorderProducts();
    }
  } catch (error: unknown) {
    products.value = previousProducts;
    alert(error instanceof Error ? error.message : t("admin.unableReorderProduct"));
  } finally {
    movingProductId.value = null;
  }
};

const resetDragProducts = () => {
  dragProducts.value = [...tableProducts.value];
  dragStartProducts.value = [];
  draggingProductId.value = null;
};

const reorderDraggedProduct = async (event: DraggableEvent<ProductRow>) => {
  const oldIndex = event.oldIndex;
  const newIndex = event.newIndex;
  const startProducts = dragStartProducts.value;
  const draggedProduct = typeof oldIndex === "number" ? startProducts[oldIndex] : null;
  draggingProductId.value = null;

  if (
    isDragOrderingBlockedByView.value ||
    !draggedProduct ||
    typeof newIndex !== "number" ||
    oldIndex === newIndex
  ) {
    resetDragProducts();
    return;
  }

  const previousProducts = products.value;
  const { reorderedProducts, previousProductId, nextProductId } = getProductDragReorder(
    startProducts,
    draggedProduct.id,
    newIndex,
  );
  const optimisticProducts = getOptimisticShopPositions(reorderedProducts);

  try {
    dragSaving.value = true;
    products.value = optimisticProducts;
    dragProducts.value = optimisticProducts;
    reorderProducts.value = optimisticProducts;
    reorderProductsLoaded.value = true;

    const { error } = await supabase.rpc("move_product_shop_position_to", {
      p_product_id: draggedProduct.id,
      p_previous_product_id: previousProductId,
      p_next_product_id: nextProductId,
    });

    if (error) throw error;
  } catch (error: unknown) {
    products.value = previousProducts;
    resetDragProducts();
    await loadData();
    if (isReorderMode.value) {
      await refreshReorderProducts();
    }
    alert(error instanceof Error ? error.message : t("admin.unableReorderProduct"));
  } finally {
    dragSaving.value = false;
    dragStartProducts.value = [];
    draggingProductId.value = null;
  }
};

const productDragOptions = computed(() => ({
    animation: 180,
    handle: ".product-drag-handle",
    ghostClass: "product-drag-ghost",
    chosenClass: "product-drag-chosen",
    dragClass: "product-drag-active",
    disabled: isDragOrderingDisabled.value,
    delay: 160,
    delayOnTouchOnly: true,
    touchStartThreshold: 6,
    scroll: true,
    bubbleScroll: true,
    scrollSensitivity: 60,
    scrollSpeed: 10,
    onStart: (event: DraggableEvent<ProductRow>) => {
      if (isDragOrderingDisabled.value) return;
      dragStartProducts.value = [...dragProducts.value];
      draggingProductId.value = event.data?.id ?? null;
    },
    onEnd: reorderDraggedProduct,
  }));

if (import.meta.client) {
  useDraggable(productTableBody, dragProducts, productDragOptions);
  useDraggable(productCardList, dragProducts, productDragOptions);
}

onMounted(async () => {
  await loadData();
  if (isReorderMode.value) {
    await loadReorderProducts();
  }
});
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

:deep(.product-drag-ghost) {
  opacity: 0.45;
  background: rgb(255 77 0 / 0.08);
}

:deep(.product-drag-chosen) {
  box-shadow: inset 0 0 0 1px rgb(255 77 0 / 0.45);
}

:deep(.product-drag-active) {
  cursor: grabbing;
}
</style>
