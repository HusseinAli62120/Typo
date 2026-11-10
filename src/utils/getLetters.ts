import type { Mode } from "@/types/Mode";

export default function getLetters({
  words,
  letters,
  fromWord = 0,
  mode,
}: {
  words: string[];
  letters: string[];
  fromWord?: number; // How many words to skip (already converted to letters)
  mode: Mode;
}) {
  for (let i = fromWord; i < words.length; i++) {
    let word = words[i];
    let wordLetters = word.split("");

    // Add the letters to the end of the array with a space
    if (i < words.length - 1) {
      letters.push(...wordLetters, " ");
      // final Character
    } else {
      // In time mode, continue adding spaces, since the words are infinite (Final word in this case represents the batch)
      if (mode === "time") letters.push(...wordLetters, " ");
      // In words mode, don't add a space to the final character
      else letters.push(...wordLetters);
    }
  }
}
