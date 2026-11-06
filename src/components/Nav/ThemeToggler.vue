<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
import {
  ThemeToggler,
  type ThemeSelection,
} from "@animate-ui/vue/primitives/effects/theme-toggler";
import Sun from "../animate-ui/icons/Sun.vue";
import Moon from "../animate-ui/icons/Moon.vue";

const { store, system } = useColorMode();
</script>

<template>
  <ThemeToggler
    :theme="store as ThemeSelection"
    :resolved-theme="system === 'dark' || store === 'dark' ? 'dark' : 'light'"
    :set-theme="(theme: any) => (store = theme === 'system' ? 'auto' : theme)"
  >
    <template #default="{ effective, toggleTheme }">
      <Sun
        animate-on-hover
        class="w-6"
        @click="toggleTheme(effective === 'dark' ? 'light' : 'dark')"
        v-if="effective === 'dark'"
      />
      <Moon
        animate-on-hover
        class="w-6"
        @click="toggleTheme(effective === 'dark' ? 'light' : 'dark')"
        v-else
      />
    </template>
  </ThemeToggler>
</template>
