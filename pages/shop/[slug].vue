<template>
  <section v-if="product" class="container-premium section-premium">
    <div class="grid grid-cols-1 gap-10 lg:grid-cols-[1.12fr_0.88fr]">
      <div class="space-y-4">
        <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">
          <img :src="selectedImage" :alt="product.title" class="h-[360px] w-full object-cover md:h-[560px] lg:h-[680px]" />
          <div v-if="product.badge" class="absolute left-5 top-5 rounded-full bg-[#FF4D00] px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
            {{ product.badge }}
          </div>
        </div>

        <div v-if="galleryImages.length" class="grid grid-cols-4 gap-3">
          <button
            v-for="image in galleryImages"
            :key="image"
            class="overflow-hidden rounded-xl border transition"
            :class="selectedImage === image ? 'border-[#FF4D00]' : 'border-white/10 hover:border-[#FF4D00]/70'"
            :aria-label="`View ${product.title} image`"
            @click="selectedImage = image"
          >
            <img :src="image" :alt="product.title" class="h-24 w-full object-cover" />
          </button>
        </div>
      </div>

      <div class="lg:sticky lg:top-28 lg:self-start">
        <div class="space-y-7">
          <nav class="flex flex-wrap items-center gap-2 text-sm text-neutral-500" aria-label="Breadcrumb">
            <NuxtLink to="/" class="premium-link">Home</NuxtLink>
            <Icon name="i-heroicons-chevron-right" class="text-xs" />
            <NuxtLink to="/shop" class="premium-link">Shop</NuxtLink>
            <Icon name="i-heroicons-chevron-right" class="text-xs" />
            <span class="text-white">{{ product.title }}</span>
          </nav>

          <div>
            <p class="eyebrow">{{ product.categories?.name || "Combat Gear" }}</p>
            <h1 class="mt-3 text-4xl font-black leading-tight md:text-6xl">{{ product.title }}</h1>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <div class="flex text-[#FF4D00]" aria-label="Rated 5 out of 5">
              <Icon v-for="star in 5" :key="star" name="i-heroicons-star-solid" />
            </div>
            <span class="text-neutral-400">4.9 (120 reviews)</span>
          </div>

          <div class="flex flex-wrap items-center gap-4">
            <span class="text-4xl font-black text-white">${{ product.price }}</span>
            <span v-if="product.old_price" class="text-2xl text-neutral-500 line-through">${{ product.old_price }}</span>
            <span class="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-bold text-emerald-300">In stock</span>
          </div>

          <p class="max-w-2xl text-lg leading-8 text-neutral-400">{{ product.description }}</p>

          <div v-if="product.product_colors?.length" class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-black">Color</h3>
              <span class="text-neutral-400">{{ selectedColor?.name }}</span>
            </div>

            <div class="flex flex-wrap gap-3">
              <button
                v-for="color in product.product_colors"
                :key="color.id"
                class="overflow-hidden rounded-xl border-2 transition"
                :class="selectedColor?.id === color.id ? 'border-[#FF4D00]' : 'border-white/10 hover:border-[#FF4D00]/70'"
                @click="changeColor(color)"
              >
                <img :src="color.product_images?.[0]?.image_url || product.cover_image" :alt="color.name" class="h-20 w-20 object-cover" />
              </button>
            </div>
          </div>

          <div v-if="product.product_sizes?.length" class="space-y-4">
            <h3 class="text-lg font-black">Size</h3>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="size in product.product_sizes"
                :key="size.id"
                :disabled="!size.in_stock"
                class="min-w-[70px] rounded-xl border px-5 py-3 font-black transition disabled:cursor-not-allowed"
                :class="
                  selectedSize === size.size
                    ? 'border-[#FF4D00] bg-[#FF4D00] text-white'
                    : size.in_stock
                      ? 'border-white/10 hover:border-[#FF4D00]'
                      : 'border-white/5 text-neutral-600 line-through'
                "
                @click="selectedSize = size.size"
              >
                {{ size.size }}
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-black">Quantity</h3>
            <div class="flex w-fit items-center overflow-hidden rounded-full border border-white/10">
              <button class="flex h-12 w-12 items-center justify-center text-xl transition hover:bg-white/10" aria-label="Decrease quantity" @click="decreaseQty">
                <Icon name="i-heroicons-minus" />
              </button>
              <span class="flex h-12 min-w-16 items-center justify-center border-x border-white/10 font-black">{{ quantity }}</span>
              <button class="flex h-12 w-12 items-center justify-center text-xl transition hover:bg-white/10" aria-label="Increase quantity" @click="quantity++">
                <Icon name="i-heroicons-plus" />
              </button>
            </div>
          </div>

          <div class="hidden flex-col gap-3 sm:flex sm:flex-row">
            <button class="premium-button premium-button-primary flex-1" @click="handleAddToCart">
              <Icon name="i-heroicons-shopping-bag" />
              Add To Cart
            </button>
            <button class="premium-button premium-button-secondary flex-1" @click="handleBuyNow">
              Buy Now
            </button>
          </div>

          <div class="grid grid-cols-1 gap-3 border-t border-white/10 pt-7 sm:grid-cols-3">
            <div v-for="feature in features" :key="feature.title" class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Icon :name="feature.icon" class="text-2xl text-[#FF4D00]" />
              <p class="mt-3 text-sm text-neutral-400">{{ feature.label }}</p>
              <h3 class="mt-1 font-black">{{ feature.title }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section v-if="relatedProducts.length" class="container-premium pb-24">
    <div class="mb-10 flex items-end justify-between gap-5">
      <div>
        <p class="eyebrow">More Gear</p>
        <h2 class="display-heading mt-3 text-5xl text-white md:text-6xl">Related Products</h2>
      </div>
      <NuxtLink to="/shop" class="premium-button premium-button-secondary hidden sm:inline-flex">View All</NuxtLink>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <ShopProductCard v-for="item in relatedProducts" :key="item.id" :product="item" />
    </div>
  </section>

  <div v-else-if="!loading && !product" class="container-premium flex min-h-[60vh] items-center justify-center py-20 text-center">
    <div class="premium-panel rounded-2xl p-10">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black text-[#FF4D00]">
        <Icon name="i-heroicons-exclamation-triangle" class="text-3xl" />
      </div>
      <h2 class="mt-6 text-4xl font-black">Product Not Found</h2>
      <p class="mt-4 text-neutral-400">This product does not exist or is no longer available.</p>
      <NuxtLink to="/shop" class="premium-button premium-button-primary mt-8">Back To Shop</NuxtLink>
    </div>
  </div>

  <div v-if="product" class="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 p-4 backdrop-blur sm:hidden">
    <div class="grid grid-cols-2 gap-3">
      <button class="premium-button premium-button-secondary" @click="handleBuyNow">Buy Now</button>
      <button class="premium-button premium-button-primary" @click="handleAddToCart">Add To Cart</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useCartStore } from "../../stores/cart";
import { useProductsStore } from "../../stores/products";

const cartStore = useCartStore(usePinia());
const productsStore = useProductsStore(usePinia());
const route = useRoute();
const router = useRouter();

const product = ref<any>(null);
const relatedProducts = ref<any[]>([]);
const selectedColor = ref<any>(null);
const selectedImage = ref("");
const selectedSize = ref("");
const quantity = ref(1);
const loading = ref(true);

const features = [
  { icon: "i-heroicons-truck", label: "Shipping", title: "Free Delivery" },
  { icon: "i-heroicons-shield-check", label: "Quality", title: "Premium Build" },
  { icon: "i-heroicons-chat-bubble-left-right", label: "Support", title: "Fast Help" },
];

const galleryImages = computed(() => {
  const images = selectedColor.value?.product_images?.map((image: any) => image.image_url).filter(Boolean) || [];
  return images.length ? images : [product.value?.cover_image].filter(Boolean);
});

onMounted(async () => {
  try {
    product.value = await productsStore.getProductBySlug(route.params.slug as string);

    if (!product.value) return;

    if (product.value.product_colors?.length) {
      selectedColor.value = product.value.product_colors[0];
      selectedImage.value = selectedColor.value.product_images?.[0]?.image_url || product.value.cover_image;
    } else {
      selectedImage.value = product.value.cover_image;
    }

    if (product.value.product_sizes?.length) {
      selectedSize.value = product.value.product_sizes.find((size: any) => size.in_stock)?.size || "";
    }

    if (product.value.categories) {
      relatedProducts.value = await productsStore.getRelatedProducts(product.value.category_id, product.value.id);
    }
  } finally {
    loading.value = false;
  }
});

const changeColor = (color: any) => {
  selectedColor.value = color;
  selectedImage.value = color.product_images?.[0]?.image_url || product.value.cover_image;
};

const decreaseQty = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const handleAddToCart = () => {
  if (!product.value || !selectedSize.value) return;

  cartStore.addToCart(product.value, selectedColor.value, selectedSize.value, quantity.value, selectedImage.value);
  cartStore.openCart();
};

const handleBuyNow = () => {
  if (!product.value || !selectedSize.value) return;

  cartStore.addToCart(product.value, selectedColor.value, selectedSize.value, quantity.value, selectedImage.value);
  router.push("/checkout");
};
</script>
