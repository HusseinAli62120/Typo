<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import Navbar from "../components/Nav/Navbar.vue";
import isMatchingLowerCase from "../utils/isMatchingLowerCase.ts";
import { captureKeyStroke } from "../utils/captureKeyStroke.ts";
import Results from "./Results/Results.vue";
import FluidCursor from "@/components/ui/fluid-cursor/FluidCursor.vue";
import type { FluidCursorProps } from "@/types/FluidCursor.ts";
import { getLetterIndex, getWordStartIndex } from "@/utils/getIndexes.ts";
import useTypingValues from "@/composables/useTypingValues.ts";
import Repeat from "@/components/animate-ui/icons/Repeat.vue";
import Restart from "@/components/animate-ui/icons/RotateCcw.vue";

import { onKeyStroke } from "@vueuse/core";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LucideClock, LucideLetters } from "@lucide/vue";
import type { Mode } from "@/types/Mode.ts";
import type { Quantity } from "@/types/Quantity.ts";
import Progress from "@/components/ui/progress/Progress.vue";

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

// Tab values (so not to repeat the code for each entry)
const modes: Mode[] = ["time", "words"];
const quantities: Quantity[] = [1, 30, 60, 120, 300];

const {
  words,
  typedWords,
  correctWords,
  letters,
  typedLetters,
  correctLetters,
  mode,
  quantity,
  graphArray,
  time,
  elapsedSeconds,
  wpm,
  accuracy,
  isDone,
  startTimers,
  stopTimers,
  restart,
  generateWords,
  countdown,
  progress,
} = useTypingValues();

let started = computed(() => {
  return typedLetters.value.length > 0;
});

// Reference to the text box
const box = ref<HTMLElement | null>(null);

// Start & record time on first key stroke
watch(
  typedLetters,
  (value) => {
    startTimers({ currentTypedLetters: value });
  },
  { deep: true },
);

// Generate words & get their letters
onMounted(() => {
  if (mode.value === "words") {
    generateWords({});
  } else {
    generateWords({ selectedQuantity: 60 });
  }
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
    if (mode.value === "words") {
      generateWords({});
    } else {
      generateWords({ selectedQuantity: 60 });
    }
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
    <div
      class="flex-1 w-full flex flex-col justify-start items-center py-20 space-y-5"
    >
      <!-- Punctuation & Tabs -->
      <div
        class="w-full max-w-7xl flex flex-row justify-between space-x-5 px-10"
      >
        <!-- Tabs -->
        <div
          class="grid transition-all duration-500 ease-out motion-reduce:transition-none"
          :class="
            started
              ? 'grid-cols-[0fr] opacity-0 blur-sm -translate-y-1 pointer-events-none'
              : 'grid-cols-[1fr] opacity-100 blur-none translate-y-0'
          "
        >
          <div class="min-w-0 overflow-hidden">
            <div class="flex flex-row items-center space-x-5 pr-5">
              <!-- Mode toggle -->
              <Tabs
                @update:model-value="
                  (value) => {
                    restart({});
                    if (value === 'words') {
                      generateWords({ selectedQuantity: quantity });
                    } else {
                      generateWords({ selectedQuantity: 60 });
                    }
                  }
                "
                v-model="mode"
              >
                <TabsList>
                  <TabsTrigger
                    v-for="value in modes"
                    class="dark:data-[state=active]:bg-background"
                    :value="value"
                  >
                    <LucideClock v-if="value === 'time'" />
                    <LucideLetters v-else />
                    {{ `${value.charAt(0).toUpperCase()}${value.slice(1)}` }}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <!-- Quantity toggle -->
              <Tabs
                @update:model-value="
                  (value) => {
                    restart({});
                    countdown = Number(value);
                    if (mode === 'words') {
                      generateWords({ selectedQuantity: Number(value) });
                    } else {
                      generateWords({ selectedQuantity: 60 });
                    }
                  }
                "
                v-model="quantity"
              >
                <TabsList>
                  <TabsTrigger
                    v-for="value in quantities"
                    class="dark:data-[state=active]:bg-background"
                    :value="value"
                  >
                    {{ value }}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        <!-- Punctuation -->
        <button
          class="transition-opacity duration-500"
          :class="started && 'opacity-0 pointer-events-none'"
        >
          Punctuation
        </button>
      </div>
      <!-- Timer & Textbox -->
      <div
        class="flex-1 flex flex-col justify-start items-start w-full max-w-7xl py-5"
      >
        <p
          v-if="mode === 'time'"
          class="px-10 text-5xl font-semibold text-foreground mb-2 transition-opacity duration-500"
          :class="[!started && 'opacity-0 pointer-events-none']"
        >
          {{ time }}
        </p>
        <p
          v-if="mode === 'words'"
          class="px-10 text-5xl font-semibold text-foreground mb-2 transition-opacity duration-500"
          :class="[!started && 'opacity-0 pointer-events-none']"
        >
          {{ `${typedWords.length}/${words.length}` }}
        </p>
        <!-- Typing box -->
        <div
          ref="box"
          class="relative w-full max-h-52 text-4xl whitespace-pre-wrap overflow-scroll leading-normal no-scrollbar px-10"
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

        <!-- Progress -->
        <div v-if="started" class="w-full max-w-7xl px-10 mt-10">
          <Progress :model-value="progress" />
        </div>
        <!-- Time & Icons -->
        <div class="flex flex-row justify-center w-full max-w-7xl gap-10 mt-5">
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
              <Restart
                animate-on-hover
                @click="
                  () => {
                    restart({ repeat: false });
                    if (mode === 'time') {
                      generateWords({ selectedQuantity: 60 });
                    } else {
                      generateWords({});
                    }
                  }
                "
                class="w-5"
              />
            </TooltipTrigger>

            <TooltipContent side="bottom">Restart</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  </div>

  <Results
    v-else
    :wpm="wpm"
    :wpm-array="graphArray"
    :accuracy="accuracy"
    :time="time"
    @restart="
      () => {
        restart({});
        if (mode === 'time') {
          generateWords({ selectedQuantity: 60 });
        } else {
          generateWords({});
        }
      }
    "
    :elapsed-seconds="elapsedSeconds"
    :correct-words="correctWords"
    :correct-letters="correctLetters"
    :total-words="mode === 'words' ? words.length : typedWords.length"
    :total-characters="mode === 'words' ? letters.length : typedLetters.length"
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
