import fs from "fs";

/**
 * Very small parser for the cards.md format used in flash_cards/cards.md
 * It looks for lines starting with `#flashcards/` and then captures the
 * following question and answer block. The parser is intentionally simple
 * and defensive.
 */
export function parseFlashcardsFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  const cards = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line && line.startsWith("#flashcards/")) {
      const tag = line.slice("#flashcards/".length).trim();

      // advance to next non-empty line
      i++;
      while (i < lines.length && lines[i].trim() === "") i++;

      // question line usually like: **1.1**  *Question text*
      const qLine = i < lines.length ? lines[i].trim() : "";
      let question = qLine;
      let cardNumber = null;

      // Extract card number (e.g., "1.1" from "**1.1** *text*")
      const numMatch = qLine.match(/\*\*([\d.]+)\*\*/);
      if (numMatch) cardNumber = numMatch[1];

      const qm = qLine.match(/\*\*[^*]+\*\*\s*(.*)/);
      if (qm) question = qm[1].trim();

      // move forward; there is often a line with only '?' next
      i++;
      if (i < lines.length && lines[i].trim() === "?") i++;

      // collect answer lines until next #flashcards/ marker
      const ans = [];
      while (i < lines.length && !lines[i].startsWith("#flashcards/")) {
        ans.push(lines[i]);
        i++;
      }

      // clean up answer: remove leading list markers and excessive indentation
      const answer = ans
        .map((l) => l.replace(/^\s*[-\*]?\s?/, ""))
        .join("\n")
        .trim();

      cards.push({ tag, question: question || "", answer, cardNumber });
      continue;
    }
    i++;
  }

  return cards;
}
