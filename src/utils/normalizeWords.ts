import { awkwardChars } from "./values";

export const normalizeWords = ({ words }: { words: string[] }): string[] => {
  return words.filter((word) => {
    // Filter out words with awkward letters (Q, X, J, W, Z)
    if (awkwardChars.test(word)) return false;

    // Filter out words with heavy consonant clusters (e.g., 3+ consonants in a row)
    if (/[bcdfghjklmnpqrstvwxyz]{3,}/i.test(word)) return false;
    return true;
  });
};
