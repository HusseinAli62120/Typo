import { ref, type Ref } from "vue";
import { allowedKeys } from "./values";
import type { Punctuation } from "@/types/Punctuation";
import isMatching from "./isMatching";

let currentWord = ref<string>("");

export const captureKeyStroke = ({
  e,
  typedLetters,
  letters,
  typedWords,
  typedLettersRaw,
  mistakes,
  correctLetters, // NEW: pass the ref from the composable
  isPunctuation = "false",
}: {
  e: KeyboardEvent;
  typedLetters: string[];
  letters: string[];
  typedWords: string[];
  typedLettersRaw: string[];
  mistakes: Ref<number>;
  correctLetters: Ref<number>;
  isPunctuation: Punctuation;
}) => {
  // If no typed letters, current word is empty
  if (typedLetters.length === 0) currentWord.value = "";

  // Stop if done typing
  if (typedLetters.length >= letters.length) return;

  // stop Space from scrolling
  if (
    e.target instanceof HTMLElement &&
    e.target.matches("input, textarea, [contenteditable]")
  )
    return;

  if (!allowedKeys.includes(e.key)) return;

  // Command keys
  if (e.ctrlKey) {
    if (["c", "C", "r", "R"].includes(e.key)) currentWord.value = "";
    return;
  }

  // Delete on backspace
  if (e.key === "Backspace") {
    // Previous expected character index
    const last = typedLetters.length - 1;
    if (last < 0) return;

    // Check if the letter about to be removed is correct, if so, decrement the count
    // Decrement BEFORE popping, using the letter that is about to be removed
    if (
      isMatching({
        typedLetter: typedLetters[last],
        letter: letters[last],
        isPunctuation: isPunctuation,
      })
    ) {
      correctLetters.value--;
    }

    // If previous expected was " ", remove it from typed words and set the popped value to the current word
    if (letters[last] === " ") {
      currentWord.value = typedWords.pop() ?? "";
      // Just remove the letter from the current word
    } else {
      currentWord.value = currentWord.value.slice(0, -1);
    }
    typedLetters.pop();
    return;
  }

  if (e.key === "Enter") {
    console.log("Submit");
    return;
  }

  // Space or a normal character //

  // Prevent scrolling
  if (e.key === " ") {
    e.preventDefault();
  }

  // Get the expected character and see if what is typed is correct
  const expectedCharacter = letters[typedLetters.length];
  const matched = isMatching({
    typedLetter: e.key,
    letter: expectedCharacter,
    isPunctuation: isPunctuation,
  });

  typedLettersRaw.push(e.key);

  // Check if the key is correct
  if (matched) correctLetters.value++;
  else {
    mistakes.value++;
    // console.log(`mistake: ${mistakes.value}`);
  }
  // console.log(expectedCharacter);
  // console.log(e.key);

  // If expected character is a space, that means new word, push the current word and reset it.
  if (expectedCharacter === " ") {
    typedWords.push(currentWord.value);
    // console.log(`typed words: ${typedWords.length}`);

    currentWord.value = "";
  } else {
    currentWord.value += e.key;
  }
  typedLetters.push(e.key);

  // Push the final word when all letters have been typed and reset current word
  if (typedLetters.length === letters.length && currentWord.value) {
    typedWords.push(currentWord.value);
    currentWord.value = "";
  }

  // console.log(currentWord.value);
};
