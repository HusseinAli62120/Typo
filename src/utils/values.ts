// Allowed characters

const small = "abcdefghijklmnopqrstuvwxyz".split("");
const capital = small.map((c) => c.toUpperCase());
const digits = "0123456789".split("");

export const allowedKeys = [
  ...small,
  ...capital,
  ...digits,
  ",",
  ".",

  // Action keys
  "Backspace",
  "Enter",
  " ",
];
