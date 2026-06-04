<template>
  <section class="flex min-h-screen items-center justify-center bg-black px-4">
    <div
      class="w-full max-w-md rounded-3xl border border-white/10 bg-[#111111] p-8 text-center"
    >
      <h1 class="text-4xl font-black text-white">Verify Your Email</h1>

      <p class="mt-4 text-gray-400">
        Check your inbox and click the verification link.
      </p>

      <NuxtLink
        to="/auth/login"
        class="mt-8 inline-flex rounded-2xl bg-[#FF4D00] px-6 py-3 font-bold text-white"
      >
        Go To Login
      </NuxtLink>
    </div>
  </section>
</template>
