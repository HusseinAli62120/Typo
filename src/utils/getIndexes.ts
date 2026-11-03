// Get the typedLetters index of the first letter for a specific word
export const getWordStartIndex = ({
  wordIndex,
  words,
}: {
  wordIndex: number;
  words: string[];
}) => {
  let start = 0;
  // Loop the word index (get the length of each previous word and add them)
  for (let idx = 0; idx < wordIndex; idx++) {
    start += words[idx].length + 1; // word length + 1 space
  }
  return start;
};

// Returns the typedLetters index of a letter for a specific word
export const getLetterIndex = ({
  letterIndex,
  wordIndex,
  words,
}: {
  letterIndex: number;
  wordIndex: number;
  words: string[];
}) => {
  const wordStartIndex = getWordStartIndex({
    wordIndex: wordIndex,
    words: words,
  });
  return wordStartIndex + letterIndex;
};
