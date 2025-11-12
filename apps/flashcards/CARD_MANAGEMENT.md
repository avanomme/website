# Flashcard Management System

Complete system for creating, editing, and managing flashcards with automatic file storage and git commits.

## Overview

The flashcard system now supports **full CRUD operations** with:
- ✓ Individual card files for better organization
- ✓ Automatic file saving via API
- ✓ Automatic git commits for version control
- ✓ Edit existing cards directly from the UI
- ✓ Organized folder structure

## Architecture

### File Storage Structure

Cards are stored as individual markdown files in an organized folder structure:

```
apps/flashcards/cards/
├── ML/
│   ├── Algorithms/
│   │   ├── 1-1_flashcard.md
│   │   ├── 1-2_flashcard.md
│   │   └── 2-1_flashcard.md
│   ├── Quiz/
│   │   ├── Q1-1_quiz.md
│   │   └── Q1-2_quiz.md
│   └── Review/
│       ├── Linear_Regression_review.md
│       └── Gradient_Descent_review.md
└── index.json  (auto-generated)
```

**Benefits:**
- Each card is a separate file (easier git tracking)
- Clear folder organization by topic
- Easy to find and edit specific cards
- Better merge conflict resolution

### API Endpoints

#### `POST /api/cards/save`

Save or update a flashcard.

**Request:**
```json
{
  "type": "flashcard|quiz|review",
  "section": "ML/Algorithms",
  "card_id": "1.1",
  "question": "What is...",
  "answer": "...",
  ...other fields depending on type
}
```

**Response:**
```json
{
  "success": true,
  "path": "ML/Algorithms/1-1_flashcard.md",
  "git_committed": true
}
```

#### `GET /api/cards/list`

List all cards.

**Response:**
```json
{
  "cards": [
    "ML/Algorithms/1-1_flashcard.md",
    "ML/Algorithms/1-2_flashcard.md"
  ],
  "count": 2
}
```

#### `GET /api/cards/<path>`

Get a specific card's content.

**Response:**
```json
{
  "content": "#flashcards/ML/Algorithms\n**1.1** ...",
  "path": "ML/Algorithms/1-1_flashcard.md"
}
```

## Using the Editor

### Creating a New Card

1. Go to the flashcard app: `/flashcards/`
2. Click **"✏️ Create/Edit Cards"**
3. Select card type (Flash Card, Quiz, Review)
4. Fill in all fields:
   - **Section/Topic**: e.g., `ML/Algorithms`
   - **Card ID**: e.g., `1.1`
   - **Question/Content**: Card content
5. Click **"Generate Card"**
6. System will:
   - Save card to `apps/flashcards/cards/{section}/{id}_{type}.md`
   - Commit to git automatically
   - Show success message with file path

### Editing an Existing Card

1. Navigate to the card in the flashcard viewer
2. Click **"✏️ Edit"** button (top right of card)
3. Editor opens with all fields pre-filled
4. Modify any fields
5. Click **"Generate Card"**
6. Card file is updated and committed to git

## Card Formats

### Flashcard Format

```markdown
#flashcards/ML/Algorithms
**1.1** *What is the main idea behind Linear Regression?*
?
Fits a straight line to predict continuous values using least squares.
```

**Required Fields:**
- `section`: Topic path (e.g., `ML/Algorithms`)
- `card_id`: Unique ID (e.g., `1.1`)
- `question`: Question text
- `answer`: Answer text

### Quiz Format

```markdown
#flashcards/ML/Quiz
**Q1.1** *In the classification algorithm K-NN, the parameter k determines:*

a) The dimensions of the function space
b) The number of classes
c) The iterations of the algorithm
d) The number of features in the input vector
e) The neighbor examples used to predict the class
?
**e) The neighbor examples used to predict the class** ✓

Explanation: K determines how many nearest neighbors are used.
```

**Required Fields:**
- `section`: Topic path
- `card_id`: Unique ID
- `question`: Question text
- `choices`: Array of `{letter, text, isCorrect}`
- `explanation` (optional): Additional explanation

### Review Format

```markdown
#flashcards/ML/Review
**Linear Regression - Complete Overview**
?
**Main Idea:** Linear Regression fits a straight line...

**Advantages:**
- Simple and interpretable
- Efficient computation

**Disadvantages:**
- Sensitive to outliers
- Assumes linearity

**Loss Function:** Mean Squared Error (MSE)
```

