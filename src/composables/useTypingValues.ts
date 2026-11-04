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

  // Times
  const startTime = ref<number | null>(null);
  const endTime = ref<number | null>(null);
  const now = ref(Date.now());
  let timer = ref<number | undefined>(undefined);
  let graphArray = ref<number[]>([]);
  let graphTimer = ref<number | undefined>(undefined);

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

  //   Stats
  const correctCharacters = computed(() => {
    let count = 0;
    for (let i = 0; i < typedLetters.value.length; i++) {
      if (typedLetters.value[i] === letters.value[i]) count++;
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
    timer.value = undefined;
    graphTimer.value = undefined;
  };

  const startTimers = ({
    currentTypedLetters,
  }: {
    currentTypedLetters: string[];
  }) => {
    // First keystroke starts the clock
    if (typedLetters.value.length === 0) return;

    if (startTime.value === null) {
      startTime.value = Date.now();
      now.value = startTime.value;

      // Update "now" value every 250ms
      timer.value = window.setInterval(() => (now.value = Date.now()), 250);

      // Record WPM every second
      graphTimer.value = window.setInterval(() => {
        graphArray.value.push(wpm.value);
      }, 1000);
    }

    // Finished the text: freeze the clock
    if (
      currentTypedLetters.length >= letters.value.length &&
      endTime.value === null
    ) {
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
    isDone.value = false;

    // Generate new words only on restart, not on repeat
    if (!repeat) {
      words.value = [];
      letters.value = [];
      words.value = generate(15) as string[];
      getLetters({ words: words.value, letters: letters.value });
    }
  };

  return {
    typedLetters,
    typedWords,
    words,
    letters,
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
    restart,
  };
}
