// Flashcard Editor - Generate markdown for different card types

let currentCardType = 'flashcard';
let choiceCounter = 2; // Start at 'c' since we have a and b by default

// Logging function
async function logEvent(eventType, data = {}) {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: eventType,
        data: data
      })
    });
  } catch (error) {
    console.error('Failed to log event:', error);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupCardTypeButtons();

  // Check if we're editing an existing card (passed via URL params)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('edit')) {
    loadCardForEditing(urlParams);
  }

  // Log page view
  logEvent('page_view', {
    page: 'editor',
    referrer: document.referrer
  });
});

function loadCardForEditing(params) {
  // Get card data from URL parameters
  const cardType = params.get('type') || 'flashcard';
  const section = params.get('section') || '';

  // Switch to the appropriate card type
  const typeButton = document.querySelector(`[data-type="${cardType}"]`);
  if (typeButton) {
    typeButton.click();
  }

  // Populate common fields
  document.getElementById('cardSection').value = decodeURIComponent(section);

  if (cardType === 'flashcard') {
    const cardId = params.get('id') || '';
    let question = params.get('q') || '';
    const answer = params.get('a') || '';

    // Decode the question
    question = decodeURIComponent(question);

    // Remove card ID from question if it exists at the start (e.g., "**1.1** *Question?*")
    // Match **ID** and remove it along with any following whitespace
    question = question.replace(/^\*\*[^\*]+\*\*\s*/, '');

    document.getElementById('cardId').value = decodeURIComponent(cardId);
    document.getElementById('fcQuestion').value = question;
    document.getElementById('fcAnswer').value = decodeURIComponent(answer);
  } else if (cardType === 'review') {
    const title = params.get('title') || '';
    const content = params.get('content') || '';

    document.getElementById('reviewTitle').value = decodeURIComponent(title);

    // Parse content to extract structured fields
    const parsed = parseReviewContent(decodeURIComponent(content));
    if (parsed.mainIdea) document.getElementById('reviewMainIdea').value = parsed.mainIdea;
    if (parsed.advantages) document.getElementById('reviewAdvantages').value = parsed.advantages;
    if (parsed.disadvantages) document.getElementById('reviewDisadvantages').value = parsed.disadvantages;
    if (parsed.requirements) document.getElementById('reviewRequirements').value = parsed.requirements;
    if (parsed.lossFunction) document.getElementById('reviewLossFunction').value = parsed.lossFunction;
    if (parsed.notes) document.getElementById('reviewNotes').value = parsed.notes;
  }

  // Scroll to form
  document.querySelector('.editor-form').scrollIntoView({ behavior: 'smooth' });
}

