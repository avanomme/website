"""
Flashcard Management API
Handles saving, updating, and managing flashcard files
"""
from flask import Flask, request, jsonify
import os
import json
from pathlib import Path
import re
import subprocess
from datetime import datetime

app = Flask(__name__)

# Base directory for flashcards
FLASHCARDS_DIR = Path(__file__).parent.parent / 'apps' / 'flashcards'
CARDS_DIR = FLASHCARDS_DIR / 'cards'

# Ensure cards directory exists
CARDS_DIR.mkdir(exist_ok=True)

def sanitize_filename(text):
    """Sanitize text for use as filename"""
    # Remove special characters, keep alphanumeric and basic punctuation
    sanitized = re.sub(r'[^\w\s\-\.]', '', text)
    # Replace spaces with underscores
    sanitized = sanitized.replace(' ', '_')
    # Limit length
    return sanitized[:100]

def get_card_path(section, card_id, card_type='flashcard'):
    """
    Get the file path for a card
    Args:
        section: e.g., "ML/Algorithms"
        card_id: e.g., "1.1"
        card_type: flashcard, quiz, or review
    Returns:
        Path object
    """
    # Create directory structure
    section_path = CARDS_DIR / section.replace('/', os.sep)
    section_path.mkdir(parents=True, exist_ok=True)

    # Create filename
    filename = f"{card_id.replace('.', '-')}_{card_type}.md"
    return section_path / filename

def generate_flashcard_markdown(data):
    """Generate markdown for a flashcard"""
    section = data.get('section', '')
    card_id = data.get('card_id', '')
    question = data.get('question', '')
    answer = data.get('answer', '')

    markdown = f"#flashcards/{section}\n"
    markdown += f"**{card_id}** *{question}*\n"
    markdown += "?\n"
    markdown += f"{answer}\n"

    return markdown

def generate_quiz_markdown(data):
    """Generate markdown for a quiz question"""
    section = data.get('section', '')
    card_id = data.get('card_id', '')
    question = data.get('question', '')
    choices = data.get('choices', [])  # List of {letter, text, isCorrect}
    explanation = data.get('explanation', '')

    markdown = f"#flashcards/{section}\n"
    markdown += f"**{card_id}** *{question}*\n\n"

    # Add choices
    for choice in choices:
        markdown += f"{choice['letter']}) {choice['text']}\n"

    markdown += "?\n"

    # Add correct answers
    correct = [c for c in choices if c.get('isCorrect')]
    if len(correct) == 1:
        markdown += f"**{correct[0]['letter']}) {correct[0]['text']}** ✓\n"
    else:
        markdown += "**Correct answers:**\n"
        for answer in correct:
            markdown += f"- **{answer['letter']}) {answer['text']}** ✓\n"

    if explanation:
        markdown += f"\nExplanation: {explanation}\n"

    return markdown

def generate_review_markdown(data):
    """Generate markdown for a review card"""
    section = data.get('section', '')
    title = data.get('title', '')
    main_idea = data.get('main_idea', '')
    advantages = data.get('advantages', '')
    disadvantages = data.get('disadvantages', '')
    requirements = data.get('requirements', '')
    loss_function = data.get('loss_function', '')
    notes = data.get('notes', '')

    markdown = f"#flashcards/{section}\n"
    markdown += f"**{title}**\n"
    markdown += "?\n"

    if main_idea:
        markdown += f"**Main Idea:** {main_idea}\n\n"

    if advantages:
        markdown += f"**Advantages:**\n{advantages}\n\n"

    if disadvantages:
        markdown += f"**Disadvantages:**\n{disadvantages}\n\n"

    if requirements:
        markdown += f"**Requirements:**\n{requirements}\n\n"

    if loss_function:
        markdown += f"**Loss Function:** {loss_function}\n\n"

    if notes:
        markdown += f"**Note:** {notes}\n"

    return markdown

def git_commit_changes(filepath, message):
    """Commit changes to git"""
    try:
        # Get relative path from repo root
        repo_root = Path(__file__).parent.parent
        rel_path = filepath.relative_to(repo_root)

        # Git add
        subprocess.run(['git', 'add', str(rel_path)],
                      cwd=repo_root, check=True, capture_output=True)

        # Git commit
        commit_message = f"{message}\n\nUpdated via Flashcard Editor at {datetime.now().isoformat()}"
        subprocess.run(['git', 'commit', '-m', commit_message],
                      cwd=repo_root, check=True, capture_output=True)

        return True
    except subprocess.CalledProcessError as e:
        print(f"Git error: {e.stderr.decode() if e.stderr else str(e)}")
        return False

@app.route('/api/cards/save', methods=['POST'])
def save_card():
    """
    Save or update a flashcard
    Expected JSON:
    {
        "type": "flashcard|quiz|review",
        "section": "ML/Algorithms",
        "card_id": "1.1",
        "question": "...",
        "answer": "...",
        ...other fields depending on type
    }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400

        card_type = data.get('type', 'flashcard')
        section = data.get('section', '')
        card_id = data.get('card_id', '')

        if not section or not card_id:
            return jsonify({'error': 'Section and card_id are required'}), 400

        # Generate markdown based on type
        if card_type == 'flashcard':
            markdown = generate_flashcard_markdown(data)
        elif card_type == 'quiz':
            markdown = generate_quiz_markdown(data)
        elif card_type == 'review':
            markdown = generate_review_markdown(data)
        else:
            return jsonify({'error': f'Invalid card type: {card_type}'}), 400

        # Get file path
        card_path = get_card_path(section, card_id, card_type)

        # Save file
        with open(card_path, 'w', encoding='utf-8') as f:
            f.write(markdown)

        # Commit to git
        git_message = f"Update {card_type} card: {section}/{card_id}"
        git_success = git_commit_changes(card_path, git_message)

        return jsonify({
            'success': True,
            'path': str(card_path.relative_to(FLASHCARDS_DIR)),
            'git_committed': git_success
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cards/<path:card_path>', methods=['GET'])
def get_card(card_path):
    """Get a specific card's content"""
    try:
        full_path = CARDS_DIR / card_path

        if not full_path.exists():
            return jsonify({'error': 'Card not found'}), 404

        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()

        return jsonify({
            'content': content,
            'path': card_path
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cards/list', methods=['GET'])
def list_cards():
    """List all cards"""
    try:
        cards = []

        for card_file in CARDS_DIR.rglob('*.md'):
            rel_path = card_file.relative_to(CARDS_DIR)
            cards.append(str(rel_path))

        return jsonify({
            'cards': sorted(cards),
            'count': len(cards)
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# For Vercel deployment
if __name__ == '__main__':
    app.run(debug=True, port=5001)
