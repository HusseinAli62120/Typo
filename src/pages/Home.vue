<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import Navbar from "../components/Nav/Navbar.vue";
import getLetters from "../utils/getLetters.ts";
import isMatchingLowerCase from "../utils/isMatchingLowerCase.ts";
import { generate } from "random-words";
import { captureKeyStroke } from "../utils/captureKeyStroke.ts";
import Results from "./Results/Results.vue";
import FluidCursor from "@/components/ui/fluid-cursor/FluidCursor.vue";
import type { FluidCursorProps } from "@/types/FluidCursor.ts";
import { getLetterIndex, getWordStartIndex } from "@/utils/getIndexes.ts";
import useTypingValues from "@/composables/useTypingValues.ts";
import Repeat from "@/components/animate-ui/icons/Repeat.vue";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { onKeyStroke } from "@vueuse/core";
import ArrowRight from "@/components/animate-ui/icons/ArrowRight.vue";

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

const {
  words,
  letters,
  typedWords,
  typedLetters,
  graphArray,
  time,
  elapsedSeconds,
  wpm,
  accuracy,
  isDone,
  startTimers,
  stopTimers,
  restart,
} = useTypingValues();

// Reference to the text box
const box = ref<HTMLElement | null>(null);

// Start & record time
watch(
  typedLetters,
  (value) => {
    startTimers({ currentTypedLetters: value });
  },
  { deep: true },
);

// Generate words & get their letters
onMounted(() => {
  words.value = generate(15) as string[];
  getLetters({ words: words.value, letters: letters.value });
});

// Capture key strokes
onMounted(() => {
  document.addEventListener("keydown", (e: KeyboardEvent) => {
    captureKeyStroke({
      e: e,
      typedLetters: typedLetters.value,
      letters: letters.value,
      typedWords: typedWords.value,
    });
  });
});

// Remove listener on dismount
onUnmounted(() => {
  document.removeEventListener("keydown", (e: KeyboardEvent) => {
    captureKeyStroke({
      e: e,
      typedLetters: typedLetters.value,
      letters: letters.value,
      typedWords: typedWords.value,
    });
  });

  // Stop timers
  stopTimers();
});

let lastLineTop = -1;

// Auto scroll with the cursor
watch(
  typedLetters,
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

// Restart on ctrl+c
onKeyStroke(["c", "C"], (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
    restart({});
  }
});

// Repeat on ctrl+r
onKeyStroke(["r", "R"], (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
    restart({ repeat: true });
  }
});
</script>

<template>
  <!-- Typing page -->
  <div v-if="!isDone" class="screen">
    <!-- Navbar -->
    <Navbar />

    <!-- Content -->
    <div class="flex-1 w-full flex flex-col justify-center items-center py-20">
      <!-- Typing box -->
      <div
        ref="box"
        class="relative w-full min-w-4xl max-w-4xl h-96 text-start text-4xl whitespace-pre-wrap overflow-scroll leading-normal no-scrollbar border"
      >
        <div class="w-full flex flex-wrap justify-start">
          <!-- Words map -->
          <span
            v-for="(word, wordIndex) in words"
            :key="'w-' + wordIndex"
            class="inline-flex items-center"
          >
            <!-- Letters in the word -->
            <span
              v-for="(letter, i) in word.split('')"
              :key="'l-' + wordIndex + '-' + i"
              class="inline-flex flex-col items-center"
            >
              <!-- Typed letter  -->
              <span
                class="text-lg font-mono h-6 flex items-center justify-center select-none"
                :class="[
                  // Check if the letter exists, if so, add a color based on if it matches or not
                  typedLetters[
                    getLetterIndex({
                      wordIndex: wordIndex,
                      letterIndex: i,
                      words: words,
                    })
                  ]
                    ? isMatchingLowerCase({
                        index: getLetterIndex({
                          wordIndex: wordIndex,
                          letterIndex: i,
                          words: words,
                        }),
                        letter: letter,
                        typedLetters: typedLetters,
                      })
                      ? 'text-emerald-500 font-semibold'
                      : 'text-red-500 font-semibold'
                    : 'opacity-0',
                ]"
              >
                {{
                  typedLetters[
                    getLetterIndex({
                      wordIndex: wordIndex,
                      letterIndex: i,
                      words: words,
                    })
                  ]
                }}
              </span>

              <!-- Intended letter  -->
              <span
                class="text-4xl"
                :class="[
                  // Check if the letter exists, if so, add a color based on if it matches or not
                  typedLetters[
                    getLetterIndex({
                      wordIndex: wordIndex,
                      letterIndex: i,
                      words: words,
                    })
                  ]
                    ? isMatchingLowerCase({
                        index: getLetterIndex({
                          wordIndex: wordIndex,
                          letterIndex: i,
                          words: words,
                        }),
                        letter: letter,
                        typedLetters: typedLetters,
                      })
                      ? 'text-emerald-600'
                      : 'text-red-600'
                    : 'text-muted-foreground',
                  // Add cursor to the current letter
                  typedLetters.length ===
                    getLetterIndex({
                      wordIndex: wordIndex,
                      letterIndex: i,
                      words: words,
                    }) && 'cursor',
                ]"
              >
                {{ letter }}
              </span>
            </span>

            <!-- Spaces -->
            <span
              :class="[
                // Get to the start of the previous word + its length to reach the space
                typedLetters[
                  getWordStartIndex({ wordIndex: wordIndex, words: words }) +
                    word.length
                ] &&
                typedLetters[
                  getWordStartIndex({ wordIndex: wordIndex, words: words }) +
                    word.length
                ] !== ' '
                  ? 'bg-red-200'
                  : '',
                typedLetters.length ===
                  getWordStartIndex({ wordIndex: wordIndex, words: words }) +
                    word.length && 'cursor',
              ]"
              v-if="wordIndex <= words.length - 1"
            >
              <!-- Add spaces between words except the last word -->
              {{ "" }}
            </span>
          </span>
        </div>
      </div>

      <!-- Time & Icons -->
      <div class="flex flex-row justify-between w-full max-w-4xl gap-5">
        <Tooltip>
          <TooltipTrigger as-child>
            <Repeat
              animate-on-hover
              @click="restart({ repeat: true })"
              class="w-5"
            />
          </TooltipTrigger>
          <TooltipContent side="bottom">Repeat</TooltipContent>
        </Tooltip>

        <!-- Next -->
        <Tooltip>
          <TooltipTrigger as-child>
            <ArrowRight
              animate-on-hover
              @click="restart({ repeat: false })"
              class="w-5"
            />
          </TooltipTrigger>

          <TooltipContent side="bottom">Next</TooltipContent>
        </Tooltip>
      </div>
    </div>
  </div>

  <Results
    v-else
    :wpm="wpm"
    :wpm-array="graphArray"
    :accuracy="accuracy"
    :time="time"
    @restart="restart({})"
    :elapsed-seconds="elapsedSeconds"
    :correct-words="typedWords"
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