**Required Fields:**
- `section`: Topic path
- `title`: Card title
- `main_idea`: Main concept
- Optional: `advantages`, `disadvantages`, `requirements`, `loss_function`, `notes`

## Git Integration

### Automatic Commits

Every card save triggers an automatic git commit:

```bash
git add apps/flashcards/cards/{section}/{id}_{type}.md
git commit -m "Update flashcard card: ML/Algorithms/1.1

Updated via Flashcard Editor at 2025-11-12T..."
```

**Commit Message Format:**
- First line: `Update {type} card: {section}/{card_id}`
- Second line: Timestamp and source

### Manual Git Operations

If automatic commit fails, you can manually commit:

```bash
cd /Users/adam/projects/website
git add apps/flashcards/cards/
git commit -m "Update flashcards"
git push
```

## Migration from Central Files

### Current Structure (Legacy)

```
apps/flashcards/
├── ml_midterm_cards.md       (all cards in one file)
├── ml_midterm_quiz.md        (all quiz questions)
└── ml_midterm_review.md      (all review cards)
```

### New Structure (Individual Files)

```
apps/flashcards/cards/
└── ML/
    ├── Algorithms/
    │   ├── 1-1_flashcard.md
    │   └── 1-2_flashcard.md
    ├── Quiz/
    │   └── Q1-1_quiz.md
    └── Review/
        └── Linear_Regression_review.md
```

### Migration Script (Optional)

To migrate existing cards to individual files:

```python
# TODO: Create migration script
# Parse ml_midterm_*.md files
# Extract individual cards
# Save to cards/{section}/{id}_{type}.md
```

**Note:** Old files are still loaded by the app for backward compatibility.

## Workflow Example

### Complete Card Creation Flow

1. **Create Card:**
   ```
   User fills out form in editor.html
   → Clicks "Generate Card"
   → editor.js sends POST to /api/cards/save
   → api/cards.py saves file
   → Git commit
   → Success message shown
   ```

2. **Edit Existing Card:**
   ```
   User views card in cards.html
   → Clicks "✏️ Edit" button
   → editor.html opens with pre-filled data
   → User modifies fields
   → Clicks "Generate Card"
   → File updated & committed
   → Success message shown
   ```

3. **View Cards:**
   ```
   app.js loads ml_midterm_cards.md (legacy)
   → Parses cards
   → Displays in viewer
   → User can edit any card
   ```

## API Implementation Details

### Flask API (`api/cards.py`)

**Key Functions:**
- `save_card()`: Save/update card file
- `get_card()`: Retrieve card content
- `list_cards()`: List all card files
- `git_commit_changes()`: Automatic git commit

**Error Handling:**
- Returns success message if saved
- Returns error message if failed
- Still shows markdown for manual saving

### Security Considerations

**File Path Sanitization:**
- Section paths validated
- Card IDs sanitized (alphanumeric only)
- Prevents directory traversal attacks

**Git Safety:**
- Only commits specific card files
- No force pushes
- Safe commit messages

## Troubleshooting

### Card Not Saving

**Symptom:** "Save failed" error message

**Possible Causes:**
1. Permission issues (check file/directory permissions)
2. Invalid section path
3. Git not configured

**Solutions:**
```bash
# Check permissions
chmod -R 755 apps/flashcards/cards/

# Verify git config
git config user.name
git config user.email

# Check API logs
vercel logs --follow
```

### Git Commit Fails

**Symptom:** Card saves but "Git commit failed" warning

**Possible Causes:**
1. Git not configured
2. No changes to commit (file unchanged)
3. Permission issues

**Solutions:**
```bash
# Configure git
git config user.name "Your Name"
git config user.email "your@email.com"

# Manual commit
cd apps/flashcards/cards
git add .
git commit -m "Manual card update"
git push
```

### Edit Button Not Working

**Symptom:** Edit button shows but fields not pre-filled

**Cause:** Card data not exposed in `window.currentCard`

**Solution:** Check that app.js is setting `window.currentCard` with `questionRaw`, `answerRaw`, `sectionPath`, and `cardId` fields.

## Future Enhancements

- [ ] Bulk import/export cards
- [ ] Card versioning (git history viewer)
- [ ] Search and filter cards
- [ ] Duplicate card detection
- [ ] Card statistics and analytics
- [ ] Collaborative editing
- [ ] Card review scheduling (spaced repetition)
- [ ] Export to Anki format

## See Also

- `LOGGING_README.md` - Logging system documentation
- `AUDIO_GENERATION.md` - TTS audio generation
- `README_TOPICS.md` - Multi-topic configuration
