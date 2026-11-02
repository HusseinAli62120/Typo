<script setup lang="ts">
const { wpm, accuracy, wpmArray, time } = defineProps<{
  wpm: number;
  wpmArray: number[];
  accuracy: number;
  time: string;
  elapsedSeconds: number;
}>();

const emit = defineEmits<{ (emit: "restart"): void }>();
</script>

<template>
  <div class="screen">
    <h1>This is the results page</h1>
    <p>WPM: {{ wpm }}</p>
    <p>Graph: {{ wpmArray.length }}</p>
    <p>Accuracy: {{ accuracy }}</p>
    <p>Time: {{ time }}</p>
    <p>Min: {{ elapsedSeconds }}</p>
    <button @click="emit('restart')">Restart</button>
  </div>
</template>
