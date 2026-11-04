import { ref } from "vue";
import { allowedKeys } from "./values";

let currentWord = ref<string>("");

export const captureKeyStroke = ({
  e,
  typedLetters,
  letters,
  typedWords,
}: {
  e: KeyboardEvent;
  typedLetters: string[];
  letters: string[];
  typedWords: string[];
}) => {
  // Stop if done typing
  if (typedLetters.length >= letters.length) return;

  // stop Space from scrolling
  if (
    e.target instanceof HTMLElement &&
    e.target.matches("input, textarea, [contenteditable]")
  )
    return;

  const expectedCharacter = letters[typedLetters.length];

  const isSpace = expectedCharacter === " ";

  // Check if the key is allowed
  if (!allowedKeys.includes(e.key)) return;
  // Check for command keys
  else if (e.ctrlKey) {
    // Repeat or restart keys
    if (e.key === "c" || e.key === "C" || e.key === "r" || e.key === "R") {
      currentWord.value = "";
      return;
    }
  }
  // Delete on backspace
  else if (e.key === "Backspace") {
    // Nothing to delete
    if (typedLetters.length === 0) {
      return;
    }

    const previousExpectedCharacter = letters[typedLetters.length - 1];
    console.log(previousExpectedCharacter);

    // Is space
    if (previousExpectedCharacter === " ") {
      const deletedWord = typedWords.pop();
      currentWord.value = deletedWord as string;
      typedLetters.pop();
    } else {
      currentWord.value = currentWord.value.slice(0, -1);
      typedLetters.pop();
    }

    // Submit
  } else if (e.key === "Enter") {
    console.log("Submit");

    // Space
  } else if (e.key === " ") {
    e.preventDefault();

    if (isSpace) {
      typedWords.push(currentWord.value);
      currentWord.value = "";
      typedLetters.push(e.key);
    } else {
      typedLetters.push(e.key);
      currentWord.value += e.key;
    }
  }

  // Add character
  else {
    if (isSpace) {
      typedWords.push(currentWord.value);
      currentWord.value = "";
      typedLetters.push(e.key);
    } else {
      currentWord.value += e.key;
      typedLetters.push(e.key);
    }
  }

  // Push the final word when all letters have been typed and reset current word
  if (typedLetters.length === letters.length && currentWord.value) {
    typedWords.push(currentWord.value);
    currentWord.value = "";
  }

  console.log(currentWord.value);
};
