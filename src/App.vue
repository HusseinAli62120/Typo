<script setup lang="ts">
import { TooltipProvider } from "./components/ui/tooltip";
import { Analytics } from "@vercel/analytics/vue";
</script>

<!-- Body -->
<template>
  <TooltipProvider>
    <Analytics />
    <RouterView />
  </TooltipProvider>
</template>
