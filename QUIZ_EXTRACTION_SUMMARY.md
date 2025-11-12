# ML Quiz Questions Extraction Summary

## Overview

Successfully extracted **64 complete quiz questions** from `/Users/adam/projects/website/apps/flashcards/ML Quiz Review.md`

All questions include:
- ✓ Full question text
- ✓ **ALL answer choices** (not just correct answers)
- ✓ Correct answer(s) clearly marked with `<<< CORRECT`
- ✓ Question type identification

## Output File

**Location**: `/Users/adam/projects/website/quiz_questions_extracted.txt`

**Format**: Structured text with clear sections per lecture

## Questions by Lecture

| Lecture | Count | Topic |
|---------|-------|-------|
| L01 | 4 questions | Introduction |
| L02 | 5 questions | Linear Regression |
| L03 | 10 questions | Gradient Descent and MLR |
| L05 | 5 questions | Bayesian Learning |
| L06 | 5 questions | Decision Trees |
| L07 | 5 questions | Logistic Regression |
| L09 | 5 questions | Unsupervised Learning and K-means |
| L10 | 5 questions | Density Based Clustering |
| L11 | 5 questions | Dimensionality Reduction |
| L12 | 5 questions | Intro to Neural Networks |
| L13 | 5 questions | Neural Network Implementation |
| L14 | 5 questions | Intro to Deep Neural Networks |
| **TOTAL** | **64 questions** | **12 lectures** |

## Question Types

The extraction successfully handles 5 different question formats:

1. **Multiple Choice** (Select one) - Most common format
   - Shows all answer choices labeled a, b, c, d, e...
   - Correct answer marked with `<<< CORRECT`

2. **Multiple Select** (Select one or more)
   - Multiple correct answers possible
   - All correct choices marked with `<<< CORRECT`

3. **True/False**
   - Binary choice questions
   - Correct answer clearly indicated

4. **Fill in the Blank**
   - Open-ended text entry
   - Correct answer(s) provided

5. **Matching**
   - Pairs of items to match
   - Complete matching solution provided

## Sample Question Format

```
Question 5
----------------------------------------
Type: multiple_choice

Question:
How many parameters has the hypothesis function in an univariate linear regression problem?

Answer Choices:
  a) 0
  b) 2  <<< CORRECT
  c) 1
  d) 5
  e) 3

Correct Answer:
2
```

## Use Case

This extracted data is ready for:
- Updating flashcard quiz files to show all options
- Creating study materials with complete answer choices
- Converting to different quiz formats (JSON, CSV, etc.)
- Integration into learning management systems

## Notes

- Images are marked as `[IMAGE]` in the output
- Mathematical notation (Unicode) is preserved
- Some questions have formatting artifacts from the source (e.g., "Question 3Select one:")
- All questions from the source quiz review have been successfully extracted
- Missing lectures (L04, L08) were not in the source file
