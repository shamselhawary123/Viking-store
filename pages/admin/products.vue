<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">
          Catalog
        </p>
        <h2 class="mt-2 text-3xl font-black">Products</h2>
      </div>

      <button
        class="rounded-2xl bg-[#FF4D00] px-5 py-3 font-bold text-white transition hover:opacity-90"
        @click="openCreate"
      >
        Add Product
      </button>
    </div>

    <div class="rounded-3xl border border-white/10 bg-[#111111] p-4">
      <input
        v-model="search"
        type="search"
        placeholder="Search products..."
        class="h-12 w-full rounded-2xl border border-white/10 bg-black px-4 text-white outline-none transition focus:border-[#FF4D00]"
      />
    </div>

    <div class="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[980px] text-left text-sm">
          <thead class="bg-black text-gray-500">
            <tr>
              <th class="px-5 py-4">Product</th>
              <th class="px-5 py-4">Category</th>
              <th class="px-5 py-4">Price</th>
              <th class="px-5 py-4">Stock</th>
              <th class="px-5 py-4">Colors</th>
              <th class="px-5 py-4">Sizes</th>
              <th class="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-for="product in paginatedProducts" :key="product.id">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="product.cover_image || '/logo.png'"
                    alt=""
                    class="h-12 w-12 rounded-xl object-cover"
                  />
                  <div>
                    <p class="font-bold">{{ product.title }}</p>
                    <p class="text-xs text-gray-500">{{ product.slug }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 text-gray-300">
                {{ product.categories?.name || "Uncategorized" }}
              </td>
              <td class="px-5 py-4">
                <span class="font-black text-[#FF4D00]">${{ product.price }}</span>
                <span v-if="product.old_price" class="ml-2 text-gray-500 line-through">
                  ${{ product.old_price }}
                </span>
              </td>
              <td class="px-5 py-4 text-gray-300">
                {{ inStockCount(product) }} / {{ product.product_sizes?.length || 0 }}
              </td>
              <td class="px-5 py-4 text-gray-300">
                {{ product.product_colors?.length || 0 }}
              </td>
              <td class="px-5 py-4 text-gray-300">
                {{ product.product_sizes?.map((size) => size.size).join(", ") || "-" }}
              </td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-2">
                  <button
                    class="rounded-xl border border-white/10 px-4 py-2 font-bold transition hover:border-[#FF4D00]"
                    @click="openEdit(product)"
                  >
                    Edit
                  </button>
                  <button
                    class="rounded-xl border border-red-500/40 px-4 py-2 font-bold text-red-400 transition hover:bg-red-500 hover:text-white"
                    @click="deleteProduct(product)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="flex flex-col gap-3 border-t border-white/10 p-4 md:flex-row md:items-center md:justify-between"
      >
        <p class="text-sm text-gray-500">
          Showing {{ paginatedProducts.length }} of {{ filteredProducts.length }}
        </p>
        <div class="flex items-center gap-2">
          <button
            class="rounded-xl border border-white/10 px-4 py-2 disabled:opacity-40"
            :disabled="page === 1"
            @click="page--"
          >
            Prev
          </button>
          <span class="px-3 text-sm text-gray-400">{{ page }} / {{ totalPages }}</span>
          <button
            class="rounded-xl border border-white/10 px-4 py-2 disabled:opacity-40"
            :disabled="page === totalPages"
            @click="page++"
          >
            Next
          </button>
        </div>
      </div>

      <p v-if="!loading && !filteredProducts.length" class="p-6 text-sm text-gray-500">
        No products found.
      </p>
    </div>

    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <form
        class="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111111] p-6"
        @submit.prevent="saveProduct"
      >
        <div class="flex items-center justify-between gap-4">
          <h3 class="text-2xl font-black">
            {{ editingId ? "Edit Product" : "Add Product" }}
          </h3>
          <button type="button" class="text-gray-400 hover:text-white" @click="closeModal">
            Close
          </button>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <input v-model="form.title" required placeholder="Title" class="field" />
          <input v-model="form.slug" required placeholder="Slug" class="field" />
          <select v-model.number="form.category_id" required class="field">
            <option :value="0" disabled>Select category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <input v-model="form.badge" placeholder="Badge" class="field" />
          <input v-model.number="form.price" required type="number" min="0" step="0.01" placeholder="Price" class="field" />
          <input v-model.number="form.old_price" type="number" min="0" step="0.01" placeholder="Old price" class="field" />
          <input v-model="form.cover_image" placeholder="Cover image URL" class="field md:col-span-2" />
          <textarea v-model="form.description" rows="4" placeholder="Description" class="field md:col-span-2" />
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-3">
          <div class="rounded-2xl border border-white/10 bg-black p-4">
            <label class="text-sm font-bold text-gray-300">Colors</label>
            <textarea
              v-model="colorsText"
              rows="7"
              placeholder="Black,#000000,image-url&#10;Orange,#FF4D00,image-url"
              class="field mt-3"
            />
          </div>
          <div class="rounded-2xl border border-white/10 bg-black p-4">
            <label class="text-sm font-bold text-gray-300">Sizes In Stock</label>
            <textarea
              v-model="sizesText"
              rows="7"
              placeholder="S&#10;M&#10;L&#10;XL"
              class="field mt-3"
            />
          </div>
          <div class="rounded-2xl border border-white/10 bg-black p-4">
            <label class="text-sm font-bold text-gray-300">Sizes Out Of Stock</label>
            <textarea
              v-model="outOfStockText"
              rows="7"
              placeholder="XXL"
              class="field mt-3"
            />
          </div>
        </div>

        <p v-if="errorMessage" class="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {{ errorMessage }}
        </p>

        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="rounded-2xl border border-white/10 px-5 py-3 font-bold" @click="closeModal">
            Cancel
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="rounded-2xl bg-[#FF4D00] px-5 py-3 font-bold text-white disabled:opacity-50"
          >
            {{ saving ? "Saving..." : "Save Product" }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

type CategoryRow = {
  id: number;
  name: string;
};

type ProductColor = {
  id: number;
  name: string;
  value: string;
  product_images?: { image_url: string }[];
};

type ProductSize = {
  id: number;
  size: string;
  in_stock: boolean;
};

type ProductRow = {
  id: number;
  title: string;
  slug: string;
  description?: string;
  price: number;
  old_price?: number | null;
  badge?: string | null;
  cover_image?: string;
  category_id?: number;
  categories?: { name?: string };
  product_colors?: ProductColor[];
  product_sizes?: ProductSize[];
};

const supabase = useSupabase();
const products = ref<ProductRow[]>([]);
const categories = ref<CategoryRow[]>([]);
const loading = ref(true);
const saving = ref(false);
const modalOpen = ref(false);
const editingId = ref<number | null>(null);
const search = ref("");
const page = ref(1);
const perPage = 8;
const colorsText = ref("");
const sizesText = ref("");
const outOfStockText = ref("");
const errorMessage = ref("");

const form = ref({
  title: "",
  slug: "",
  description: "",
  price: 0,
  old_price: null as number | null,
  badge: "",
  cover_image: "",
  category_id: 0,
});

const filteredProducts = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return products.value;

  return products.value.filter((product) =>
    [product.title, product.slug, product.categories?.name]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term)),
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredProducts.value.length / perPage)),
);

