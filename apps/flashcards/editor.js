// Flashcard Editor - Generate markdown for different card types

let currentCardType = 'flashcard';
let choiceCounter = 2; // Start at 'c' since we have a and b by default

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupCardTypeButtons();
});

function setupCardTypeButtons() {
  const buttons = document.querySelectorAll('.card-type-button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active state
      buttons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');

      // Switch card type
      currentCardType = button.dataset.type;
      switchCardType(currentCardType);
    });
  });
}

function switchCardType(type) {
  // Hide all template fields
  document.querySelectorAll('.template-fields').forEach(field => {
    field.classList.remove('active');
  });

  // Show selected template
  const fieldMap = {
    'flashcard': 'flashcardFields',
    'quiz': 'quizFields',
    'review': 'reviewFields'
  };

  const targetField = document.getElementById(fieldMap[type]);
  if (targetField) {
    targetField.classList.add('active');
  }

  // Hide output when switching types
  document.getElementById('outputSection').style.display = 'none';
}

function addChoice() {
  const container = document.getElementById('choicesContainer');
  const letters = 'cdefghijklmnopqrstuvwxyz';
  const letter = letters[choiceCounter];

  if (choiceCounter >= letters.length) {
    alert('Maximum number of choices reached');
    return;
  }

  const choiceDiv = document.createElement('div');
  choiceDiv.className = 'choice-group';
  choiceDiv.innerHTML = `
    <input type="text" class="choice-text" placeholder="Choice ${letter})" data-letter="${letter}">
    <label>
      <input type="checkbox" class="choice-correct" data-letter="${letter}">
      Correct answer
    </label>
  `;

  container.appendChild(choiceDiv);
  choiceCounter++;
}

function generateMarkdown() {
  const section = document.getElementById('cardSection').value.trim();
  const cardId = document.getElementById('cardId').value.trim();

  if (!section || !cardId) {
    alert('Please fill in Section/Topic and Card ID');
    return;
  }

  let markdown = '';

  switch (currentCardType) {
    case 'flashcard':
      markdown = generateFlashcardMarkdown(section, cardId);
      break;
    case 'quiz':
      markdown = generateQuizMarkdown(section, cardId);
      break;
    case 'review':
      markdown = generateReviewMarkdown(section, cardId);
      break;
  }

  if (markdown) {
    displayOutput(markdown);
  }
}

function generateFlashcardMarkdown(section, cardId) {
  const question = document.getElementById('fcQuestion').value.trim();
  const answer = document.getElementById('fcAnswer').value.trim();

  if (!question || !answer) {
    alert('Please fill in both question and answer');
    return '';
  }

  return `#flashcards/${section}
**${cardId}** *${question}*
?
${answer}
`;
}

function generateQuizMarkdown(section, cardId) {
  const question = document.getElementById('quizQuestion').value.trim();
  const explanation = document.getElementById('quizExplanation').value.trim();

  if (!question) {
    alert('Please fill in the question');
    return '';
  }

  // Get all choices
  const choiceTexts = document.querySelectorAll('.choice-text');
  const choiceCorrects = document.querySelectorAll('.choice-correct');

  const choices = [];
  let correctAnswers = [];

  choiceTexts.forEach((input, index) => {
    const text = input.value.trim();
    if (text) {
      const letter = input.dataset.letter;
      const isCorrect = choiceCorrects[index].checked;
      choices.push({ letter, text, isCorrect });
      if (isCorrect) {
        correctAnswers.push({ letter, text });
      }
    }
  });

  if (choices.length < 2) {
    alert('Please add at least 2 choices');
    return '';
  }

  if (correctAnswers.length === 0) {
    alert('Please mark at least one correct answer');
    return '';
  }

  // Build markdown
  let markdown = `#flashcards/${section}
**${cardId}** *${question}*

`;

  // Add choices
  choices.forEach(choice => {
    markdown += `${choice.letter}) ${choice.text}\n`;
  });

  markdown += `?\n`;

  // Add correct answer(s)
  if (correctAnswers.length === 1) {
    markdown += `**${correctAnswers[0].letter}) ${correctAnswers[0].text}** ✓\n`;
  } else {
    markdown += `**Correct answers:**\n`;
    correctAnswers.forEach(answer => {
      markdown += `- **${answer.letter}) ${answer.text}** ✓\n`;
    });
  }

  // Add explanation if provided
  if (explanation) {
    markdown += `\nExplanation: ${explanation}\n`;
  }

  return markdown;
}

