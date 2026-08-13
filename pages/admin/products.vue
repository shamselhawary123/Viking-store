<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">Catalog</p>
        <h2 class="mt-2 text-3xl font-black">Products</h2>
      </div>

      <button class="rounded-2xl bg-[#FF4D00] px-5 py-3 font-bold text-white transition hover:opacity-90" @click="openCreate">
        Add Product
      </button>
    </div>

    <div class="grid gap-3 rounded-3xl border border-white/10 bg-[#111111] p-4 md:grid-cols-[1fr_14rem_12rem_12rem]">
      <input v-model="search" type="search" placeholder="Search products..." class="field" />
      <select v-model.number="categoryFilter" class="field">
        <option :value="0">All Categories</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
      </select>
      <select v-model="stockFilter" class="field">
        <option value="all">All Statuses</option>
        <option value="in">In stock</option>
        <option value="out">Out of stock</option>
      </select>
      <select v-model="sortBy" class="field">
        <option value="newest">Newest</option>
        <option value="name">Name</option>
        <option value="price-asc">Price Low</option>
        <option value="price-desc">Price High</option>
      </select>
    </div>

    <div class="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[1080px] text-left text-sm">
          <thead class="bg-black text-gray-500">
            <tr>
              <th class="px-5 py-4">Product</th>
              <th class="px-5 py-4">Category</th>
              <th class="px-5 py-4">Price (EGP)</th>
              <th class="px-5 py-4">Stock</th>
              <th class="px-5 py-4">Status</th>
              <th class="px-5 py-4">Created</th>
              <th class="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-for="product in visibleProducts" :key="product.id">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <img :src="product.cover_image || firstProductImage(product) || '/logo.png'" alt="" class="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <p class="font-bold">{{ product.title }}</p>
                    <p class="text-xs text-gray-500">{{ product.slug }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 text-gray-300">{{ product.categories?.name || "Uncategorized" }}</td>
              <td class="px-5 py-4">
                <span class="font-black text-[#FF4D00]">{{ formatProductPrice(product.price) }}</span>
                <span v-if="product.old_price" class="ml-2 text-gray-500 line-through">{{ formatProductPrice(product.old_price) }}</span>
              </td>
              <td class="px-5 py-4 text-gray-300">{{ inStockCount(product) }} / {{ product.product_sizes?.length || 0 }}</td>
              <td class="px-5 py-4">
                <span class="rounded-full border px-3 py-1 text-xs font-black" :class="inStockCount(product) ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-red-400/30 bg-red-400/10 text-red-300'">
                  {{ inStockCount(product) ? "In stock" : "Out of stock" }}
                </span>
              </td>
              <td class="px-5 py-4 text-gray-400">{{ formatDate(product.created_at) }}</td>
              <td class="px-5 py-4">
                <div class="flex justify-end gap-2">
                  <button class="rounded-xl border border-white/10 px-4 py-2 font-bold transition hover:border-[#FF4D00]" @click="openEdit(product)">
                    Edit
                  </button>
                  <button class="rounded-xl border border-red-500/40 px-4 py-2 font-bold text-red-400 transition hover:bg-red-500 hover:text-white" @click="deleteProduct(product)">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-col gap-3 border-t border-white/10 p-4 md:flex-row md:items-center md:justify-between">
        <p class="text-sm text-gray-500">Showing {{ visibleProducts.length }} of {{ filteredProducts.length }}</p>
        <button v-if="visibleProducts.length < filteredProducts.length" class="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold transition hover:border-[#FF4D00]" @click="limit += pageSize">
          Load More
        </button>
      </div>

      <p v-if="loading" class="p-6 text-sm text-gray-500">Loading products...</p>
      <p v-else-if="!filteredProducts.length" class="p-6 text-sm text-gray-500">No products found.</p>
    </div>

    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <form class="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111111] p-6" @submit.prevent="saveProduct">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-bold uppercase tracking-[0.25em] text-[#FF4D00]">{{ editingId ? "Edit Product" : "Create Product" }}</p>
            <h3 class="mt-2 text-2xl font-black">{{ form.name || "Product Details" }}</h3>
          </div>
          <button type="button" class="text-gray-400 hover:text-white" @click="closeModal">Close</button>
        </div>

        <div class="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div class="space-y-5">
            <section class="rounded-2xl border border-white/10 bg-black p-5">
              <h4 class="font-black">Product</h4>
              <div class="mt-4 grid gap-4 md:grid-cols-2">
                <label class="block">
                  <span class="field-label">Name</span>
                  <input v-model="form.name" required class="field mt-2" />
                </label>
                <label class="block">
                  <span class="field-label">Slug</span>
                  <input v-model="form.slug" required class="field mt-2" />
                </label>
                <label class="block">
                  <span class="field-label">Price (EGP)</span>
                  <input v-model.number="form.price" required type="number" min="0" step="0.01" class="field mt-2" />
                </label>
                <label class="block">
                  <span class="field-label">Old Price (EGP)</span>
                  <input v-model.number="form.old_price" type="number" min="0" step="0.01" class="field mt-2" />
                </label>
                <label class="block md:col-span-2">
                  <span class="field-label">Category</span>
                  <select v-model.number="form.category_id" required class="field mt-2">
                    <option :value="0" disabled>Select category</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                  </select>
                </label>
                <label class="block md:col-span-2">
                  <span class="field-label">Description</span>
                  <textarea v-model="form.description" rows="4" class="field mt-2" />
                </label>
              </div>
            </section>

            <section class="rounded-2xl border border-white/10 bg-black p-5">
              <div class="flex items-center justify-between gap-3">
                <h4 class="font-black">Sizes</h4>
                <button type="button" class="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold hover:border-[#FF4D00]" @click="addSize">
                  Add Size
                </button>
              </div>
              <div class="mt-4 space-y-3">
                <div v-for="(size, index) in sizes" :key="size.key" class="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <input v-model="size.size" placeholder="S, M, L, XL..." class="field" />
                  <label class="flex items-center gap-2 text-sm font-bold text-gray-300">
                    <input v-model="size.in_stock" type="checkbox" class="h-4 w-4 accent-[#FF4D00]" />
                    In stock
                  </label>
                  <button type="button" class="rounded-xl border border-red-500/40 px-3 py-2 text-sm font-bold text-red-300" @click="removeSize(index)">
                    Remove
                  </button>
                </div>
                <p v-if="!sizes.length" class="text-sm text-gray-500">No sizes configured.</p>
              </div>
            </section>
          </div>

          <section class="rounded-2xl border border-white/10 bg-black p-5">
            <div class="flex items-center justify-between gap-3">
              <h4 class="font-black">Colors & Images</h4>
              <button type="button" class="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold hover:border-[#FF4D00]" @click="addColor">
                Add Color
              </button>
            </div>

            <div class="mt-4 space-y-4">
              <div v-for="(color, colorIndex) in colors" :key="color.key" class="rounded-2xl border border-white/10 bg-[#111111] p-4">
                <div class="grid gap-3 md:grid-cols-[1fr_8rem_auto] md:items-end">
                  <label class="block">
                    <span class="field-label">Color Name</span>
                    <input v-model="color.name" placeholder="Black" class="field mt-2" />
                  </label>
                  <label class="block">
                    <span class="field-label">Value</span>
                    <input v-model="color.value" type="color" class="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black p-1" />
                  </label>
                  <button type="button" class="rounded-xl border border-red-500/40 px-3 py-2 text-sm font-bold text-red-300" @click="removeColor(colorIndex)">
                    Remove
                  </button>
                </div>

                <div class="mt-4">
                  <label class="inline-flex cursor-pointer rounded-xl border border-white/10 px-3 py-2 text-sm font-bold hover:border-[#FF4D00]">
                    Select Images
                    <input type="file" accept="image/*" multiple class="hidden" @change="selectImages(colorIndex, $event)" />
                  </label>
                  <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div v-for="(image, imageIndex) in color.images" :key="image.key" class="relative overflow-hidden rounded-xl border border-white/10">
                      <button type="button" class="absolute right-2 top-2 z-10 rounded-lg bg-black/80 px-2 py-1 text-xs font-bold text-red-300" @click="removeImage(colorIndex, imageIndex)">
                        Remove
                      </button>
                      <button type="button" class="absolute bottom-2 left-2 z-10 rounded-lg bg-black/80 px-2 py-1 text-xs font-bold text-white" @click="form.cover_image = image.preview">
                        Main
                      </button>
                      <img :src="image.preview" alt="" class="h-28 w-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="!colors.length" class="text-sm text-gray-500">Add at least one color before uploading images.</p>
            </div>
          </section>
        </div>

        <p v-if="successMessage" class="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{{ successMessage }}</p>
        <p v-if="errorMessage" class="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{{ errorMessage }}</p>

        <div class="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
          <button type="button" class="rounded-2xl border border-white/10 px-5 py-3 font-bold" @click="closeModal">Cancel</button>
          <button type="submit" :disabled="saving" class="rounded-2xl bg-[#FF4D00] px-5 py-3 font-bold text-white disabled:opacity-50">
            {{ saving ? "Saving..." : "Save Product" }}
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { buildProductImagePath, buildProductPayload, formatDate } from "../../utils/admin";

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
  price: number;
  old_price?: number | null;
  cover_image?: string;
  category_id?: number;
  created_at?: string;
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
const sortBy = ref("newest");
const limit = ref(12);
const pageSize = 12;
const errorMessage = ref("");
const successMessage = ref("");
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

  return result.sort((a, b) => {
    if (sortBy.value === "name") return a.title.localeCompare(b.title);
    if (sortBy.value === "price-asc") return Number(a.price || 0) - Number(b.price || 0);
    if (sortBy.value === "price-desc") return Number(b.price || 0) - Number(a.price || 0);
    return Number(b.id || 0) - Number(a.id || 0);
  });
});