const paginatedProducts = computed(() => {
  const start = (page.value - 1) * perPage;
  return filteredProducts.value.slice(start, start + perPage);
});

watch(search, () => {
  page.value = 1;
});

const inStockCount = (product: ProductRow) =>
  product.product_sizes?.filter((size) => size.in_stock).length || 0;

const loadData = async () => {
  loading.value = true;

  const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(name), product_colors(*, product_images(*)), product_sizes(*)")
      .order("id", { ascending: false }),
    supabase.from("categories").select("id, name").order("id"),
  ]);

  products.value = (productsData || []) as ProductRow[];
  categories.value = (categoriesData || []) as CategoryRow[];
  loading.value = false;
};

const resetForm = () => {
  form.value = {
    title: "",
    slug: "",
    description: "",
    price: 0,
    old_price: null,
    badge: "",
    cover_image: "",
    category_id: categories.value[0]?.id || 0,
  };
  colorsText.value = "";
  sizesText.value = "";
  outOfStockText.value = "";
  editingId.value = null;
  errorMessage.value = "";
};

const openCreate = () => {
  resetForm();
  modalOpen.value = true;
};

const openEdit = (product: ProductRow) => {
  editingId.value = product.id;
  form.value = {
    title: product.title,
    slug: product.slug,
    description: product.description || "",
    price: product.price,
    old_price: product.old_price || null,
    badge: product.badge || "",
    cover_image: product.cover_image || "",
    category_id: product.category_id || 0,
  };
  colorsText.value =
    product.product_colors
      ?.map((color) => `${color.name},${color.value},${color.product_images?.[0]?.image_url || ""}`)
      .join("\n") || "";
  sizesText.value =
    product.product_sizes
      ?.filter((size) => size.in_stock)
      .map((size) => size.size)
      .join("\n") || "";
  outOfStockText.value =
    product.product_sizes
      ?.filter((size) => !size.in_stock)
      .map((size) => size.size)
      .join("\n") || "";
  errorMessage.value = "";
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
};

