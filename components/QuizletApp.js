import React, { useState } from "react";

const QuizletApp = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");

  const addQuestion = () => {
    setQuestions([...questions, newQuestion]);
    setNewQuestion("");
  };

  return (
    <div>
      <h2>Quizlet App</h2>
      <input
        type="text"
        value={newQuestion}
        onChange={(e) => setNewQuestion(e.target.value)}
        placeholder="Add a new question"
      />
      <button onClick={addQuestion}>Add Question</button>
      <ul>
        {questions.map((question, index) => (
          <li key={index}>{question}</li>
        ))}
      </ul>
    </div>
  );
};

export default QuizletApp;
