<script setup lang="ts">
import ThemeToggler from "./ThemeToggler.vue";
</script>

<template>
  <div
    class="w-full h-[10vh] px-4 py-2 flex flex-row items-center justify-between border-b border-border/50 bg-muted/50"
  >
    <h1 class="text-xl font-semibold text-foreground">Typing speed</h1>
    <ThemeToggler />
  </div>
</template>
