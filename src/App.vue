<script setup lang="ts">
import { TooltipProvider } from "./components/ui/tooltip";
</script>

<!-- Body -->
<template>
  <TooltipProvider>
    <RouterView />
  </TooltipProvider>
</template>
