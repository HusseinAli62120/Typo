<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import Navbar from "../components/Nav/Navbar.vue";
import getLetters from "../utils/getLetters.ts";
import isMatchingLowerCase from "../utils/isMatchingLowerCase.ts";
import { generate } from "random-words";
import { captureKeyStroke } from "../utils/captureKeyStroke.ts";
import Results from "./Results/Results.vue";
import FluidCursor from "@/components/ui/fluid-cursor/FluidCursor.vue";
import type { FluidCursorProps } from "@/types/FluidCursor.ts";

// Fluid Cursor props
const props = withDefaults(defineProps<FluidCursorProps>(), {
  enabled: true,
  densityDissipation: 3.5,
  velocityDissipation: 2,
  pressure: 0.1,
  curl: 3,
  splatRadius: 0.2,
  splatForce: 6000,
  transparent: true,
});

// What the user is typing
let typedValue = ref<string[]>([]);

// The text to type
let text = ref<string[]>([]);

// Reference to the text box
const box = ref<HTMLElement | null>(null);

// Stats
const startTime = ref<number | null>(null);
const endTime = ref<number | null>(null);
const now = ref(Date.now());
let timer: number | undefined;
const graphArray = ref<number[]>([]);
let graphTimer: number | undefined;

// Done flag
let isDone = ref<boolean>(false);

const elapsedSeconds = computed(() => {
  if (startTime.value === null) return 0;
  // Divided by 1000 since they are in milliseconds
  return Math.floor(((endTime.value ?? now.value) - startTime.value) / 1000);
});

const time = computed(() => {
  const minutes = `${Math.floor(elapsedSeconds.value / 60)}`;
  const seconds = `${Math.floor(elapsedSeconds.value % 60)
    .toString()
    .padStart(2, "0")}`;
  return `${minutes}:${seconds}`;
});

const correctCharacters = computed(() => {
  let count = 0;
  for (let i = 0; i < typedValue.value.length; i++) {
    if (typedValue.value[i] === text.value[i]) count++;
  }
  return count;
});

const wpm = computed(() => {
  // floor at 1 second so the first keystrokes don't show a huge spike
  const minutes = Math.max(elapsedSeconds.value / 60, 1 / 60);
  return startTime.value
    ? Math.round(correctCharacters.value / 5 / minutes)
    : 0;
});

const accuracy = computed(() =>
  typedValue.value.length
    ? Math.round((correctCharacters.value / typedValue.value.length) * 100)
    : 100,
);

const restart = () => {
  stopTimers();
  typedValue.value = [];
  graphArray.value = [];
  now.value = Date.now();
  startTime.value = null;
  endTime.value = null;
  isDone.value = false;
  text.value = generate(15) as string[];
  getLetters({ text: text.value });
};

const stopTimers = () => {
  clearInterval(timer);
  clearInterval(graphTimer);
  timer = undefined;
  graphTimer = undefined;
};

// Start & record time
watch(
  typedValue,
  (value) => {
    // First keystroke starts the clock
    if (startTime.value === null) {
      startTime.value = Date.now();
      now.value = startTime.value;

      // Update "now" value every 250ms
      timer = window.setInterval(() => (now.value = Date.now()), 250);

      // Record WPM every second
      graphTimer = window.setInterval(() => {
        graphArray.value.push(wpm.value);
      }, 1000);
    }

    // Finished the text: freeze the clock
    if (value.length >= text.value.length - 1 && endTime.value === null) {
      endTime.value = Date.now();
      stopTimers();
      setTimeout(() => {
        isDone.value = true;
      }, 200);
    }
  },
  { deep: true },
);

// Generate words & get their letters
onMounted(() => {
  text.value = generate(15) as string[];
  getLetters({ text: text.value });
});

// Capture key strokes
onMounted(() => {
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    captureKeyStroke({ e: e, typedValue: typedValue.value, text: text.value });
  });
});

// Remove listener on dismount
onUnmounted(() => {
  document.removeEventListener("keydown", (e: KeyboardEvent) => {
    captureKeyStroke({ e: e, typedValue: typedValue.value, text: text.value });
  });

  // Stop timers
  stopTimers();
});

let lastLineTop = -1;

// Auto scroll with the cursor
watch(
  typedValue,
  async (value) => {
    if (value.length === 0) lastLineTop = -1; // new round

    await nextTick();

    const container = box.value;
    const cursorEl = container?.querySelector<HTMLElement>(".cursor");
    if (!container || !cursorEl) return;

    const top = cursorEl.offsetTop;

    // Same line as before: nothing to do
    if (top === lastLineTop) return;
    lastLineTop = top;

    const lineHeight =
      parseFloat(getComputedStyle(container).lineHeight) ||
      cursorEl.offsetHeight;

    // Bottom of the line *below* the cursor's line
    const needBottom = top + lineHeight * 2;

    if (needBottom > container.scrollTop + container.clientHeight) {
      // reveal the next line
      container.scrollTo({
        top: needBottom - container.clientHeight,
        behavior: "smooth",
      });
    } else if (top < container.scrollTop) {
      // cursor moved above the visible area (backspace / restart)
      container.scrollTo({ top, behavior: "smooth" });
    }
  },
  { deep: true },
);
</script>

<template>
  <!-- Typing page -->
  <div v-if="!isDone" class="screen">
    <!-- Navbar -->
    <Navbar />

    <!-- Content -->
    <div class="flex-1 flex flex-col justify-center items-start py-20">
      <div
        ref="box"
        class="relative w-full max-w-4xl text-start text-4xl whitespace-pre-wrap h-96 overflow-scroll leading-normal no-scrollbar"
      >
        <span
          v-for="(char, index) in text"
          :key="index"
          :class="[
            typedValue[index]
              ? isMatchingLowerCase({ char, index, typedValue })
                ? 'text-emerald-600'
                : char === ' '
                  ? 'bg-red-200'
                  : 'text-red-600 underline'
              : 'text-foreground',
            typedValue.length === index && 'cursor',
          ]"
          >{{ char }}</span
        >
      </div>

      <div class="flex flex-row justify-center gap-5">
        <p>wpm:{{ wpm }}</p>
        <p>Time:{{ time }}</p>
        <p>correctCharacters:{{ correctCharacters }}</p>
      </div>
    </div>
  </div>

  <Results
    v-else
    :wpm="wpm"
    :wpm-array="graphArray"
    :accuracy="accuracy"
    :time="time"
    @restart="restart"
    :elapsed-seconds="elapsedSeconds"
  />

  <FluidCursor
    v-if="enabled"
    :density-dissipation="props.densityDissipation"
    :velocity-dissipation="props.velocityDissipation"
    :pressure="props.pressure"
    :curl="props.curl"
    :splat-radius="props.splatRadius"
    :splat-force="props.splatForce"
    :transparent="props.transparent"
  />
</template>
