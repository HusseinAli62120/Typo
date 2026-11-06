<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import Navbar from "../components/Nav/Navbar.vue";
import isMatchingLowerCase from "../utils/isMatchingLowerCase.ts";
import { captureKeyStroke } from "../utils/captureKeyStroke.ts";
import Results from "./Results/Results.vue";
import FluidCursor from "@/components/ui/fluid-cursor/FluidCursor.vue";
import { FluidCursorPropsValues } from "@/types/FluidCursor.ts";
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
import SleekLineCursor from "@/components/ui/sleek-line-cursor/SleekLineCursor.vue";
import { SleekLineCursorPropsValues } from "@/types/SleekLineCursor.ts";
import type { SelectedCursor } from "@/types/SelectedCursor.ts";
import type { Difficulty } from "@/types/Difficulty.ts";
import Toggle from "@/components/ui/toggle/Toggle.vue";
import type { Punctuation } from "@/types/Punctuation.ts";

// Tab values (so not to repeat the code for each entry)
const modes: Mode[] = ["time", "words"];
const quantities: Quantity[] = [15, 30, 60, 120, 300];
const difficulties: Difficulty[] = ["Normal", "Hard"];

const isDev = import.meta.env.DEV;

const {
  words,
  typedWords,
  correctWords,
  letters,
  typedLetters,
  correctLetters,
  typedLettersRaw,
  mode,
  quantity,
  graphArray,
  time,
  accuracy,
  isDone,
  startTimers,
  stopTimers,
  restart,
  generateWords,
  countdown,
  progress,
  consistency,
  mistakes,
  averageWPM,
  difficulty,
  punctuation,
} = useTypingValues();

// Cursor value
let selectedCursor = ref<SelectedCursor>(
  (localStorage.getItem("cursor") as SelectedCursor) || "fluid",
);

// Handle cursor change
const handleCursorChange = ({ value }: { value: SelectedCursor }) => {
  selectedCursor.value = value;

  // Save preference
  localStorage.setItem("cursor", value);
};

// To hide UI (When typing the first letter)
let started = computed(() => {
  return typedLetters.value.length > 0 && typedLettersRaw.value.length > 0;
});

// To hide the cursor
const cursorHide = ref(false);

// Show the pointer again when the mouse actually moves
const onMouseMove = (e: MouseEvent) => {
  if (Math.abs(e.movementX) + Math.abs(e.movementY) > 1)
    cursorHide.value = false;
};

// Tab mode change
const handleModeChange = ({ selectedMode }: { selectedMode: Mode }) => {
  // Restart and save preference in local storage
  restart({});

  localStorage.setItem("mode", selectedMode);

  // Generate words based on the mode selected
  if (selectedMode === "words") {
    generateWords({ selectedMode: selectedMode });
  } else {
    generateWords({ selectedMode: selectedMode, selectedQuantity: 60 });
  }
};

// Tab quantity/duration change
const handleQuantityChange = ({
  selectedQuantity,
}: {
  selectedQuantity: Quantity;
}) => {
  // Restart and set preference
  restart({});

  localStorage.setItem("quantity", selectedQuantity.toString());

  // Set the countdown to the duration selected and generate words based on the mode
  countdown.value = Number(selectedQuantity);
  if (mode.value === "words") {
    generateWords({ selectedQuantity: Number(selectedQuantity) });
  } else {
    generateWords({ selectedQuantity: 60 });
  }
};

const handleDifficultyChange = ({
  selectedDifficulty,
}: {
  selectedDifficulty: Difficulty;
}) => {
  // Restart and save preference in local storage
  restart({});

  localStorage.setItem("difficulty", selectedDifficulty);

  // Generate words based on the mode selected
  if (mode.value === "words") {
    generateWords({ selectedDifficulty: selectedDifficulty });
  } else {
    generateWords({
      selectedDifficulty: selectedDifficulty,
      selectedQuantity: 60,
    });
  }
};

const handlePunctuationChange = ({
  selectedValue,
}: {
  selectedValue: Punctuation;
}) => {
  // Restart and save preference in local storage
  restart({});

  punctuation.value = selectedValue;

  localStorage.setItem("punctuation", selectedValue.toString());

  // Generate words based on the mode selected
  if (mode.value === "words") {
    generateWords({ isPunctuation: selectedValue });
  } else {
    generateWords({
      isPunctuation: selectedValue,
      selectedQuantity: 60,
    });
  }
};
// Reference to the text box
const box = ref<HTMLElement | null>(null);

