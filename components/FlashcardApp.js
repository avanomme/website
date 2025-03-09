import React, { useState } from "react";

const FlashcardApp = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [newFlashcard, setNewFlashcard] = useState({
    question: "",
    answer: "",
  });

  const addFlashcard = () => {
    setFlashcards([...flashcards, newFlashcard]);
    setNewFlashcard({ question: "", answer: "" });
  };

  return (
    <div>
      <h2>Flashcard App</h2>
      <input
        type="text"
        value={newFlashcard.question}
        onChange={(e) =>
          setNewFlashcard({ ...newFlashcard, question: e.target.value })
        }
        placeholder="Question"
      />
      <input
        type="text"
        value={newFlashcard.answer}
        onChange={(e) =>
          setNewFlashcard({ ...newFlashcard, answer: e.target.value })
        }
        placeholder="Answer"
      />
      <button onClick={addFlashcard}>Add Flashcard</button>
      <ul>
        {flashcards.map((flashcard, index) => (
          <li key={index}>
            <strong>Q:</strong> {flashcard.question} <br />
            <strong>A:</strong> {flashcard.answer}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FlashcardApp;
