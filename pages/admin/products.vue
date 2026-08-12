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

    <input
      v-model="search"
      type="search"
      placeholder="Search products..."
      class="h-12 w-full rounded-2xl border border-white/10 bg-[#111111] px-4 text-white outline-none transition focus:border-[#FF4D00]"
    />

    <div class="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[900px] text-left text-sm">
          <thead class="bg-black text-gray-500">
            <tr>
              <th class="px-5 py-4">Product</th>
              <th class="px-5 py-4">Category</th>
              <th class="px-5 py-4">Price</th>
              <th class="px-5 py-4">Stock</th>
              <th class="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/10">
            <tr v-for="product in filteredProducts" :key="product.id">
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <img :src="product.cover_image || '/logo.png'" alt="" class="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <p class="font-bold">{{ product.title }}</p>
                    <p class="text-xs text-gray-500">{{ product.slug }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 text-gray-300">{{ product.categories?.name || "Uncategorized" }}</td>
              <td class="px-5 py-4">
                <span class="font-black text-[#FF4D00]">{{ formatCurrency(product.price) }}</span>
                <span v-if="product.old_price" class="ml-2 text-gray-500 line-through">{{ formatCurrency(product.old_price) }}</span>
              </td>
              <td class="px-5 py-4 text-gray-300">{{ productStock(product) }}</td>
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

      <p v-if="!loading && !filteredProducts.length" class="p-6 text-sm text-gray-500">No products found.</p>
    </div>

    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <form class="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111111] p-6" @submit.prevent="saveProduct">
        <div class="flex items-center justify-between gap-4">
          <h3 class="text-2xl font-black">{{ editingId ? "Edit Product" : "Add Product" }}</h3>
          <button type="button" class="text-gray-400 hover:text-white" @click="closeModal">Close</button>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <label class="block">
            <span class="field-label">Name</span>
            <input v-model="form.name" required class="field mt-2" />
          </label>
          <label class="block">
            <span class="field-label">Slug</span>
            <input v-model="form.slug" required class="field mt-2" />
          </label>
          <label class="block">
            <span class="field-label">Price</span>
            <input v-model.number="form.price" required type="number" min="0" step="0.01" class="field mt-2" />
          </label>
          <label class="block">
            <span class="field-label">Sale Price</span>
            <input v-model.number="form.sale_price" type="number" min="0" step="0.01" class="field mt-2" />
          </label>
          <label class="block">
            <span class="field-label">Stock</span>
            <input v-model.number="form.stock" required type="number" min="0" step="1" class="field mt-2" />
          </label>
          <label class="block">
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
          <label class="block md:col-span-2">
            <span class="field-label">Images</span>
            <div class="mt-2 grid gap-3 md:grid-cols-[1fr_auto]">
              <input v-model="form.image" placeholder="Image URL" class="field" />
              <label class="flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold transition hover:border-[#FF4D00]">
                Upload
                <input type="file" accept="image/*" class="hidden" @change="uploadImage" />
              </label>
            </div>
          </label>
        </div>

        <img v-if="form.image" :src="form.image" alt="" class="mt-5 h-36 w-36 rounded-2xl object-cover" />

        <p v-if="errorMessage" class="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{{ errorMessage }}</p>

        <div class="mt-6 flex justify-end gap-3">
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
import { buildProductPayload, formatCurrency } from "../../utils/admin";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

type CategoryRow = {
  id: number;
  name: string;
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
  stock?: number | null;
  cover_image?: string;
  category_id?: number;
  categories?: { name?: string };
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
const errorMessage = ref("");

const form = ref({
  name: "",
  slug: "",
  description: "",
  price: 0,
  sale_price: null as number | null,
  stock: 0,
  category_id: 0,
  image: "",
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

const productStock = (product: ProductRow) => {
  if (typeof product.stock === "number") return product.stock;
  return product.product_sizes?.filter((size) => size.in_stock).length || 0;
};

const loadData = async () => {
  loading.value = true;

  const [{ data: productsData, error: productsError }, { data: categoriesData, error: categoriesError }] = await Promise.all([
    supabase.from("products").select("*, categories(name), product_sizes(*)").order("id", { ascending: false }),
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
    sale_price: null,
    stock: 0,
    category_id: categories.value[0]?.id || 0,
    image: "",
  };
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
    name: product.title,
    slug: product.slug,
    description: product.description || "",
    price: product.price,
    sale_price: product.old_price || null,
    stock: productStock(product),
    category_id: product.category_id || 0,
    image: product.cover_image || "",
  };
  errorMessage.value = "";
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
};

const uploadImage = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    saving.value = true;
    errorMessage.value = "";

    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from("products").upload(fileName, file, {
      upsert: true,
    });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(fileName);

    form.value.image = publicUrl;
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : "Unable to upload image";
  } finally {
    saving.value = false;
    input.value = "";
  }
};

const ensureDefaultSize = async (productId: number, stock: number) => {
  const { data: sizes } = await supabase
    .from("product_sizes")
    .select("id")
    .eq("product_id", productId)
    .limit(1);

  if (sizes?.length) return;

  await supabase.from("product_sizes").insert({
    product_id: productId,
    size: "One Size",
    in_stock: stock > 0,
  });
};

const saveProduct = async () => {
  try {
    saving.value = true;
    errorMessage.value = "";

    const payload = buildProductPayload(form.value);
    let productId = editingId.value;

    if (productId) {
      const { error } = await supabase.from("products").update(payload).eq("id", productId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error) throw error;
      productId = data.id;
    }

    await ensureDefaultSize(productId, form.value.stock);
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

  await supabase.from("product_sizes").delete().eq("product_id", product.id);
  await supabase.from("product_colors").delete().eq("product_id", product.id);
  const { error } = await supabase.from("products").delete().eq("id", product.id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadData();
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
