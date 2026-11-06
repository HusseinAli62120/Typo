// Allowed characters

const small = "abcdefghijklmnopqrstuvwxyz".split("");
const capital = small.map((c) => c.toUpperCase());
const digits = "0123456789".split("");

// Uncommon/awkward typing letters (To filter out for normal mode)
export const awkwardChars = /[qxjwz]/i;

export const allowedKeys = [
  ...small,
  ...capital,
  ...digits,
  ",",
  ".",
  "!",
  "?",
  "&",

  // Action keys
  "Backspace",
  "Enter",
  " ",
];
