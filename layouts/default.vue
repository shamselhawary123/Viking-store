<template>
  <div class="min-h-screen overflow-x-hidden text-white">
    <SharedAppNavbar />
    <CartDrawer />
    <main class="relative">
      <slot />
    </main>
    <SharedFooter />
  </div>
</template>