const visibleProducts = computed(() => filteredProducts.value.slice(0, limit.value));

watch([search, categoryFilter, stockFilter, sortBy], () => {
  limit.value = pageSize;
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

const loadData = async () => {
  loading.value = true;

  const [{ data: productsData, error: productsError }, { data: categoriesData, error: categoriesError }] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(id, name), product_colors(*, product_images(*)), product_sizes(*)")
      .order("id", { ascending: false }),
    supabase.from("categories").select("id, name").order("id"),
  ]);

  if (productsError) alert(productsError.message);
  if (categoriesError) alert(categoriesError.message);

  products.value = (productsData || []) as ProductRow[];
  categories.value = (categoriesData || []) as CategoryRow[];
  loading.value = false;
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
  if (!form.value.name.trim()) return "Product name is required.";
  if (!form.value.slug.trim()) return "Product slug is required.";
  if (!form.value.category_id) return "Category is required.";
  if (Number(form.value.price) < 0) return "Price must be zero or more.";

  const cleanSizes = sizes.value.map((size) => size.size.trim()).filter(Boolean);
  if (new Set(cleanSizes.map((size) => size.toLowerCase())).size !== cleanSizes.length) {
    return "Duplicate sizes are not allowed.";
  }

  const invalidColor = colors.value.find((color) => color.name.trim() && !color.value.trim());
  if (invalidColor) return `Color value is required for ${invalidColor.name}.`;

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
    successMessage.value = "Product saved.";
    setTimeout(() => closeModal(), 500);
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : "Unable to save product";
  } finally {
    saving.value = false;
  }
};

const deleteProduct = async (product: ProductRow) => {
  if (!confirm(`Delete ${product.title}? This cannot be undone.`)) return;

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
  } catch (error: unknown) {
    alert(error instanceof Error ? error.message : "Unable to delete product");
  } finally {
    saving.value = false;
  }
};

onMounted(loadData);
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
