export default function getLetters({
  words,
  letters,
}: {
  words: string[];
  letters: string[];
}) {
  let length = words.length;

  for (let index = 0; index < length; index++) {
    // Get the first word and its letters
    let word = words[index];
    let wordLetters = word.split("");

    // Add the letters to the end of the array with a space
    if (index < length - 1) {
      letters.push(...wordLetters, " ");
      // final Character, don't add space
    } else {
      letters.push(...wordLetters);
    }

    // By the end of the loop, the letters array should have the letters of each word
  }
}