// Start & record time on first key stroke
watch(
  typedLetters,
  (value) => {
    startTimers({ currentTypedLetters: value });

    if (value.length > 0) {
      // Drop focus from whatever was clicked (tabs, buttons) so Space can't activate it
      const active = document.activeElement;
      if (active instanceof HTMLElement && active !== document.body) {
        active.blur();
      }

      // Hide the cursor
      cursorHide.value = true;
    }

    // Reset if all letters are deleted
    if (value.length === 0 && typedLettersRaw.value.length) {
      restart({ repeat: true });
      // show the cursor
      cursorHide.value = false;
    }
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
      typedLettersRaw: typedLettersRaw.value,
      mistakes: mistakes.value,
      isPunctuation: punctuation.value,
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
      typedLettersRaw: typedLettersRaw.value,
      mistakes: mistakes.value,
      isPunctuation: punctuation.value,
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
  <div
    v-if="!isDone"
    class="screen"
    :class="cursorHide && '**:cursor-none'"
    @mousemove="onMouseMove"
  >
    <!-- Navbar -->
    <Navbar
      :selected-cursor="selectedCursor"
      @select-cursor="
        (value) => {
          handleCursorChange({ value: value });
        }
      "
    />

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
                    handleModeChange({ selectedMode: value as Mode });
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
                    handleQuantityChange({
                      selectedQuantity: value as Quantity,
                    });
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

              <!-- Difficulty Toggle -->
              <Tabs
                @update:model-value="
                  (value) => {
                    handleDifficultyChange({
                      selectedDifficulty: value as Difficulty,
                    });
                  }
                "
                v-model="difficulty"
              >
                <TabsList>
                  <TabsTrigger
                    v-for="value in difficulties"
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
        <Toggle
          @update:model-value="
            (value) => {
              handlePunctuationChange({
                selectedValue: value ? 'true' : 'false',
              });
            }
          "
          class="border border-border text-muted-foreground data-[state=on]:text-foreground"
          :v-model="punctuation === 'true'"
          :default-value="punctuation === 'true'"
        >
          <LucideLetters />
          Punctuation
        </Toggle>
      </div>
      <!-- Timer & Textbox -->
      <div
        class="flex-1 flex flex-col justify-start items-start w-full max-w-7xl py-5"
      >
        <!-- Timer/Words -->
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
                    // Check if the letter exists
                    typedLetters[
                      getLetterIndex({
                        wordIndex: wordIndex,
                        letterIndex: i,
                        words: words,
                      })
                    ] &&
                    // If not matching, show the character, and it is red
                    !isMatchingLowerCase({
                      index: getLetterIndex({
                        wordIndex: wordIndex,
                        letterIndex: i,
                        words: words,
                      }),
                      letter: letter,
                      typedLetters: typedLetters,
                      isPunctuation: punctuation,
                    })
                      ? 'text-red-600 font-semibold opacity-100'
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
                          isPunctuation: punctuation,
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
                {{ isDev ? "" : " " }}
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
    :wpm="averageWPM"
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
    :correct-words="correctWords"
    :correct-letters="correctLetters"
    :total-words="mode === 'words' ? words.length : typedWords.length"
    :total-characters="mode === 'words' ? letters.length : typedLetters.length"
    :consistency="consistency"
    :mistakes="mistakes.length"
  />

  <FluidCursor
    v-if="selectedCursor === 'fluid'"
    :density-dissipation="FluidCursorPropsValues.densityDissipation"
    :velocity-dissipation="FluidCursorPropsValues.velocityDissipation"
    :pressure="FluidCursorPropsValues.pressure"
    :curl="FluidCursorPropsValues.curl"
    :splat-radius="FluidCursorPropsValues.splatRadius"
    :splat-force="FluidCursorPropsValues.splatForce"
    :transparent="FluidCursorPropsValues.transparent"
  />

  <SleekLineCursor
    v-if="selectedCursor === 'sleekline'"
    :friction="SleekLineCursorPropsValues.friction"
    :trails="SleekLineCursorPropsValues.trails"
    :size="SleekLineCursorPropsValues.size"
    :dampening="SleekLineCursorPropsValues.dampening"
    :tension="SleekLineCursorPropsValues.tension"
  />
</template>
