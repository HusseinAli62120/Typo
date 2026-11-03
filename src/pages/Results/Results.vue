<script setup lang="ts">
const { wpm, accuracy, wpmArray, time, correctWords } = defineProps<{
  wpm: number;
  wpmArray: number[];
  accuracy: number;
  time: string;
  elapsedSeconds: number;
  correctWords: string[];
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
    <p>Seconds: {{ elapsedSeconds }}</p>
    <p>Correct words: {{ correctWords }}</p>
    <button @click="emit('restart')">Restart</button>
    <button
      @click="
        () => {
          console.log(correctWords);
        }
      "
    >
      Restart
    </button>
  </div>
</template>
