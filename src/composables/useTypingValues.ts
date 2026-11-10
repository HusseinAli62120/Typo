import type { Difficulty } from "@/types/Difficulty";
import type { Mode } from "@/types/Mode";
import type { Punctuation } from "@/types/Punctuation";
import type { Quantity } from "@/types/Quantity";
import getLetters from "@/utils/getLetters";
import { normalizeWords } from "@/utils/normalizeWords";
import { createPunctuator } from "@/utils/puncuate";
import { generate } from "random-words";
import { computed, ref } from "vue";

export default function useTypingValues() {
  // How many words have already been converted to letters
  let convertedWords = 0;

  // What the user is typing
  let typedLetters = ref<string[]>([]);
  let typedWords = ref<string[]>([]);
  let typedLettersRaw = ref<string[]>([]); // Includes every letter the user typed, even the ones that were deleted (backspaced) (used for accuracy & wpm)

  // The text to type
  let words = ref<string[]>([]);
  let letters = ref<string[]>([]);

  // Modes
  let mode = ref<Mode>((localStorage.getItem("mode") as Mode) || "time");
  let quantity = ref<Quantity>(
    (Number(localStorage.getItem("quantity")) as Quantity) || 15,
  );
  let difficulty = ref<Difficulty>(
    (localStorage.getItem("difficulty") as Difficulty) || "Normal",
  );
  let punctuation = ref<Punctuation>(
    (localStorage.getItem("punctuation") as Punctuation) || "false",
  );

  // Times

  // For Words mode (count up)
  const startTime = ref<number | null>(null);
  const endTime = ref<number | null>(null);
  const now = ref(Date.now());
  let timer = ref<number | undefined>(undefined);

  // For time mode (Count down)
  let countdownTimer = ref<number | undefined>(undefined); // This exists to stop the countdown once it reaches 0 and not continue infinitely
  let countdown = ref<number>(quantity.value);

  // WPM
  let graphArray = ref<number[]>([]);
  let graphTimer = ref<number | undefined>(undefined);

  // Compute the starting index of each word
  const wordStarts = computed(() => {
    const starts: number[] = [];
    let acc = 0;
    for (const w of words.value) {
      starts.push(acc);
      acc += w.length + 1;
    }
    return starts;
  });

  // // Current typed letters for a specific word (including its trailing space)
  const typedFor = ({ wordIndex }: { wordIndex: number }) => {
    const wordStart = wordStarts.value[wordIndex];
    return typedLetters.value.slice(
      wordStart,
      wordStart + words.value[wordIndex].length + 1,
    );
  };

  // Offset of the cursor inside this word, or -1 if it's elsewhere
  const cursorFor = ({ wordIndex }: { wordIndex: number }) => {
    const off = typedLetters.value.length - wordStarts.value[wordIndex];
    return off >= 0 && off <= words.value[wordIndex].length ? off : -1;
  };

  // Progress
  let progress = computed(() => {
    if (mode.value === "time") {
      return ((quantity.value - countdown.value) / quantity.value) * 100;
    } else {
      return (typedWords.value.length / words.value.length) * 100;
    }
  });

  const elapsedSeconds = computed(() => {
    if (startTime.value === null) return 0;
    if (mode.value === "time") {
      // If done, simple return the duration selected
      if (isDone.value || countdown.value <= 0) return quantity.value;
      const elapsed = Math.floor(
        ((endTime.value ?? now.value) - startTime.value) / 1000,
      );
      // In time mode, make sure that elapsedSeconds don't go over the duration(quantity) selected
      return Math.min(elapsed, quantity.value);
    }
    // Divided by 1000 since they are in milliseconds
    return Math.floor(((endTime.value ?? now.value) - startTime.value) / 1000);
  });

  // Time shown
  const time = computed(() => {
    // Choose whether the seconds are couted up (words mode) or counted down (time mode)
    const selectedSeconds =
      mode.value === "words" || isDone.value
        ? elapsedSeconds.value
        : Math.max(countdown.value, 0);

    // Get minutes and format
    const minutes = `${Math.floor(selectedSeconds / 60)}`;
    const seconds = `${Math.floor(selectedSeconds % 60)
      .toString()
      .padStart(2, "0")}`;
    return `${minutes}:${seconds}`;
  });

  //   Stats  //

  // Correct letters

  let correctLetters = ref<number>(0);

  // Mistakes
  const mistakes = ref<number>(0);

  // Correct words
  const correctWords = computed(() => {
    let count = 0;
    for (let index = 0; index < typedWords.value.length; index++) {
      if (typedWords.value[index] === words.value[index]) count++;
    }
    return count;
  });

  // Words per minutes
  const wpm = computed(() => {
    // In time mode when finished, strictly use the selected duration
    const seconds =
      mode.value === "time" && (isDone.value || countdown.value <= 0)
        ? quantity.value
        : elapsedSeconds.value;

    // floor at 1 second so the first keystrokes don't show a huge spike
    const minutes = Math.max(seconds / 60, 1 / 60);
    return startTime.value ? Math.round(correctLetters.value / 5 / minutes) : 0;
  });

  let averageWPM = ref<number>(0);

  // Accuracy (Correct letters/Raw letters) * 100
  const accuracy = computed(() =>
    typedLetters.value.length
      ? Math.round((correctLetters.value / typedLettersRaw.value.length) * 100)
      : 100,
  );

  // Consistency
  const consistency = computed(() => {
    // WPM for each second
    const values = graphArray.value;
    if (!values || values.length === 0) return 100;

    // Calculate the average
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    if (mean === 0) return 0;

    // Calculate square difference (value - mean)^2
    const squareDiffs = values.map((val) => Math.pow(val - mean, 2));

    // Calculate their average
    const avgSquareDiff =
      squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;

    // Square deviation
    const standardDeviation = Math.sqrt(avgSquareDiff);

    // Calculate Coefficient of Variation and map to 0-100 scale
    const coefficientOfVariation = (standardDeviation / mean) * 100;
    const consistencyScore = 100 - coefficientOfVariation;

    // Clamp between 0 and 100 and round
    return Math.max(0, Math.min(100, Math.round(consistencyScore)));
  });

  // Done flag
  let isDone = ref<boolean>(false);

  // Functions //

  //   Stop timers
  const stopTimers = () => {
    clearInterval(timer.value);
    clearInterval(graphTimer.value);
    clearInterval(countdownTimer.value);
    timer.value = undefined;
    countdownTimer.value = undefined;
    graphTimer.value = undefined;
  };

  // Actions taken when the test is finished (Helper function)
  const finished = () => {
    // Update endTime (wpm calc) and stop the timers
    endTime.value = Date.now();
    stopTimers();

    // Calculate the average
    averageWPM.value = Math.round(
      graphArray.value.reduce((prev, val) => prev + val, 0) /
        graphArray.value.length,
    );

    // Mark as done
    isDone.value = true;
  };

  // Start timer on first keystroke
  const startTimers = ({
    currentTypedLetters,
  }: {
    currentTypedLetters: string[];
  }) => {
    // First keystroke starts the clock
    if (typedLetters.value.length === 0) return;

    // If timer is not started
    if (startTime.value === null) {
      startTime.value = Date.now();
      now.value = startTime.value;

      // Update "now" value every 250ms
      timer.value = window.setInterval(() => (now.value = Date.now()), 250);
    }
    // Record WPM entry every second, capped to quantity selected
    if (graphTimer.value === undefined) {
      graphTimer.value = window.setInterval(() => {
        if (graphArray.value.length < quantity.value) {
          graphArray.value.push(wpm.value);
        }
      }, 1000);
    }
    // When mode is time, countdownTimer manages countdown and graphArray entries
    if (mode.value === "time" && countdownTimer.value === undefined) {
      countdownTimer.value = window.setInterval(() => {
        countdown.value -= 1;

        // Generate more words to ensure user never runs out of words
        generateWords({ selectedQuantity: 5, append: true });

        // Check if finished
        if (countdown.value <= 0) {
          finished();
        }
      }, 1000);
    }

    // When mode is words. Check if finished
    if (
      mode.value === "words" &&
      currentTypedLetters.length >= letters.value.length &&
      endTime.value === null
    ) {
      finished();
    }
  };

  //   Restart
  const restart = ({ repeat = false }: { repeat?: boolean }) => {
    stopTimers();
    typedLetters.value = [];
    typedLettersRaw.value = [];
    graphArray.value = [];
    typedWords.value = [];
    mistakes.value = 0;
    now.value = Date.now();
    startTime.value = null;
    endTime.value = null;
    countdown.value = quantity.value;
    isDone.value = false;
    averageWPM.value = 0;
    correctLetters.value = 0;

    // Generate new words only on restart, not on repeat
    if (!repeat) {
      words.value = [];
      letters.value = [];
      convertedWords = 0;
    }
  };

  // Instansiate the punctuator
  const punctuate = createPunctuator();

  // Generate words (used onMount and when changing quantity)
  const generateWords = ({
    selectedMode,
    selectedQuantity,
    selectedDifficulty,
    isPunctuation,
    append = false,
  }: {
    selectedMode?: Mode;
    selectedQuantity?: number;
    selectedDifficulty?: Difficulty;
    isPunctuation?: Punctuation;
    append?: boolean;
  }) => {
    // Either selected tab value or current value
    const activeMode = selectedMode || mode.value;
    const activeQuantity = selectedQuantity || quantity.value;
    const activeDifficulty = selectedDifficulty || difficulty.value;
    const activePunctuation = isPunctuation || punctuation.value;

    // Generate words, filter them to remove more difficult ones (if need be), punctuate them (if need be) and keep doing this unitl we have enough
    while (words.value.length < activeQuantity) {
      let generatedWords: string[] =
        activeDifficulty === "Normal"
          ? (generate({
              exactly: activeQuantity,
              maxLength: 7,
            }) as string[])
          : (generate({
              exactly: activeQuantity,
              minLength: 4,
            }) as string[]);

      // Normalize only on normal difficulty
      if (activeDifficulty === "Normal") {
        generatedWords = normalizeWords({ words: generatedWords });
      }

      // Apply punctuator if active
      if (activePunctuation === "true") {
        generatedWords = punctuate({ words: generatedWords, final: true });
      }
      generatedWords.forEach((value) => {
        if (words.value.length < activeQuantity) {
          words.value.push(value);
        }
      });
    }

    // If extra words are generated (in time mode) add them to the current array
    if (append) {
      let generatedWords: string[] =
        activeDifficulty === "Normal"
          ? (generate({
              exactly: activeQuantity,
              maxLength: 7,
            }) as string[])
          : (generate({
              exactly: activeQuantity,
              minLength: 4,
            }) as string[]);

      // Normalize only on normal difficulty
      if (activeDifficulty === "Normal") {
        generatedWords = normalizeWords({ words: generatedWords });
      }

      // Apply punctuator if active
      if (activePunctuation === "true") {
        generatedWords = punctuate({ words: generatedWords, final: false });
      }

      // Add the extra words every second
      words.value = words.value.concat(generatedWords);
    }

    getLetters({
      words: words.value,
      letters: letters.value,
      fromWord: convertedWords,
      mode: activeMode,
    });

    // Update converted words
    convertedWords = words.value.length;
  };

  return {
    typedLetters,
    typedWords,
    words,
    letters,
    typedLettersRaw,
    mode,
    quantity,
    graphArray,
    time,
    correctLetters,
    correctWords,
    accuracy,
    isDone,
    startTimers,
    stopTimers,
    countdown,
    restart,
    generateWords,
    progress,
    consistency,
    mistakes,
    averageWPM,
    difficulty,
    punctuation,
    typedFor,
    cursorFor,
  };
}