const parseColors = () =>
  colorsText.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, value, image] = line.split(",").map((item) => item.trim());
      return { name, value, image };
    })
    .filter((color) => color.name && color.value);

const parseSizes = () => [
  ...sizesText.value
    .split("\n")
    .map((size) => size.trim())
    .filter(Boolean)
    .map((size) => ({ size, in_stock: true })),
  ...outOfStockText.value
    .split("\n")
    .map((size) => size.trim())
    .filter(Boolean)
    .map((size) => ({ size, in_stock: false })),
];

const replaceVariants = async (productId: number) => {
  const { data: oldColors } = await supabase
    .from("product_colors")
    .select("id")
    .eq("product_id", productId);

  const colorIds = (oldColors || []).map((color: { id: number }) => color.id);

  if (colorIds.length) {
    await supabase.from("product_images").delete().in("color_id", colorIds);
  }

  await Promise.all([
    supabase.from("product_colors").delete().eq("product_id", productId),
    supabase.from("product_sizes").delete().eq("product_id", productId),
  ]);

  const colors = parseColors();
  for (const color of colors) {
    const { data: insertedColor, error } = await supabase
      .from("product_colors")
      .insert({
        product_id: productId,
        name: color.name,
        value: color.value,
      })
      .select("id")
      .single();

    if (error) throw error;

    if (color.image) {
      await supabase.from("product_images").insert({
        color_id: insertedColor.id,
        image_url: color.image,
      });
    }
  }

  const sizes = parseSizes();
  if (sizes.length) {
    await supabase.from("product_sizes").insert(
      sizes.map((size) => ({
        product_id: productId,
        size: size.size,
        in_stock: size.in_stock,
      })),
    );
  }
};

const saveProduct = async () => {
  try {
    saving.value = true;
    errorMessage.value = "";

    const payload = {
      title: form.value.title,
      slug: form.value.slug,
      description: form.value.description,
      price: form.value.price,
      old_price: form.value.old_price,
      badge: form.value.badge,
      cover_image: form.value.cover_image,
      category_id: form.value.category_id,
    };

    let productId = editingId.value;

    if (productId) {
      const { error } = await supabase.from("products").update(payload).eq("id", productId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error) throw error;
      productId = data.id;
    }

    await replaceVariants(productId);
    await loadData();
    closeModal();
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : "Unable to save product";
  } finally {
    saving.value = false;
  }
};

const deleteProduct = async (product: ProductRow) => {
  if (!confirm(`Delete ${product.title}?`)) return;

  const { data: oldColors } = await supabase
    .from("product_colors")
    .select("id")
    .eq("product_id", product.id);

  const colorIds = (oldColors || []).map((color: { id: number }) => color.id);

  if (colorIds.length) {
    await supabase.from("product_images").delete().in("color_id", colorIds);
  }

  await Promise.all([
    supabase.from("product_colors").delete().eq("product_id", product.id),
    supabase.from("product_sizes").delete().eq("product_id", product.id),
  ]);
  await supabase.from("products").delete().eq("id", product.id);
  await loadData();
};

onMounted(loadData);
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
