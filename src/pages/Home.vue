<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import Navbar from "../components/Nav/Navbar.vue";
import { allowedKeys } from "../utils/values.ts";
import getLetters from "../utils/getLetters.ts";
import isMatchingLowerCase from "../utils/isMatchingLowerCase.ts";
import { generate } from "random-words";

// What the user is typing
let typedValue = ref<string[]>([]);

// The text to type
let text = ref<string[]>([]);

const box = ref<HTMLElement | null>(null);

text.value = generate(100) as string[];

getLetters({ text: text.value });

const onKeyDown = (e: KeyboardEvent) => {
  // Stop if done typing
  if (typedValue.value.length >= text.value.length) return;

  // stop Space from scrolling
  if (
    e.target instanceof HTMLElement &&
    e.target.matches("input, textarea, [contenteditable]")
  )
    return;

  if (e.key === " ") e.preventDefault();

  // Return special commands
  if (!allowedKeys.includes(e.key)) return;
  // Delete on backspace
  else if (e.key === "Backspace") {
    typedValue.value = typedValue.value.slice(0, -1);

    // Submit
  } else if (e.key === "Enter") {
    console.log("Submit");

    // Space
  } else if (e.key === " ") {
    console.log("Space pressed");
    typedValue.value.push(" ");
  }

  // Add character
  else {
    typedValue.value.push(e.key);
  }
};

onMounted(() => {
  document.addEventListener("keydown", onKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeyDown);
});

// Move to results screen when done
watch(
  () => typedValue.value,
  (newValue) => {
    if (newValue.length >= text.value.length - 1) {
      setTimeout(() => {
        alert("You are done");

        typedValue.value = [];
      }, 200);
    }
  },
  {
    deep: true,
  },
);

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
      // cursor moved above the visible area (backspace / reset)
      container.scrollTo({ top, behavior: "smooth" });
    }
  },
  { deep: true },
);
</script>

<template>
  <div class="screen">
    <!-- Navbar -->
    <Navbar />

    <!-- Content -->
    <div class="flex-1 flex justify-center items-start py-20">
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
              : 'text-black',
            typedValue.length === index && 'cursor',
          ]"
          >{{ char }}</span
        >
      </div>
    </div>
  </div>
</template>
