# Flash Cards - Multi-Topic Study System

## Overview

The flashcards app now supports multiple study topics with different card types. Each topic can have multiple card file options (Q&A cards, Review cards, etc.).

## File Structure

```
/apps/flashcards/
├── topics.html              # Main landing page with topic selection
├── study.html               # Study interface with dynamic card loading
├── index.html               # Original SE midterm interface (for backward compatibility)
├── app.js                   # Enhanced with topic/type switching
├── cards.md                 # Software Engineering Q&A cards
├── ml_midterm_cards.md      # Machine Learning Q&A cards
├── ml_midterm_review.md     # Machine Learning review cards (full algorithm overviews)
└── ...
```

## Available Topics

### 1. Machine Learning Midterm 2
- **Q&A Cards** (`ml_midterm_cards.md`): Question-and-answer format covering individual concepts
  - Linear Regression, Gradient Descent, Logistic Regression
  - Decision Trees, Random Forests
  - K-Means, DBSCAN
  - PCA, Regularization, Cross-Validation
  - Neural Networks and Deep Learning concepts

- **Review Cards** (`ml_midterm_review.md`): Comprehensive overview cards
  - Each card contains the complete table row information
  - Includes Main Idea, Advantages, Disadvantages, Loss Function
  - Perfect for final review before exams

### 2. Software Engineering Midterm
- **Q&A Cards** (`cards.md`): Complete SE curriculum
  - Lectures 1-10 covering all major topics
  - Requirements gathering, project management
  - Design patterns and architectural styles

## Usage

### Starting Point
Open `topics.html` to see all available study topics and select one.

### Direct Links
- ML Q&A Cards: `study.html?topic=ml_midterm&type=cards`
- ML Review Cards: `study.html?topic=ml_midterm&type=review`
- SE Cards: `index.html` (or `study.html?topic=se_midterm&type=cards`)

### Switching Card Types
When viewing a topic with multiple card types (like ML), you'll see buttons at the top to switch between:
- 📝 Q&A Cards - Traditional question/answer format
- 📋 Review Cards - Comprehensive overview format

## Creating New Topics

### 1. Create Card Files
Create markdown files following the flashcard format:
```markdown
#### Section Title

#flashcards/Category/Subsection
**Question ID** *Question text*
?
Answer content here
```

### 2. Update app.js
Add your topic to the `TOPICS` configuration:
```javascript
const TOPICS = {
  your_topic: {
    name: 'Your Topic Name',
    cardTypes: [
      { id: 'cards', label: 'Q&A Cards', file: 'your_topic_cards.md' },
      { id: 'review', label: 'Review Cards', file: 'your_topic_review.md' }
    ]
  }
};
```

### 3. Add to topics.html
Add a card in the appropriate section:
```html
<a href="study.html?topic=your_topic&type=cards" class="topic-card">
  <h2>Your Topic Name</h2>
  <p>Description of your topic...</p>
  <div class="topic-meta">
    <span>📝 Q&A Cards</span>
    <span>📋 Review Cards</span>
  </div>
</a>
```

## Card Format Guidelines

### Q&A Cards (Traditional)
- Keep questions focused on a single concept
- Use bold (**) for question IDs
- Use italic (*) for question text
- Separate question and answer with `?` line
- Use markdown formatting in answers

### Review Cards (Comprehensive)
- Each card covers one complete algorithm/concept
- Include all key information in a structured format:
  - Main Idea
  - Advantages
  - Disadvantages
  - Loss/Cost Function (where applicable)
  - Additional Notes/Requirements

## Features

All features from the original flashcards app are available:
- ✅ TTS support (Coqui TTS, MeloTTS, Edge TTS, Browser fallback)
- ✅ Autoplay with configurable delays
- ✅ Section and card navigation
- ✅ Shuffle and loop modes
- ✅ Speech rate control
- ✅ Precompiled audio support

## Backward Compatibility

The original `index.html` still works and loads `cards.md` by default for Software Engineering cards. Existing links will continue to work.
