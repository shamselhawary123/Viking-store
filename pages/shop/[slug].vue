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
          <button
            v-for="image in activeColor?.images"
            :key="image"
            @click="selectedImage = image"
            class="overflow-hidden rounded-2xl border transition"
            :class="
              selectedImage === image ? 'border-[#FF4D00]' : 'border-white/10'
            "
          >
            <img :src="image" alt="" class="h-24 w-full object-cover" />
          </button>
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
          {{ product.category }}
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
            v-if="product.oldPrice"
            class="text-2xl text-gray-500 line-through"
          >
            ${{ product.oldPrice }}
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
              v-for="color in product.colors"
              :key="color.name"
              @click="changeColor(color)"
              class="overflow-hidden rounded-2xl border-2 transition"
              :class="
                selectedColor?.name === color.name
                  ? 'border-[#FF4D00]'
                  : 'border-white/10'
              "
            >
              <img
                :src="color.images[0]"
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
              v-for="size in product.sizes"
              :key="size.value"
              :disabled="!size.inStock"
              class="min-w-[70px] rounded-2xl border px-5 py-3 font-bold transition"
              :class="
                selectedSize === size.value
                  ? 'border-[#FF4D00] bg-[#FF4D00] text-white'
                  : size.inStock
                    ? 'border-white/10 hover:border-[#FF4D00]'
                    : 'cursor-not-allowed border-white/5 text-gray-600 line-through'
              "
              @click="selectedSize = size.value"
            >
              {{ size.value }}
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

  <div v-else class="flex min-h-[60vh] items-center justify-center text-center">
    <div>
      <h2 class="text-4xl font-black">Product Not Found</h2>

      <p class="mt-4 text-gray-400">This product does not exist.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import { products } from "../../data/products";
import { useCartStore } from "../../stores/cart";

const cartStore = useCartStore();

const route = useRoute();

const product = products.find((item) => item.slug === route.params.slug);

const selectedColor = ref(product?.colors?.[0]);

const selectedImage = ref(product?.colors?.[0]?.images?.[0] || "");

const selectedSize = ref(
  product?.sizes?.find((size) => size.inStock)?.value || "",
);

const quantity = ref(1);

const activeColor = computed(() => selectedColor.value);

const changeColor = (color: any) => {
  selectedColor.value = color;

  selectedImage.value = color.images[0];
};

const decreaseQty = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const handleAddToCart = () => {
  if (!product) return;

  cartStore.addToCart(
    product,
    selectedColor.value?.name,
    selectedSize.value,
    quantity.value,
    selectedImage.value,
  );
};
</script>
