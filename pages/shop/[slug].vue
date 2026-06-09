<template>
  <section v-if="product" class="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:py-12">
    <div class="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <!-- LEFT SIDE -->
      <div class="space-y-5">
        <!-- Main Image -->
        <div
          class="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]"
        >
          <img
            :src="selectedImage"
            :alt="product.title"
            class="h-[350px] w-full object-cover md:h-[500px] lg:h-[700px]"
          />
        </div>

        <!-- Gallery -->
        <div class="grid grid-cols-4 gap-4">
          <!-- <button
            v-for="image in activeColor?.product_images"
            :key="image.id"
            @click="selectedImage = image.image_url"
            class="overflow-hidden rounded-2xl border transition"
            :class="
              selectedImage === image.image_url
                ? 'border-[#FF4D00]'
                : 'border-white/10'
            "
          >
            <img :src="image.image_url" class="h-24 w-full object-cover" /> 
          </button> -->
        </div>
      </div>

      <!-- RIGHT SIDE -->
      <div class="space-y-8">
        <!-- Breadcrumb -->
        <div class="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <NuxtLink to="/" class="hover:text-white">Home</NuxtLink>

          <span>/</span>

          <NuxtLink to="/shop" class="hover:text-white">Shop</NuxtLink>

          <span>/</span>

          <span class="text-white">
            {{ product.title }}
          </span>
        </div>

        <!-- Category -->
        <p class="uppercase tracking-[0.3em] text-[#FF4D00]">
          {{ product.categories?.name }}
        </p>

        <!-- Title -->
        <h1 class="text-3xl font-black leading-tight md:text-5xl lg:text-6xl">
          {{ product.title }}
        </h1>

        <!-- Rating -->
        <div class="flex items-center gap-3">
          <div class="flex text-[#FF4D00]">★★★★★</div>

          <span class="text-gray-400"> 4.9 (120 Reviews) </span>
        </div>

        <!-- Price -->
        <div class="flex flex-wrap items-center gap-4">
          <span class="text-4xl font-black text-white">
            ${{ product.price }}
          </span>

          <span
            v-if="product.old_price"
            class="text-2xl text-gray-500 line-through"
          >
            ${{ product.old_price }}
          </span>
        </div>

        <!-- Description -->
        <p class="max-w-2xl text-lg leading-relaxed text-gray-400">
          {{ product.description }}
        </p>

        <!-- COLORS -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold">Colors</h3>

            <span class="text-gray-400">
              {{ selectedColor?.name }}
            </span>
          </div>

          <div class="flex flex-wrap gap-4">
            <button
              v-for="color in product.product_colors"
              :key="color.id"
              @click="changeColor(color)"
              class="overflow-hidden rounded-2xl border-2 transition"
              :class="
                selectedColor?.id === color.id
                  ? 'border-[#FF4D00]'
                  : 'border-white/10'
              "
            >
              <img
                :src="color.product_images?.[0]?.image_url"
                :alt="color.name"
                class="h-20 w-20 object-cover"
              />
            </button>
          </div>
        </div>

        <!-- SIZES -->
        <div class="space-y-4">
          <h3 class="text-lg font-bold">Size</h3>

          <div class="flex flex-wrap gap-3">
            <button
              v-for="size in product.product_sizes"
              :key="size.id"
              :disabled="!size.in_stock"
              class="min-w-[70px] rounded-2xl border px-5 py-3 font-bold transition"
              :class="
                selectedSize === size.size
                  ? 'border-[#FF4D00] bg-[#FF4D00] text-white'
                  : size.in_stock
                    ? 'border-white/10 hover:border-[#FF4D00]'
                    : 'cursor-not-allowed border-white/5 text-gray-600 line-through'
              "
              @click="selectedSize = size.size"
            >
              {{ size.size }}
            </button>
          </div>
        </div>

        <!-- Quantity -->
        <div class="space-y-4">
          <h3 class="text-lg font-bold">Quantity</h3>

          <div
            class="flex w-fit items-center overflow-hidden rounded-2xl border border-white/10"
          >
            <button
              @click="decreaseQty"
              class="px-5 py-3 text-xl transition hover:bg-white/10"
            >
              -
            </button>

            <span class="min-w-[60px] text-center font-bold">
              {{ quantity }}
            </span>

            <button
              @click="quantity++"
              class="px-5 py-3 text-xl transition hover:bg-white/10"
            >
              +
            </button>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex flex-col gap-4 sm:flex-row">
          <button
            @click="
              cartStore.addToCart(
                product,
                selectedColor,
                selectedSize,
                quantity,
                selectedImage,
              )
            "
            class="rounded-2xl bg-[#FF4D00] px-8 py-4 font-bold transition hover:opacity-90"
          >
            Add To Cart
          </button>
          <button
            class="rounded-2xl border border-white/10 px-8 py-4 font-bold transition hover:border-[#FF4D00]"
          >
            Buy Now
          </button>
        </div>

        <!-- Features -->
        <div
          class="grid grid-cols-1 gap-4 border-t border-white/10 pt-8 sm:grid-cols-3"
        >
          <div class="rounded-2xl border border-white/10 p-4">
            <p class="text-sm text-gray-400">Shipping</p>

            <h3 class="mt-2 text-lg font-bold">Free Delivery</h3>
          </div>

          <div class="rounded-2xl border border-white/10 p-4">
            <p class="text-sm text-gray-400">Quality</p>

            <h3 class="mt-2 text-lg font-bold">Premium Build</h3>
          </div>

          <div class="rounded-2xl border border-white/10 p-4">
            <p class="text-sm text-gray-400">Support</p>

            <h3 class="mt-2 text-lg font-bold">24/7 Support</h3>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- Related Products -->
  <section
    v-if="relatedProducts.length"
    class="mx-auto mt-20 max-w-7xl px-4 md:px-6"
  >
    <div class="mb-10 flex items-center justify-between">
      <div>
        <p class="text-sm uppercase tracking-[0.3em] text-[#FF4D00]">
          More Gear
        </p>

        <h2 class="mt-3 text-4xl font-black text-white">Related Products</h2>
      </div>

      <NuxtLink
        to="/shop"
        class="rounded-2xl border border-white/10 px-6 py-3 transition hover:border-[#FF4D00]"
      >
        View All
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <ShopProductCard
        v-for="item in relatedProducts"
        :key="item.id"
        :product="item"
      />
    </div>
  </section>

  <div v-else class="flex min-h-[60vh] items-center justify-center text-center">
    <div>
      <h2 class="text-4xl font-black">Product Not Found</h2>

      <p class="mt-4 text-gray-400">This product does not exist.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute } from "vue-router";

