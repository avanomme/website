# Flashcards App - Simple Navigation

## URL Structure

```
domain/study                    → Main study hub (all study areas)
domain/apps/flashcards/         → Flashcard topics selection
domain/apps/flashcards/cards    → Dynamic card viewer
```

## File Structure

```
/website/
├── study.html                  # Main study hub entry point
└── apps/flashcards/
    ├── index.html              # Flashcard topics selection
    ├── cards.html              # Dynamic card viewer
    ├── se-cards.html           # SE cards (legacy/direct access)
    ├── app.js                  # App logic
    ├── app.css                 # Shared styles
    ├── theme.css               # Dark theme
    ├── cards.md                # SE Flash cards
    ├── ml_midterm_cards.md     # ML Flash cards
    └── ml_midterm_review.md    # ML review cards
```

## Navigation Flow

1. **domain/study** - Study Hub
   - Shows all study areas
   - Click "Flashcards" → goes to `/apps/flashcards/`

2. **domain/apps/flashcards/** - Flashcard Topics
   - Shows ML and SE topics
   - Has "← Back to Study Hub" link
   - Click topic → goes to `/cards?topic=X&type=Y`

3. **domain/apps/flashcards/cards** - Card Viewer
   - Dynamic URLs:
     - `cards?topic=ml_midterm&type=cards` - ML Flash
     - `cards?topic=ml_midterm&type=review` - ML Review
     - `cards?topic=se_midterm&type=cards` - SE Cards
   - Has "← Back to Topics" link
   - ML cards show Flash ↔ Review switcher

## All Pages Use Same CSS

- ✅ `theme.css` - Dark theme variables
- ✅ `app.css` - All component styles
- ✅ No inline styles

## Quick Test

1. Navigate to `/study.html`
2. Click "Flashcards"
3. Should be at `/apps/flashcards/`
4. Click "Machine Learning Midterm 2"
5. Should be at `/apps/flashcards/cards?topic=ml_midterm&type=cards`
6. See Flash/Review switcher buttons
7. Click "← Back to Topics"
8. Back at `/apps/flashcards/`
9. Click "← Back to Study Hub"
10. Back at `/study.html`