function parseReviewContent(content) {
  const result = {
    mainIdea: '',
    advantages: '',
    disadvantages: '',
    requirements: '',
    lossFunction: '',
    notes: ''
  };

  const lines = content.split('\n');
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('**Main Idea:**')) {
      if (currentSection) {
        result[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'mainIdea';
      currentContent = [line.replace('**Main Idea:**', '').trim()];
    } else if (trimmed.startsWith('**Advantages:**')) {
      if (currentSection) {
        result[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'advantages';
      currentContent = [];
    } else if (trimmed.startsWith('**Disadvantages:**')) {
      if (currentSection) {
        result[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'disadvantages';
      currentContent = [];
    } else if (trimmed.startsWith('**Requirements:**')) {
      if (currentSection) {
        result[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'requirements';
      currentContent = [];
    } else if (trimmed.startsWith('**Loss Function:**') || trimmed.startsWith('**Loss / Cost Function:**')) {
      if (currentSection) {
        result[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'lossFunction';
      currentContent = [line.replace(/\*\*(Loss Function|Loss \/ Cost Function):\*\*/, '').trim()];
    } else if (trimmed.startsWith('**Note:**') || trimmed.startsWith('**Notes:**') || trimmed.startsWith('**Additional Notes:**')) {
      if (currentSection) {
        result[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'notes';
      currentContent = [line.replace(/\*\*(Note|Notes|Additional Notes):\*\*/, '').trim()];
    } else if (currentSection && trimmed) {
      currentContent.push(line);
    }
  }

  // Save the last section
  if (currentSection) {
    result[currentSection] = currentContent.join('\n').trim();
  }

  return result;
}

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

async function generateMarkdown() {
  const section = document.getElementById('cardSection').value.trim();
  const cardId = document.getElementById('cardId').value.trim();

  if (!section || !cardId) {
    alert('Please fill in Section/Topic and Card ID');
    return;
  }

  // Prepare card data for API
  let cardData = {
    type: currentCardType,
    section: section,
    card_id: cardId
  };

  let markdown = '';

  switch (currentCardType) {
    case 'flashcard':
      cardData.question = document.getElementById('fcQuestion').value.trim();
      cardData.answer = document.getElementById('fcAnswer').value.trim();

      if (!cardData.question || !cardData.answer) {
        alert('Please fill in both question and answer');
        return;
      }

      markdown = generateFlashcardMarkdown(section, cardId);
      break;

    case 'quiz':
      cardData.question = document.getElementById('quizQuestion').value.trim();
      cardData.explanation = document.getElementById('quizExplanation').value.trim();

      if (!cardData.question) {
        alert('Please fill in the question');
        return;
      }

      // Get choices
      const choiceTexts = document.querySelectorAll('.choice-text');
      const choiceCorrects = document.querySelectorAll('.choice-correct');
      cardData.choices = [];

      choiceTexts.forEach((input, index) => {
        const text = input.value.trim();
        if (text) {
          cardData.choices.push({
            letter: input.dataset.letter,
            text: text,
            isCorrect: choiceCorrects[index].checked
          });
        }
      });

      if (cardData.choices.length < 2) {
        alert('Please add at least 2 choices');
        return;
      }

      if (!cardData.choices.some(c => c.isCorrect)) {
        alert('Please mark at least one correct answer');
        return;
      }

      markdown = generateQuizMarkdown(section, cardId);
      break;

    case 'review':
      cardData.title = document.getElementById('reviewTitle').value.trim();
      cardData.main_idea = document.getElementById('reviewMainIdea').value.trim();
      cardData.advantages = document.getElementById('reviewAdvantages').value.trim();
      cardData.disadvantages = document.getElementById('reviewDisadvantages').value.trim();
      cardData.requirements = document.getElementById('reviewRequirements').value.trim();
      cardData.loss_function = document.getElementById('reviewLossFunction').value.trim();
      cardData.notes = document.getElementById('reviewNotes').value.trim();

      if (!cardData.title || !cardData.main_idea) {
        alert('Please fill in at least Title and Main Idea');
        return;
      }

      markdown = generateReviewMarkdown(section, cardId);
      break;
  }

  // Save card to server
  try {
    const response = await fetch('/api/cards/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cardData)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Show success message
      displayOutput(markdown, true, result);

      // Log card creation
      logEvent('card_created', {
        card_type: currentCardType,
        section: section,
        card_id: cardId,
        saved_to_file: true,
        git_committed: result.git_committed
      });
    } else {
      // Show error but still display markdown
      displayOutput(markdown, false, result);
      alert(`Warning: Card saved locally but server save failed: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    // Network error - still show markdown
    displayOutput(markdown, false, {error: error.message});
    alert(`Warning: Could not save to server: ${error.message}\nMarkdown is shown below for manual saving.`);
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

function displayOutput(markdown, success = false, result = {}) {
  const output = document.getElementById('markdownOutput');
  const outputSection = document.getElementById('outputSection');

  output.textContent = markdown;
  outputSection.style.display = 'block';

  // Add success/failure message
  const messageDiv = document.getElementById('saveMessage') || (() => {
    const div = document.createElement('div');
    div.id = 'saveMessage';
    div.style.cssText = 'margin-bottom: 1rem; padding: 1rem; border-radius: 8px; font-weight: 600;';
    outputSection.insertBefore(div, output.parentElement);
    return div;
  })();

  if (success) {
    messageDiv.style.background = 'rgba(34, 197, 94, 0.2)';
    messageDiv.style.border = '1px solid #22c55e';
    messageDiv.style.color = '#22c55e';
    messageDiv.innerHTML = `
      ✓ Card saved successfully!<br>
      <small style="font-weight: normal;">
        Saved to: ${result.path || 'server'}<br>
        ${result.git_committed ? '✓ Committed to git' : '⚠ Git commit failed (may need manual commit)'}
      </small>
    `;
  } else if (result.error) {
    messageDiv.style.background = 'rgba(239, 68, 68, 0.2)';
    messageDiv.style.border = '1px solid #ef4444';
    messageDiv.style.color = '#ef4444';
    messageDiv.innerHTML = `
      ✗ Save failed: ${result.error}<br>
      <small style="font-weight: normal;">Markdown shown below for manual saving</small>
    `;
  } else {
    messageDiv.style.display = 'none';
  }

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
