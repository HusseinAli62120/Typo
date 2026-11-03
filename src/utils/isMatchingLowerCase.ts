export default function isMatchingLowerCase({
  char,
  typedLetters,
  index,
}: {
  char: string;
  typedLetters: string[];
  index: number;
}): boolean {
  return char.toLowerCase() === typedLetters[index].toLowerCase();
}
