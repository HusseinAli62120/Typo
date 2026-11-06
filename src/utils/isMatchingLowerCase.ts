import type { Punctuation } from "@/types/Punctuation";

export default function isMatchingLowerCase({
  letter,
  typedLetters,
  index,
  isPunctuation,
}: {
  letter: string;
  typedLetters: string[];
  index: number;
  isPunctuation: Punctuation;
}): boolean {
  if (isPunctuation === "true") {
    return letter === typedLetters[index];
  }
  return letter.toLowerCase() === typedLetters[index].toLowerCase();
}
