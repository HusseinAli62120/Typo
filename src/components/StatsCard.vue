<script setup lang="ts">
import Progress from "./ui/progress/Progress.vue";

const {
  label,
  value,
  showProgress = false,
  progressValue = 0,
} = defineProps<{
  label: string;
  value: string;
  showProgress?: boolean;
  progressValue?: number;
}>();
</script>

<template>
  <div
    class="px-10 py-5 flex flex-col items-start justify-start space-y-3 text-center bg-card rounded-md border border-border min-w-68.75 hover:-translate-y-1 hover:scale-105 transition-all ease-in-out duration-300"
  >
    <p class="text-muted-foreground">{{ label }}</p>
    <p class="text-5xl font-semibold">{{ value }}</p>
    <Progress v-if="showProgress" :model-value="progressValue" />
  </div>
</template>
