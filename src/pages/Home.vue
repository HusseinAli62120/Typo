<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import Navbar from "../components/Nav/Navbar.vue";
import { allowedKeys } from "../utils/values.ts";
import getLetters from "../utils/getLetters.ts";
import isMatchingLowerCase from "../utils/isMatchingLowerCase.ts";
import { generate } from "random-words";

// What the user is typing
let typedValue = ref<string[]>([]);

// The text to type
let text = ref<string[]>([]);

text.value = generate(30) as string[];

getLetters({ text: text.value });

const onKeyDown = (e: KeyboardEvent) => {
  // Stop if done typing
  if (typedValue.value.length >= text.value.length) return;

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

// Listen to changes
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
</script>

<template>
  <div class="screen">
    <!-- Navbar -->
    <Navbar />

    <!-- Content -->
    <div class="flex-1 flex justify-center items-start py-20">
      <div class="w-full max-w-4xl text-4xl whitespace-pre-wrap">
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
