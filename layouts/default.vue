<template>
  <div class="min-h-screen text-white">
    <SharedVikingGlobalLoader />
    <SharedAppNavbar />
    <CartDrawer />
    <main class="relative">
      <slot />
    </main>
    <SharedFooter />
  </div>
</template>
