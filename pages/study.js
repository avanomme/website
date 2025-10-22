```javascript
import React from "react";
import FlashcardApp from "../components/FlashcardApp";
import { parseFlashcardsFile } from "../lib/parseFlashcards";
import path from "path";

const StudyPage = ({ cards }) => {
  return (
    <div>
      <h1>Study</h1>
      <p>Study your flashcards below.</p>
      <FlashcardApp initialFlashcards={cards} />
    </div>
  );
};

export async function getStaticProps() {
  const filePath = path.join(process.cwd(), "flash_cards", "cards.md");
  const cards = parseFlashcardsFile(filePath).slice(0, 1000); // safety cap

  return {
    props: {
      cards,
    },
  };
}

export default StudyPage;

```