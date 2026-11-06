<template>
  <div
    class="screen relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6"
  >
    <!-- Content -->
    <main class="relative z-10 w-full max-w-125 text-center">
      <h6
        class="mb-6 text-[clamp(100px,25vw,180px)] font-bold leading-none tracking-[-0.08em]"
      >
        4<span class="text-brand drop-shadow-[0_0_35px_rgba(66,214,164,0.3)]"
          >0</span
        >4
      </h6>

      <h2 class="mb-3 text-2xl font-semibold tracking-tight">
        Oops! Wrong keys.
      </h2>

      <p
        class="mx-auto mb-8 max-w-85 text-[15px] leading-relaxed text-muted-foreground"
      >
        Looks like you've wandered off the keyboard. This page doesn't exist.
      </p>

      <RouterLink
        to="/"
        class="group inline-flex items-center gap-2.5 rounded-xl border border-border px-5 py-3 text-sm font-medium text-foreground hover:text-primary-foreground transition-all duration-500 ease-in-out hover:-translate-y-0.5 hover:bg-primary"
      >
        <span
          class="text-lg text-brand transition-transform group-hover:-translate-x-1"
        >
          ←
        </span>
        Back to home
      </RouterLink>
    </main>
  </div>
</template>
