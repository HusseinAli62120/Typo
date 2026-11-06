const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export function createPunctuator() {
  let target = rand(5, 12); // words in the current sentence
  let position = 0; // words written so far in this sentence
  let sinceComma = 99; // words since the last comma

  return ({ words, final = false }: { words: string[]; final: boolean }) =>
    words.map((word, i) => {
      let out = word;

      if (position === 0) out = out[0].toUpperCase() + out.slice(1);
      position++;
      sinceComma++;

      const endsSentence =
        position >= target || (final && i === words.length - 1);

      if (endsSentence) {
        const r = Math.random();
        out += r < 0.85 ? "." : r < 0.93 ? "?" : "!";
        position = 0;
        target = rand(5, 12);
        sinceComma = 99;
      } else if (
        target >= 6 &&
        position >= 2 &&
        position <= target - 2 &&
        sinceComma >= 3 &&
        Math.random() < 0.3
      ) {
        out += ",";
        sinceComma = 0;
      }

      return out;
    });
}