import { useCartStore } from "../../stores/cart";
import { useProductsStore } from "../../stores/products";

const cartStore = useCartStore();
const productsStore = useProductsStore();
const route = useRoute();

const product = ref<any>(null);
const relatedProducts = ref<any[]>([]);

const selectedColor = ref<any>(null);
const selectedImage = ref("");
const selectedSize = ref("");
const quantity = ref(1);

onMounted(async () => {
  product.value = await productsStore.getProductBySlug(
    route.params.slug as string,
  );

  if (!product.value) return;

  // Default Color
  if (product.value.product_colors?.length) {
    selectedColor.value = product.value.product_colors[0];

    selectedImage.value =
      selectedColor.value.product_images?.[0]?.image_url ||
      product.value.cover_image;
  } else {
    selectedImage.value = product.value.cover_image;
  }

  // Default Size
  if (product.value.product_sizes?.length) {
    selectedSize.value =
      product.value.product_sizes.find((size: any) => size.in_stock)?.size ||
      "";
  }

  // Related Products
  if (product.value.categories) {
    relatedProducts.value = await productsStore.getRelatedProducts(
      product.value.category_id,
      product.value.id,
    );
  }
});

const activeColor = computed(() => selectedColor.value);

const changeColor = (color: any) => {
  selectedColor.value = color;

  selectedImage.value =
    color.product_images?.[0]?.image_url || product.value.cover_image;
};

const decreaseQty = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const increaseQty = () => {
  quantity.value++;
};

const handleAddToCart = () => {
  if (!product.value) return;

  cartStore.addToCart(
    product.value,
    selectedColor.value?.name || "",
    selectedSize.value,
    quantity.value,
    selectedImage.value,
  );
};
</script>
