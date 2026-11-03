export default function isMatchingLowerCase({
  letter,
  typedLetters,
  index,
}: {
  letter: string;
  typedLetters: string[];
  index: number;
}): boolean {
  return letter.toLowerCase() === typedLetters[index].toLowerCase();
}
