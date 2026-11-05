<script setup lang="ts">
import Progress from "./ui/progress/Progress.vue";

const {
  label,
  value,
  metric,
  showProgress = false,
  progressValue = 0,
} = defineProps<{
  label: string;
  value: string;
  metric?: string;
  showProgress?: boolean;
  progressValue?: number;
}>();
</script>

<template>
  <div
    class="px-10 py-5 flex flex-col items-start justify-start space-y-3 text-center bg-card rounded-md border border-border min-w-68.75 hover:-translate-y-1 hover:scale-105 transition-all ease-in-out duration-300"
  >
    <p class="text-muted-foreground font-medium">{{ label }}</p>
    <div class="flex flex-row items-end gap-3">
      <p class="text-5xl font-semibold leading-none">{{ value }}</p>
      <p
        v-if="metric"
        class="text-md text-muted-foreground font-normal leading-none"
      >
        {{ metric }}
      </p>
    </div>
    <Progress v-if="showProgress" :model-value="progressValue" />
  </div>
</template>
