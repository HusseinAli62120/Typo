import type { Punctuation } from "@/types/Punctuation";

export default function isMatching({
  letter,
  typedLetter,
  isPunctuation = "false",
}: {
  letter: string;
  typedLetter: string;
  isPunctuation: Punctuation;
}): boolean {
  if (isPunctuation === "true") {
    return letter === typedLetter;
  }

  return letter.toLowerCase() === typedLetter.toLowerCase();
}
