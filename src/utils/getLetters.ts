export default function getLetters({
  words,
  letters,
  fromWord = 0,
}: {
  words: string[];
  letters: string[];
  fromWord?: number;
}) {
  for (let i = fromWord; i < words.length; i++) {
    let word = words[i];
    let wordLetters = word.split("");

    // Add the letters to the end of the array with a space
    if (i < words.length - 1) {
      letters.push(...wordLetters, " ");
      // final Character, don't add space
    } else {
      letters.push(...wordLetters);
    }
  }
}
