import type { Mode } from "@/types/Mode";
import type { Quantity } from "@/types/Quantity";
import getLetters from "@/utils/getLetters";
import { generate } from "random-words";
import { computed, ref } from "vue";

export default function useTypingValues() {
  // What the user is typing
  let typedLetters = ref<string[]>([]);
  let typedWords = ref<string[]>([]);

  // The text to type
  let words = ref<string[]>([]);
  let letters = ref<string[]>([]);

  // Modes
  let mode = ref<Mode>("time");
  let quantity = ref<Quantity>(15);

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

  const elapsedSeconds = computed(() => {
    if (startTime.value === null) return 0;
    // Divided by 1000 since they are in milliseconds
    return Math.floor(((endTime.value ?? now.value) - startTime.value) / 1000);
  });

  // Time shown
  const time = computed(() => {
    // Choose whether the seconds are couup (words mode) or counted down (time mode)nted
    const selectedSeconds =
      mode.value === "words"
        ? elapsedSeconds.value
        : Math.max(countdown.value, 0); // Edge cases where it goes to -1 This prevents that

    // Get minutes and format
    const minutes = `${Math.floor(selectedSeconds / 60)}`;
    const seconds = `${Math.floor(selectedSeconds % 60)
      .toString()
      .padStart(2, "0")}`;
    return `${minutes}:${seconds}`;
  });

  //   Stats  //

  // Correct characters
  const correctCharacters = computed(() => {
    let count = 0;
    for (let i = 0; i < typedLetters.value.length; i++) {
      if (typedLetters.value[i] === letters.value[i]) count++;
    }
    return count;
  });

  // Words per minutes
  const wpm = computed(() => {
    // floor at 1 second so the first keystrokes don't show a huge spike
    const minutes = Math.max(elapsedSeconds.value / 60, 1 / 60);
    return startTime.value
      ? Math.round(correctCharacters.value / 5 / minutes)
      : 0;
  });

  // Accuracy
  const accuracy = computed(() =>
    typedLetters.value.length
      ? Math.round((correctCharacters.value / typedLetters.value.length) * 100)
      : 100,
  );

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

    // If graph timer is not started, start it
    if (graphTimer.value === undefined) {
      // Record WPM every second
      graphTimer.value = window.setInterval(() => {
        graphArray.value.push(wpm.value);
      }, 1000);
    }

    // when mode is time
    if (mode.value === "time" && countdownTimer.value === undefined) {
      // Countdown
      countdownTimer.value = setInterval(() => {
        countdown.value -= 1;
        console.log(countdown.value);

        // Check if finished (This is in the interval because the function executes on keystroke,
        // and when the time reaches 0, no one will click, so, if the check is in the function, we will never
        // reach the results page
        if (mode.value === "time" && countdown.value <= 0) {
          // Update endTime (wpm calc) and stop the timers
          endTime.value = Date.now();
          stopTimers();

          // Push the final wpm value
          graphArray.value.push(wpm.value);
          setTimeout(() => {
            isDone.value = true;
          }, 200);
        }
      }, 1000);
    }

    // When mode is words. Check if finished
    if (
      mode.value === "words" &&
      currentTypedLetters.length >= letters.value.length &&
      endTime.value === null
    ) {
      // Update endTime (wpm calc) and stop the timers
      endTime.value = Date.now();
      stopTimers();
      setTimeout(() => {
        isDone.value = true;
      }, 200);
    }
  };

  //   Restart
  const restart = ({ repeat = false }: { repeat?: boolean }) => {
    stopTimers();
    typedLetters.value = [];
    graphArray.value = [];
    typedWords.value = [];
    now.value = Date.now();
    startTime.value = null;
    endTime.value = null;
    countdown.value = quantity.value;
    isDone.value = false;

    // Generate new words only on restart, not on repeat
    if (!repeat) {
      words.value = [];
      letters.value = [];
      words.value = generate(quantity.value) as string[];
      getLetters({ words: words.value, letters: letters.value });
    }
  };

  // Generate words (used onMount and when changing quantity)
  const generateWords = ({
    selectedQuantity,
  }: {
    selectedQuantity?: number;
  }) => {
    words.value = generate(selectedQuantity ?? quantity.value) as string[];
    getLetters({ words: words.value, letters: letters.value });
  };

  return {
    typedLetters,
    typedWords,
    words,
    letters,
    mode,
    quantity,
    startTime,
    endTime,
    now,
    timer,
    graphArray,
    graphTimer,
    elapsedSeconds,
    time,
    correctCharacters,
    wpm,
    accuracy,
    isDone,
    startTimers,
    stopTimers,
    countdown,
    countdownTimer,
    restart,
    generateWords,
  };
}
