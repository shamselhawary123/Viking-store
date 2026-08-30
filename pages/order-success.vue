<template>
  <section class="container-premium section-premium">
    <div class="premium-panel relative mx-auto max-w-4xl overflow-hidden rounded-2xl p-8 text-center md:p-14">
      <img
        src="https://images.unsplash.com/photo-1517438476312-10d79c077509?q=60&w=900&auto=format&fit=crop"
        alt=""
        width="900"
        height="600"
        class="absolute inset-0 h-full w-full object-cover opacity-15"
        loading="lazy"
        decoding="async"
      />
      <div class="relative">
        <div class="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
          <Icon name="i-heroicons-check-circle-solid" class="text-6xl" />
        </div>

        <p class="eyebrow mt-8">{{ t('pages.orderSuccess') }}</p>
        <h1 class="display-heading mt-4 text-6xl text-white md:text-8xl">{{ t('pages.successTitle') }}</h1>
        <p class="mx-auto mt-5 max-w-2xl text-lg leading-8 text-neutral-300">
          {{ t('pages.orderSuccessLong') }}
        </p>

        <div class="mx-auto mt-8 max-w-md rounded-2xl border border-white/10 bg-black/40 p-5">
          <p class="text-sm font-black uppercase tracking-[0.18em] text-neutral-500">{{ t('orders.orderNumber') }}</p>
          <p class="mt-2 break-all text-2xl font-black text-[#CF1D1D]">{{ orderNumber }}</p>
        </div>

        <div class="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <NuxtLink to="/shop" class="premium-button premium-button-primary">{{ t('cart.continueShopping') }}</NuxtLink>
          <NuxtLink to="/profile/orders" class="premium-button premium-button-secondary">{{ t('orders.trackOrder') }}</NuxtLink>
          <a v-if="orderWhatsappLink" :href="orderWhatsappLink" target="_blank" rel="noopener" class="premium-button premium-button-secondary">
            <Icon name="simple-icons:whatsapp" />
            {{ t('payments.orderWhatsapp') }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { buildOrderWhatsAppLink } from "../utils/whatsapp";

const route = useRoute();
const supabase = useSupabase();
const { locale, t } = useI18n();
const orderNumber = computed(() => String(route.query.order || t("pages.pendingConfirmation")));
const whatsappNumber = ref("");
const orderWhatsappLink = computed(() =>
  buildOrderWhatsAppLink({
    phoneNumber: whatsappNumber.value,
    orderNumber: orderNumber.value,
    locale: locale.value,
  }),
);

onMounted(async () => {
  const { data } = await supabase
    .from("payment_settings")
    .select("whatsapp_number")
    .eq("id", true)
    .single();

  whatsappNumber.value = data?.whatsapp_number || "";
});
</script>
