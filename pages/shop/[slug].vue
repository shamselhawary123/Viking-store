<template>
  <section v-if="product" class="container-premium section-premium pb-28 sm:pb-16">
    <div class="grid grid-cols-1 gap-10 lg:grid-cols-[1.08fr_0.92fr] xl:gap-14">
      <div class="space-y-4 reveal-up">
        <div
          class="group relative cursor-zoom-in overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-[0_32px_90px_rgba(0,0,0,0.38)]"
          @click="openLightbox"
          @mousemove="handleZoomMove"
          @mouseleave="resetZoom"
          @touchstart.passive="handleTouchStart"
          @touchend.passive="handleTouchEnd"
        >
          <img
            :key="selectedImage"
            :src="selectedImage"
            :alt="product.title"
            class="h-[390px] w-full object-cover transition duration-500 group-hover:scale-110 md:h-[560px] lg:h-[700px]"
            :style="{ transformOrigin: zoomOrigin }"
            loading="eager"
          />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20 opacity-80" />
          <button
            class="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white backdrop-blur transition duration-200 hover:scale-105 hover:border-[#FF4D00] hover:text-[#FF4D00]"
            aria-label="Enlarge product image"
            @click.stop="openLightbox"
          >
            <Icon name="i-heroicons-magnifying-glass-plus" class="text-xl" />
          </button>
          <div v-if="product.badge" class="absolute left-5 top-5 rounded-full bg-[#FF4D00] px-4 py-2 text-xs font-black uppercase tracking-[0.16em]">
            {{ product.badge }}
          </div>
        </div>

        <div v-if="galleryImages.length" class="grid grid-cols-4 gap-3 sm:grid-cols-5">
          <button
            v-for="(image, index) in galleryImages"
            :key="image"
            class="relative overflow-hidden rounded-xl border bg-[#111111] transition duration-300 hover:-translate-y-0.5"
            :class="selectedImage === image ? 'border-[#FF4D00] shadow-[0_0_0_3px_rgba(255,77,0,0.16)]' : 'border-white/10 hover:border-[#FF4D00]/70'"
            :aria-label="`View ${product.title} image`"
            @click="selectImage(index)"
          >
            <img :src="image" :alt="product.title" class="h-24 w-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
          </button>
        </div>
      </div>

      <div class="lg:sticky lg:top-28 lg:self-start">
        <div class="space-y-7 reveal-up">
          <nav class="flex flex-wrap items-center gap-2 text-sm text-neutral-500" aria-label="Breadcrumb">
            <NuxtLink to="/" class="premium-link">Home</NuxtLink>
            <Icon name="i-heroicons-chevron-right" class="text-xs" />
            <NuxtLink to="/shop" class="premium-link">Shop</NuxtLink>
            <Icon name="i-heroicons-chevron-right" class="text-xs" />
            <span class="text-white">{{ product.title }}</span>
          </nav>

          <div>
            <p class="eyebrow">{{ product.categories?.name || "Combat Gear" }}</p>
            <h1 class="mt-3 text-4xl font-black leading-tight text-white md:text-6xl">{{ product.title }}</h1>
          </div>

          <div class="flex flex-wrap items-center gap-3 text-sm">
            <div class="flex text-[#FF4D00]" aria-label="Rated 5 out of 5">
              <Icon v-for="star in 5" :key="star" name="i-heroicons-star-solid" />
            </div>
            <span class="font-bold text-white">4.9</span>
            <span class="text-neutral-400">120 reviews</span>
          </div>

          <div class="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div class="flex flex-wrap items-center gap-4">
              <span class="text-4xl font-black text-white">${{ product.price }}</span>
              <span v-if="oldPrice" class="text-2xl text-neutral-500 line-through">${{ oldPrice }}</span>
              <span v-if="discountPercent" class="rounded-full bg-[#FF4D00] px-3 py-1 text-sm font-black text-white">
                -{{ discountPercent }}%
              </span>
              <span class="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-bold text-emerald-300">
                {{ isAvailable ? "In stock" : "Out of stock" }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div class="rounded-xl border border-white/10 bg-black/30 p-3">
                <p class="text-neutral-500">Category</p>
                <p class="mt-1 font-bold text-white">{{ product.categories?.name || product.category || "Combat Gear" }}</p>
              </div>
              <div v-if="product.sku" class="rounded-xl border border-white/10 bg-black/30 p-3">
                <p class="text-neutral-500">SKU</p>
                <p class="mt-1 font-bold text-white">{{ product.sku }}</p>
              </div>
              <div v-if="brandName" class="rounded-xl border border-white/10 bg-black/30 p-3">
                <p class="text-neutral-500">Brand</p>
                <p class="mt-1 font-bold text-white">{{ brandName }}</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-black/30 p-3">
                <p class="text-neutral-500">Availability</p>
                <p class="mt-1 font-bold text-white">{{ isAvailable ? "Ready to ship" : "Unavailable" }}</p>
              </div>
            </div>
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
                class="flex h-12 w-12 items-center justify-center rounded-full border-2 transition duration-300 hover:-translate-y-0.5 hover:scale-105"
                :class="selectedColor?.id === color.id ? 'border-[#FF4D00] bg-white/10 shadow-[0_0_0_4px_rgba(255,77,0,0.14)]' : 'border-white/15 hover:border-[#FF4D00]/70'"
                :aria-label="`Select ${color.name}`"
                @click="changeColor(color)"
              >
                <span class="h-8 w-8 rounded-full border border-white/20" :style="{ backgroundColor: colorValue(color) }" />
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
                class="min-h-12 min-w-[74px] rounded-xl border px-5 py-3 font-black transition duration-200 disabled:cursor-not-allowed"
                :class="
                  selectedSize === size.size
                    ? 'border-[#FF4D00] bg-[#FF4D00] text-white shadow-[0_14px_34px_rgba(255,77,0,0.22)]'
                    : size.in_stock
                      ? 'border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-[#FF4D00]'
                      : 'border-white/5 bg-white/[0.02] text-neutral-600 line-through'
                "
                @click="selectedSize = size.size"
              >
                {{ size.size }}
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-lg font-black">Quantity</h3>
            <div class="flex w-fit items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
              <button class="flex h-12 w-12 items-center justify-center text-xl transition hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40" :disabled="quantity === 1" aria-label="Decrease quantity" @click="decreaseQty">
                <Icon name="i-heroicons-minus" />
              </button>
              <span class="flex h-12 min-w-16 items-center justify-center border-x border-white/10 font-black">{{ quantity }}</span>
              <button class="flex h-12 w-12 items-center justify-center text-xl transition hover:bg-white/10 active:scale-95" aria-label="Increase quantity" @click="quantity++">
                <Icon name="i-heroicons-plus" />
              </button>
            </div>
          </div>

          <div class="hidden grid-cols-[1fr_1fr_auto] gap-3 sm:grid">
            <button class="premium-button premium-button-primary flex-1 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45" :disabled="!canPurchase || addLoading" @click="handleAddToCart">
              <Icon :name="addLoading ? 'i-heroicons-arrow-path' : 'i-heroicons-shopping-bag'" :class="{ 'animate-spin': addLoading }" />
              {{ addLoading ? "Adding" : "Add To Cart" }}
            </button>
            <button class="premium-button premium-button-secondary flex-1 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45" :disabled="!canPurchase || buyLoading" @click="handleBuyNow">
              <Icon v-if="buyLoading" name="i-heroicons-arrow-path" class="animate-spin" />
              {{ buyLoading ? "Loading" : "Buy Now" }}
            </button>
            <button
              class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#FF4D00] hover:text-[#FF4D00] active:scale-95"
              :aria-label="wishlistStore.isFavorite(product.id) ? 'Remove from wishlist' : 'Add to wishlist'"
              @click="wishlistStore.toggleWishlist(product)"
            >
              <Icon :name="wishlistStore.isFavorite(product.id) ? 'i-heroicons-heart-solid' : 'i-heroicons-heart'" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3 border-t border-white/10 pt-7">
            <div v-for="feature in trustFeatures" :key="feature.title" class="rounded-xl border border-white/10 bg-white/[0.03] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#FF4D00]/55">
              <Icon :name="feature.icon" class="text-2xl text-[#FF4D00]" />
              <h3 class="mt-3 font-black">{{ feature.title }}</h3>
              <p class="mt-1 text-sm leading-6 text-neutral-400">{{ feature.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-16 rounded-2xl border border-white/10 bg-white/[0.03] p-3 md:mt-20">
      <div class="grid grid-cols-2 gap-2 md:flex">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="min-h-12 rounded-xl px-4 py-3 text-sm font-black transition duration-200"
          :class="activeTab === tab.key ? 'bg-[#FF4D00] text-white' : 'text-neutral-400 hover:bg-white/[0.05] hover:text-white'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="p-4 text-neutral-300 md:p-7">
        <div v-if="activeTab === 'description'" class="max-w-4xl text-lg leading-8">
          {{ product.description }}
        </div>
        <div v-else-if="activeTab === 'specifications'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="spec in specifications" :key="spec.label" class="rounded-xl border border-white/10 bg-black/25 p-4">
            <p class="text-sm text-neutral-500">{{ spec.label }}</p>
            <p class="mt-2 font-black text-white">{{ spec.value }}</p>
          </div>
        </div>
        <div v-else-if="activeTab === 'shipping'" class="max-w-3xl leading-8">
          Fast shipping is available at checkout. Delivery options and costs are calculated before payment.
        </div>
        <div v-else class="max-w-3xl leading-8">
          Easy returns are available for eligible unused items. Return details are confirmed during order support.
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

  <section v-if="recentlyViewed.length" class="container-premium pb-24">
    <div class="mb-8">
      <p class="eyebrow">Your Picks</p>
      <h2 class="display-heading mt-3 text-5xl text-white md:text-6xl">Recently Viewed</h2>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <ShopProductCard v-for="item in recentlyViewed" :key="item.id" :product="item" />
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

  <div v-if="product" class="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/90 p-3 backdrop-blur sm:hidden">
    <div class="grid grid-cols-[auto_1fr_1fr] items-center gap-2">
      <div class="pr-1">
        <p class="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-neutral-500">Price</p>
        <p class="text-lg font-black text-white">${{ product.price }}</p>
      </div>
      <button class="premium-button premium-button-secondary min-h-12 rounded-xl px-3 text-sm active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45" :disabled="!canPurchase || buyLoading" @click="handleBuyNow">Buy Now</button>
      <button class="premium-button premium-button-primary min-h-12 rounded-xl px-3 text-sm active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45" :disabled="!canPurchase || addLoading" @click="handleAddToCart">Add To Cart</button>
    </div>
  </div>

  <div v-if="isLightboxOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" @click="isLightboxOpen = false">
    <button class="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition hover:border-[#FF4D00] hover:text-[#FF4D00]" aria-label="Close image" @click="isLightboxOpen = false">
      <Icon name="i-heroicons-x-mark" class="text-2xl" />
    </button>
    <img :src="selectedImage" :alt="product?.title" class="max-h-[88vh] max-w-full rounded-2xl object-contain" @click.stop />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useCartStore } from "../../stores/cart";
import { useProductsStore } from "../../stores/products";
import { useWishlistStore } from "../../stores/wishlist";

const cartStore = useCartStore(usePinia());
const productsStore = useProductsStore(usePinia());
const wishlistStore = useWishlistStore(usePinia());
const route = useRoute();
const router = useRouter();

const product = ref<any>(null);
const relatedProducts = ref<any[]>([]);
const recentlyViewed = ref<any[]>([]);
const selectedColor = ref<any>(null);
const selectedImage = ref("");
const selectedSize = ref("");
const quantity = ref(1);
const loading = ref(true);
const activeTab = ref("description");
const isLightboxOpen = ref(false);
const zoomOrigin = ref("center center");
const touchStartX = ref(0);
const didSwipe = ref(false);
const addLoading = ref(false);
const buyLoading = ref(false);

const trustFeatures = [
  { icon: "i-heroicons-lock-closed", title: "Secure Payment", label: "Protected checkout for every order." },
  { icon: "i-heroicons-truck", title: "Fast Shipping", label: "Quick delivery options at checkout." },
  { icon: "i-heroicons-arrow-path-rounded-square", title: "Easy Returns", label: "Simple support for eligible returns." },
  { icon: "i-heroicons-shield-check", title: "Premium Quality", label: "Built for hard training sessions." },
];

const tabs = [
  { key: "description", label: "Description" },
  { key: "specifications", label: "Specifications" },
  { key: "shipping", label: "Shipping" },
  { key: "returns", label: "Returns" },
];

const galleryImages = computed(() => {
  const images = selectedColor.value?.product_images?.map((image: any) => image.image_url).filter(Boolean) || [];
  return images.length ? images : [product.value?.cover_image || product.value?.image].filter(Boolean);
});

const oldPrice = computed(() => product.value?.old_price || product.value?.oldPrice || null);
const brandName = computed(() => product.value?.brand?.name || product.value?.brands?.name || product.value?.brand_name || product.value?.brand || "");
const isAvailable = computed(() => !product.value?.product_sizes?.length || product.value.product_sizes.some((size: any) => size.in_stock));
const canPurchase = computed(() => Boolean(product.value && selectedSize.value && isAvailable.value));
const discountPercent = computed(() => {
  if (!oldPrice.value || !product.value?.price) return 0;

  return Math.max(0, Math.round(((oldPrice.value - product.value.price) / oldPrice.value) * 100));
});
const specifications = computed(() =>
  [
    { label: "Category", value: product.value?.categories?.name || product.value?.category || "Combat Gear" },
    { label: "Color", value: selectedColor.value?.name || "Default" },
    { label: "Size", value: selectedSize.value || "Select size" },
    { label: "Availability", value: isAvailable.value ? "In stock" : "Out of stock" },
    product.value?.sku ? { label: "SKU", value: product.value.sku } : null,
    brandName.value ? { label: "Brand", value: brandName.value } : null,
  ].filter(Boolean),
);

onMounted(async () => {
  try {
    wishlistStore.loadWishlist();
    loadRecentlyViewed();
    product.value = await productsStore.getProductBySlug(route.params.slug as string);

    if (!product.value) return;

    if (product.value.product_colors?.length) {
      selectedColor.value = product.value.product_colors[0];
      selectedImage.value = selectedColor.value.product_images?.[0]?.image_url || product.value.cover_image || product.value.image;
    } else {
      selectedImage.value = product.value.cover_image || product.value.image;
    }

    if (product.value.product_sizes?.length) {
      selectedSize.value = product.value.product_sizes.find((size: any) => size.in_stock)?.size || "";
    }

    if (product.value.categories) {
      relatedProducts.value = await productsStore.getRelatedProducts(product.value.category_id, product.value.id);
    }

    saveRecentlyViewed();
  } finally {
    loading.value = false;
  }
});

const changeColor = (color: any) => {
  selectedColor.value = color;
  selectedImage.value = color.product_images?.[0]?.image_url || product.value.cover_image || product.value.image;
};

const selectImage = (index: number) => {
  selectedImage.value = galleryImages.value[index] || selectedImage.value;
};

const openLightbox = () => {
  if (didSwipe.value) return;

  isLightboxOpen.value = true;
};

const handleZoomMove = (event: MouseEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  zoomOrigin.value = `${x}% ${y}%`;
};

const resetZoom = () => {
  zoomOrigin.value = "center center";
};

const handleTouchStart = (event: TouchEvent) => {
  touchStartX.value = event.changedTouches[0]?.clientX || 0;
};

const handleTouchEnd = (event: TouchEvent) => {
  const endX = event.changedTouches[0]?.clientX || 0;
  const delta = touchStartX.value - endX;

  if (Math.abs(delta) < 45 || galleryImages.value.length < 2) return;

  didSwipe.value = true;
  const currentIndex = galleryImages.value.indexOf(selectedImage.value);
  const nextIndex = delta > 0 ? currentIndex + 1 : currentIndex - 1;
  selectImage((nextIndex + galleryImages.value.length) % galleryImages.value.length);
  window.setTimeout(() => {
    didSwipe.value = false;
  }, 120);
};

const colorValue = (color: any) => color.value || color.hex || color.color || color.name || "#111111";

const decreaseQty = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const handleAddToCart = () => {
  if (!product.value || !selectedSize.value) return;

  addLoading.value = true;
  cartStore.addToCart(product.value, selectedColor.value, selectedSize.value, quantity.value, selectedImage.value);
  cartStore.openCart();
  window.setTimeout(() => {
    addLoading.value = false;
  }, 350);
};

const handleBuyNow = () => {
  if (!product.value || !selectedSize.value) return;

  buyLoading.value = true;
  cartStore.addToCart(product.value, selectedColor.value, selectedSize.value, quantity.value, selectedImage.value);
  router.push("/checkout");
};

const loadRecentlyViewed = () => {
  if (typeof window === "undefined") return;

  const saved = localStorage.getItem("recentlyViewedProducts");
  recentlyViewed.value = saved ? JSON.parse(saved) : [];
};

const saveRecentlyViewed = () => {
  if (typeof window === "undefined" || !product.value) return;

  const compactProduct = {
    id: product.value.id,
    title: product.value.title,
    slug: product.value.slug,
    price: product.value.price,
    old_price: product.value.old_price,
    oldPrice: product.value.oldPrice,
    cover_image: product.value.cover_image || product.value.image,
    image: product.value.cover_image || product.value.image,
    badge: product.value.badge,
    categories: product.value.categories,
    category: product.value.category,
  };
  const nextItems = [compactProduct, ...recentlyViewed.value.filter((item) => item.id !== product.value.id)].slice(0, 5);

  localStorage.setItem("recentlyViewedProducts", JSON.stringify(nextItems));
  recentlyViewed.value = nextItems.filter((item) => item.id !== product.value.id).slice(0, 4);
};
</script>
