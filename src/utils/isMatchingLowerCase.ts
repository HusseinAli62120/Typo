export default function isMatchingLowerCase({
  char,
  typedValue,
  index,
}: {
  char: string;
  typedValue: string[];
  index: number;
}): boolean {
  return char.toLowerCase() === typedValue[index].toLowerCase();
}
