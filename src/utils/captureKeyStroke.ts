import { allowedKeys } from "./values";

export const captureKeyStroke = ({
  e,
  typedValue,
  text,
}: {
  e: KeyboardEvent;
  typedValue: string[];
  text: string[];
}) => {
  // Stop if done typing
  if (typedValue.length >= text.length) return;

  // stop Space from scrolling
  if (
    e.target instanceof HTMLElement &&
    e.target.matches("input, textarea, [contenteditable]")
  )
    return;

  if (e.key === " ") e.preventDefault();

  // Return special commands
  if (!allowedKeys.includes(e.key)) return;
  // Delete on backspace
  else if (e.key === "Backspace") {
    typedValue.pop();

    // Submit
  } else if (e.key === "Enter") {
    console.log("Submit");

    // Space
  } else if (e.key === " ") {
    console.log("Space pressed");
    typedValue.push(" ");
  }

  // Add character
  else {
    typedValue.push(e.key);
  }
};
