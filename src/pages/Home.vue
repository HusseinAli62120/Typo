<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import Navbar from "../components/Nav/Navbar.vue";
import { allowedKeys } from "../utils/values.ts";
import getLetters from "../utils/getLetters.ts";
import isMatchingLowerCase from "../utils/isMatchingLowerCase.ts";

// What the user is typing
let typedValue = ref<string[]>([]);

// The text to type
let text = ref<string[]>([]);

text.value = "Hello This is a cool idea".split(" ");

getLetters({ text: text.value });

const onKeyDown = (e: KeyboardEvent) => {
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
    <div class="flex-1 flex justify-center py-20">
      <div class="flex flex-wrap">
        <p
          v-for="(char, index) in text"
          :key="index"
          class="whitespace-pre text-4xl"
          :class="
            // Check if a character exists at this index, if so, do the check, if not, ignore it.
            typedValue[index]
              ? isMatchingLowerCase({ char: char, index: index, typedValue })
                ? 'text-emerald-600'
                : 'text-red-600 underline '
              : 'text-black'
          "
        >
          {{ char }}
        </p>
      </div>
    </div>
  </div>
</template>
