<script setup lang="ts">
import { computed } from "vue";
import type { Punctuation } from "@/types/Punctuation";
import isMatching from "@/utils/isMatching";

const { word, typed, cursor, punctuation } = defineProps<{
  word: string[];
  typed: string[]; // Current typed letters for a specific word
  cursor: number;
  punctuation: Punctuation;
  isDev: boolean;
}>();

const items = computed(() =>
  word.map((letter, i) => {
    // Specific letter in the word
    const typedLetter = typed[i]; // undefined if not typed yet

    return {
      letter,
      typed: typedLetter,
      state: !typedLetter
        ? "idle"
        : isMatching({
              letter: letter,
              typedLetter: typedLetter,
              isPunctuation: punctuation,
            })
          ? "ok"
          : "bad",
      isCursor: cursor === i,
    };
  }),
);

// typed[words.length] is the trailing space after each word (it is not length + 1) since an array index starts with 0
const spaceTyped = computed(() => typed[word.length]);
</script>

<template>
  <span class="inline-flex items-end">
    <span
      v-for="(item, i) in items"
      :key="i"
      class="inline-flex flex-col items-center"
    >
      <!-- Typed letter (Shown only when wrong) -->
      <span
        class="text-lg font-mono h-6 flex items-center justify-center select-none"
        :class="
          item.state === 'bad' ? 'text-red-600 font-semibold' : 'opacity-0'
        "
      >
        {{ item.typed }}
      </span>
      <!-- Letter to type -->
      <span
        class="text-4xl"
        :class="[
          item.state === 'ok'
            ? 'text-emerald-600'
            : item.state === 'bad'
              ? 'text-red-600'
              : 'text-muted-foreground',
          item.isCursor && 'cursor',
        ]"
      >
        {{ item.letter }}
      </span>
    </span>

    <!-- Space -->
    <span
      :class="[
        spaceTyped && spaceTyped !== ' ' ? 'bg-red-600' : '',
        cursor === word.length && 'cursor',
      ]"
    >
      {{ " " }}
    </span>
  </span>
</template>