function generateReviewMarkdown(section, cardId) {
  const title = document.getElementById('reviewTitle').value.trim();
  const mainIdea = document.getElementById('reviewMainIdea').value.trim();
  const advantages = document.getElementById('reviewAdvantages').value.trim();
  const disadvantages = document.getElementById('reviewDisadvantages').value.trim();
  const requirements = document.getElementById('reviewRequirements').value.trim();
  const lossFunction = document.getElementById('reviewLossFunction').value.trim();
  const notes = document.getElementById('reviewNotes').value.trim();

  if (!title || !mainIdea) {
    alert('Please fill in at least Title and Main Idea');
    return '';
  }

  let markdown = `#flashcards/${section}
**${title}**
?
`;

  if (mainIdea) {
    markdown += `**Main Idea:** ${mainIdea}\n\n`;
  }

  if (advantages) {
    markdown += `**Advantages:**\n${advantages}\n\n`;
  }

  if (disadvantages) {
    markdown += `**Disadvantages:**\n${disadvantages}\n\n`;
  }

  if (requirements) {
    markdown += `**Requirements:**\n\n${requirements}\n\n`;
  }

  if (lossFunction) {
    markdown += `**Loss Function:** ${lossFunction}\n\n`;
  }

  if (notes) {
    markdown += `**Note:** ${notes}\n`;
  }

  return markdown;
}

function displayOutput(markdown) {
  const output = document.getElementById('markdownOutput');
  const outputSection = document.getElementById('outputSection');

  output.textContent = markdown;
  outputSection.style.display = 'block';

  // Scroll to output
  outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function copyToClipboard() {
  const output = document.getElementById('markdownOutput');
  const text = output.textContent;

  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✅ Copied!';
    btn.style.background = '#22c55e';

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '#4ade80';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy to clipboard. Please copy manually.');
  });
}

function clearForm() {
  if (!confirm('Are you sure you want to clear all fields?')) {
    return;
  }

  // Clear common fields
  document.getElementById('cardSection').value = '';
  document.getElementById('cardId').value = '';

  // Clear flashcard fields
  document.getElementById('fcQuestion').value = '';
  document.getElementById('fcAnswer').value = '';

  // Clear quiz fields
  document.getElementById('quizQuestion').value = '';
  document.getElementById('quizExplanation').value = '';

  // Reset choices
  const container = document.getElementById('choicesContainer');
  container.innerHTML = `
    <div class="choice-group">
      <input type="text" class="choice-text" placeholder="Choice a)" data-letter="a">
      <label>
        <input type="checkbox" class="choice-correct" data-letter="a">
        Correct answer
      </label>
    </div>
    <div class="choice-group">
      <input type="text" class="choice-text" placeholder="Choice b)" data-letter="b">
      <label>
        <input type="checkbox" class="choice-correct" data-letter="b">
        Correct answer
      </label>
    </div>
  `;
  choiceCounter = 2;

  // Clear review fields
  document.getElementById('reviewTitle').value = '';
  document.getElementById('reviewMainIdea').value = '';
  document.getElementById('reviewAdvantages').value = '';
  document.getElementById('reviewDisadvantages').value = '';
  document.getElementById('reviewRequirements').value = '';
  document.getElementById('reviewLossFunction').value = '';
  document.getElementById('reviewNotes').value = '';

  // Hide output
  document.getElementById('outputSection').style.display = 'none';
}
