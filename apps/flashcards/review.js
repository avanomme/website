// Review Cards Viewer - Shows all content upfront, no hiding

const state = {
  cards: [],
  currentIndex: 0,
  topic: 'ml_midterm'
};

// Topic configuration
const TOPICS = {
  ml_midterm: {
    name: 'Machine Learning Midterm 2',
    file: 'ml_midterm_review.md'
  }
};

async function init() {
  const params = new URLSearchParams(window.location.search);
  state.topic = params.get('topic') || 'ml_midterm';

  const topicConfig = TOPICS[state.topic];
  if (!topicConfig) {
    console.error('Unknown topic:', state.topic);
    return;
  }

  // Update subtitle
  const subtitle = document.querySelector('#topicSubtitle');
  if (subtitle) {
    subtitle.textContent = topicConfig.name;
  }

  // Load review cards
  await loadReviewCards(topicConfig.file);

  // Set up navigation
  setupNavigation();

  // Populate card selector
  populateCardSelector();

  // Display first card
  displayCard(0);
}

function populateCardSelector() {
  const selector = document.querySelector('#cardSelector');
  if (!selector) return;

  selector.innerHTML = '';
  state.cards.forEach((card, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = card.title;
    selector.appendChild(option);
  });

  selector.addEventListener('change', (e) => {
    const index = parseInt(e.target.value, 10);
    displayCard(index);
  });
}

async function loadReviewCards(filename) {
  try {
    const response = await fetch(filename);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }

    const markdown = await response.text();
    state.cards = parseReviewCards(markdown);
    console.log(`Loaded ${state.cards.length} review cards`);
  } catch (error) {
    console.error('Error loading review cards:', error);
  }
}

function parseReviewCards(markdown) {
  const cards = [];
  const sections = markdown.split('####').filter(s => s.trim());

  for (const section of sections) {
    const lines = section.split('\n');
    const sectionTitle = lines[0].trim();

    // Find all cards in this section
    const cardBlocks = section.split('#flashcards/').filter(s => s.trim());

    for (const block of cardBlocks) {
      if (!block.includes('**')) continue;

      const cardLines = block.split('\n');
      let title = '';
      let content = [];
      let foundQuestion = false;

      for (let i = 0; i < cardLines.length; i++) {
        const line = cardLines[i].trim();

        if (line.startsWith('**') && !foundQuestion) {
          title = line.replace(/\*\*/g, '').trim();
          foundQuestion = true;
          continue;
        }

        if (line === '?') {
          continue;
        }

        if (foundQuestion && line) {
          content.push(cardLines[i]); // Keep original indentation
        }
      }

      if (title && content.length > 0) {
        cards.push({
          title,
          section: sectionTitle,
          content: content.join('\n').trim()
        });
      }
    }
  }

  return cards;
}

