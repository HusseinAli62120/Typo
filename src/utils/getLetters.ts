export default function getLetters({ text }: { text: string[] }) {
  let length = text.length;

  for (let index = 0; index < length; index++) {
    // Get the first word and its letters
    let word = text[0];
    let letters = word.split("");

    // Delete the first word
    text.splice(0, 1);

    // Add the letters to the end of the array with a space
    text.push(...letters, " ");

    // By the end of the loop, the array should be the same as the initial array, but letters instead of words
  }
  // Capitalize the first letter
  text[0] = text[0].toUpperCase();
}
