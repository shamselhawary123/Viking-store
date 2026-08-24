<template>
  <section class="flex min-h-screen items-center justify-center bg-black px-4 py-12">
    <div
      class="premium-panel w-full max-w-md rounded-2xl p-8 text-center"
    >
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-black text-[#CF1D1D]">
        <Icon name="i-heroicons-envelope" class="text-3xl" />
      </div>
      <h1 class="mt-6 text-4xl font-black text-white">Verify Your Email</h1>

      <p class="mt-4 text-gray-400">
        Check your inbox and click the verification link.
      </p>

      <NuxtLink
        to="/auth/login"
        class="premium-button premium-button-primary mt-8"
      >
        Go To Login
      </NuxtLink>
    </div>
  </section>
</template>