function displayCard(index) {
  if (index < 0 || index >= state.cards.length) return;

  state.currentIndex = index;
  const card = state.cards[index];
  const container = document.querySelector('#reviewContainer');

  container.innerHTML = renderCard(card);
  updateNavigation();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCard(card) {
  const parsed = parseCardContent(card.content);

  let html = `<div class="review-card" style="position: relative;">`;

  // Add edit button
  html += `<button onclick="editCard(${state.currentIndex})" type="button" class="edit-card-btn" title="Edit this card" style="position: absolute; top: 1rem; right: 1rem; background: rgba(74, 158, 255, 0.2); border: 1px solid var(--accent, #4a9eff); color: var(--accent, #4a9eff); padding: 0.4rem 0.8rem; border-radius: 4px; font-size: 0.875rem; cursor: pointer; font-weight: 600;">
    ✏️ Edit
  </button>`;

  html += `<h2 class="review-card-title">${escapeHtml(card.title)}</h2>`;

  // Main Idea
  if (parsed.mainIdea) {
    html += `<div class="review-section">`;
    html += `<h3 class="review-section-title">Main Idea</h3>`;
    html += `<div class="review-content">${renderMarkdown(parsed.mainIdea)}</div>`;
    html += `</div>`;
  }

  // Advantages & Disadvantages
  if (parsed.advantages || parsed.disadvantages) {
    html += `<div class="review-section">`;
    html += `<h3 class="review-section-title">Pros & Cons</h3>`;
    html += `<div class="pros-cons-grid">`;

    if (parsed.advantages) {
      html += `<div class="pro-box">`;
      html += `<h4>✓ Advantages</h4>`;
      html += renderMarkdown(parsed.advantages);
      html += `</div>`;
    }

    if (parsed.disadvantages) {
      html += `<div class="con-box">`;
      html += `<h4>✗ Disadvantages</h4>`;
      html += renderMarkdown(parsed.disadvantages);
      html += `</div>`;
    }

    html += `</div>`;
    html += `</div>`;
  }

  // Needs
  if (parsed.needs) {
    html += `<div class="review-section">`;
    html += `<h3 class="review-section-title">Requirements</h3>`;
    html += `<div class="review-content">${renderMarkdown(parsed.needs)}</div>`;
    html += `</div>`;
  }

  // Loss Function(s)
  if (parsed.lossFunction) {
    html += `<div class="review-section">`;
    html += `<h3 class="review-section-title">Loss / Cost Function</h3>`;
    html += `<div class="review-content">${renderMarkdown(parsed.lossFunction)}</div>`;
    html += `</div>`;
  }

  // Additional Notes
  if (parsed.notes) {
    html += `<div class="review-section">`;
    html += `<h3 class="review-section-title">Additional Notes</h3>`;
    html += `<div class="review-content">${renderMarkdown(parsed.notes)}</div>`;
    html += `</div>`;
  }

  // Other Content (for cards with non-standard format like Activation Functions)
  if (parsed.otherContent && parsed.otherContent.trim()) {
    html += `<div class="review-section">`;
    html += `<h3 class="review-section-title">Details</h3>`;
    html += `<div class="review-content">${renderMarkdown(parsed.otherContent)}</div>`;
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

function parseCardContent(content) {
  const result = {
    mainIdea: '',
    advantages: '',
    disadvantages: '',
    needs: '',
    lossFunction: '',
    notes: '',
    otherContent: ''  // Catch-all for content that doesn't match standard sections
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
    } else if (trimmed.startsWith('**Needs:**') || trimmed.startsWith('**Requirements:**')) {
      if (currentSection) {
        result[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'needs';
      currentContent = [];
    } else if (trimmed.startsWith('**Loss Function')) {
      if (currentSection) {
        result[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'lossFunction';
      currentContent = [];
    } else if (trimmed.startsWith('**Note') || trimmed.startsWith('**Key') || trimmed.startsWith('**Hierarchy') || trimmed.startsWith('**Benefits') || trimmed.startsWith('**Bottom Line')) {
      if (currentSection) {
        result[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = 'notes';
      currentContent = [line];
    } else if (currentSection) {
      currentContent.push(line);
    } else {
      // If we haven't matched any section yet, collect as otherContent
      result.otherContent += line + '\n';
    }
  }

  if (currentSection) {
    result[currentSection] = currentContent.join('\n').trim();
  }

  return result;
}

function renderMarkdown(text) {
  if (!text) return '';

  // Convert markdown to HTML
  let html = text;

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Code blocks
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Convert bullet lists
  const lines = html.split('\n');
  let inList = false;
  let result = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('- ')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push(`<li>${trimmed.substring(2)}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (trimmed) {
        result.push(`<p>${trimmed}</p>`);
      }
    }
  }

  if (inList) {
    result.push('</ul>');
  }

  return result.join('\n');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function setupNavigation() {
  const prevBtns = [document.querySelector('#prevCardBtn'), document.querySelector('#prevCardBtn2')];
  const nextBtns = [document.querySelector('#nextCardBtn'), document.querySelector('#nextCardBtn2')];

  prevBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        if (state.currentIndex > 0) {
          displayCard(state.currentIndex - 1);
        }
      });
    }
  });

  nextBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        if (state.currentIndex < state.cards.length - 1) {
          displayCard(state.currentIndex + 1);
        }
      });
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && state.currentIndex > 0) {
      displayCard(state.currentIndex - 1);
    } else if (e.key === 'ArrowRight' && state.currentIndex < state.cards.length - 1) {
      displayCard(state.currentIndex + 1);
    }
  });
}

function updateNavigation() {
  const counters = [document.querySelector('#cardCounter'), document.querySelector('#cardCounter2')];
  const prevBtns = [document.querySelector('#prevCardBtn'), document.querySelector('#prevCardBtn2')];
  const nextBtns = [document.querySelector('#nextCardBtn'), document.querySelector('#nextCardBtn2')];
  const selector = document.querySelector('#cardSelector');

  counters.forEach(counter => {
    if (counter) {
      counter.textContent = `Card ${state.currentIndex + 1} of ${state.cards.length}`;
    }
  });

  prevBtns.forEach(btn => {
    if (btn) {
      btn.disabled = state.currentIndex === 0;
    }
  });

  nextBtns.forEach(btn => {
    if (btn) {
      btn.disabled = state.currentIndex === state.cards.length - 1;
    }
  });

  if (selector) {
    selector.value = state.currentIndex;
  }
}

// Edit card function
function editCard(index) {
  const card = state.cards[index];
  if (!card) return;

  // Extract the raw content for editing
  const params = new URLSearchParams({
    edit: 'true',
    type: 'review',
    section: card.section || '',
    title: card.title || '',
    content: card.content || ''
  });

  // Navigate to editor with pre-filled data
  window.location.href = `editor.html?${params.toString()}`;
}

// Initialize on load
init();
