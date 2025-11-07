const els = {
  sectionTitle: document.querySelector('#sectionTitle'),
  sectionMeta: document.querySelector('#sectionMeta'),
  cardMeta: document.querySelector('#cardMeta'),
  flashcard: document.querySelector('#flashcard'),
  cardFront: document.querySelector('#cardFront'),
  cardBack: document.querySelector('#cardBack'),
  cardQuestion: document.querySelector('#cardQuestion'),
  cardQuestionRepeat: document.querySelector('#cardQuestionRepeat'),
  cardAnswer: document.querySelector('#cardAnswer'),
  toggleAnswerBtn: document.querySelector('#toggleAnswerBtn'),
  playPauseBtn: document.querySelector('#playPauseBtn'),
  prevBtn: document.querySelector('#prevBtn'),
  nextBtn: document.querySelector('#nextBtn'),
  sectionPicker: document.querySelector('#sectionPicker'),
  cardPicker: document.querySelector('#cardPicker'),
  shuffleToggle: document.querySelector('#shuffleToggle'),
  loopToggle: document.querySelector('#loopToggle'),
  autoRevealToggle: document.querySelector('#autoRevealToggle'),
  autoRevealDelay: document.querySelector('#autoRevealDelay'),
  autoAdvanceDelay: document.querySelector('#autoAdvanceDelay'),
  autoRevealValue: document.querySelector('#autoRevealValue'),
  autoAdvanceValue: document.querySelector('#autoAdvanceValue'),
  speechToggle: document.querySelector('#speechToggle'),
  voicePicker: document.querySelector('#voicePicker'),
  speechRate: document.querySelector('#speechRate'),
  speechRateValue: document.querySelector('#speechRateValue'),
  message: document.querySelector('#message'),
};

const state = {
  sections: [],
  cards: [],
  order: [],
  currentIndex: 0,
  showingAnswer: false,
  shuffle: false,
  loop: true,
  isPlaying: false,
  autoReveal: true,
  revealDelayMs: 1000,
  advanceDelayMs: 1000,
  timers: {
    reveal: null,
    advance: null,
  },
  speechEnabled: true,
  speechRate: 1,
  voiceURI: '',
  voiceName: '',
  voices: [],
  autoplayToken: null,
  activeUtterance: null,
  currentAudio: null,
  ttsServerUrl: 'http://localhost:5050',
  meloServerUrl: 'http://localhost:5051',
  edgeTtsServerUrl: 'http://localhost:5052',
  useCoquiTTS: false,
  useMeloTTS: false,
  useEdgeTTS: true,  // NEW: Free Edge TTS - No API keys needed!
  usePrecompiled: true,
  audioCacheDir: 'audio_cache',
};

async function bootstrap() {
  try {
    const response = await fetch('cards.md');
    if (!response.ok) {
      throw new Error(`Failed to load cards.md (${response.status})`);
    }

    const markdown = await response.text();
    const sections = parseDeck(markdown);
    if (!sections.length) {
      throw new Error('No sections found in cards.md');
    }

    state.sections = sections;
    state.cards = flattenDeck(sections);
    state.order = state.cards.map((_, index) => index);
    state.currentIndex = 0;
    state.loop = true;
    state.shuffle = false;
    state.autoReveal = true;
    state.revealDelayMs = Number.parseInt(els.autoRevealDelay?.value ?? 1000, 10) || 1000;
    state.advanceDelayMs = Number.parseInt(els.autoAdvanceDelay?.value ?? 1000, 10) || 1000;

    hydrateSectionPicker();
    hydrateCardPicker();
    displayCard();
    initializeControls();
    attachEventHandlers();
    initSpeech();
    hideMessage();
  } catch (error) {
    showMessage(error.message || 'Unable to load flash cards.');
    disableControls();
    console.error(error);
  }
}

function attachEventHandlers() {
  els.flashcard.addEventListener('click', () => {
    if (!state.showingAnswer) {
      toggleAnswer();
    } else {
      move(1);
    }
  });

  els.playPauseBtn.addEventListener('click', () => {
    setPlaying(!state.isPlaying);
  });

  els.prevBtn.addEventListener('click', () => {
    move(-1);
  });

  els.nextBtn.addEventListener('click', () => {
    move(1);
  });

  els.toggleAnswerBtn.addEventListener('click', () => {
    toggleAnswer();
  });

  els.sectionPicker.addEventListener('change', (event) => {
    jumpToSection(event.target.value);
  });

  els.cardPicker.addEventListener('change', (event) => {
    const globalIndex = Number.parseInt(event.target.value, 10);
    gotoCard(globalIndex);
  });

  els.shuffleToggle.addEventListener('change', (event) => {
    setShuffle(event.target.checked);
  });

  els.loopToggle.addEventListener('change', (event) => {
    state.loop = event.target.checked;
    updateNavigationButtons();
  });

  els.autoRevealToggle.addEventListener('change', (event) => {
    state.autoReveal = event.target.checked;
    if (!state.autoReveal) {
      setAnswerVisibility(false);
    }
    restartAutoplayIfPlaying();
  });

  const handleRevealDelayChange = (event) => {
    const value = Number.parseInt(event.target.value, 10);
    state.revealDelayMs = Number.isNaN(value) ? state.revealDelayMs : value;
    updateDelayLabels();
    restartAutoplayIfPlaying();
  };

  const handleAdvanceDelayChange = (event) => {
    const value = Number.parseInt(event.target.value, 10);
    state.advanceDelayMs = Number.isNaN(value) ? state.advanceDelayMs : value;
    updateDelayLabels();
    restartAutoplayIfPlaying();
  };

  els.autoRevealDelay.addEventListener('input', handleRevealDelayChange);
  els.autoRevealDelay.addEventListener('change', handleRevealDelayChange);

  els.autoAdvanceDelay.addEventListener('input', handleAdvanceDelayChange);
  els.autoAdvanceDelay.addEventListener('change', handleAdvanceDelayChange);

  els.speechToggle.addEventListener('change', (event) => {
    const speechAvailable = state.useCoquiTTS || state.useMeloTTS || state.useEdgeTTS || supportsSpeech();
    const enabled = event.target.checked && speechAvailable;
    state.speechEnabled = enabled;
    if (!enabled) {
      cancelSpeech();
    }
    updateSpeechControlsState();
    restartAutoplayIfPlaying();
  });

  els.voicePicker.addEventListener('change', (event) => {
    const value = event.target.value;
    state.voiceURI = value;
    if (state.useCoquiTTS || state.useMeloTTS || state.useEdgeTTS) {
      state.voiceName = value;
    }
    restartAutoplayIfPlaying();
  });

  const handleSpeechRateChange = (event) => {
    const rate = Number.parseFloat(event.target.value);
    state.speechRate = Number.isNaN(rate) ? state.speechRate : rate;
    updateSpeechRateLabel();
    restartAutoplayIfPlaying();
  };

  els.speechRate.addEventListener('input', handleSpeechRateChange);
  els.speechRate.addEventListener('change', handleSpeechRateChange);
}

function parseDeck(markdown) {
  const lines = markdown.split(/\r?\n/);
  const sections = [];
  let section = null;
  let questionBuffer = [];
  let answerBuffer = [];
  let mode = 'idle'; // idle | question | answer

  const ensureSection = () => {
    if (!section) {
      section = { title: 'Untitled Section', cards: [] };
      sections.push(section);
    }
  };

  const flushCard = () => {
    const questionText = questionBuffer.join('\n').trim();
    const answerText = answerBuffer.join('\n').trim();

    if (!questionText) {
      questionBuffer = [];
      answerBuffer = [];
      mode = 'idle';
      return;
    }

    ensureSection();

    section.cards.push({
      questionRaw: questionText,
      answerRaw: answerText,
      questionHtml: renderMarkdownBlock(questionText),
      answerHtml: renderMarkdownBlock(answerText),
      questionSpeech: toSpeechText(questionText),
      answerSpeech: toSpeechText(answerText),
    });

    questionBuffer = [];
    answerBuffer = [];
    mode = 'idle';
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed && mode === 'idle') {
      continue;
    }

    if (trimmed.startsWith('<!--')) {
      continue;
    }

    if (trimmed.startsWith('#### ')) {
      flushCard();
      section = {
        title: trimmed.replace(/^####\s*/, '').trim(),
        cards: [],
      };
      sections.push(section);
      mode = 'idle';
      continue;
    }

    if (trimmed.startsWith('#flashcards')) {
      flushCard();
      continue;
    }

    if (mode === 'question' && trimmed === '?') {
      mode = 'answer';
      continue;
    }

    if (mode === 'answer') {
      answerBuffer.push(line);
      continue;
    }

    if (mode === 'question') {
      questionBuffer.push(line);
      continue;
    }

    if (mode === 'idle') {
      if (!trimmed) {
        continue;
      }
      questionBuffer.push(line);
      mode = 'question';
      continue;
    }
  }

  flushCard();

  return sections.filter((entry) => entry.cards.length);
}

function flattenDeck(sections) {
  const cards = [];
  sections.forEach((section, sectionIndex) => {
    section.cards.forEach((card, cardIndex) => {
      const globalIndex = cards.length;
      cards.push({
        ...card,
        sectionTitle: section.title,
        sectionIndex,
        indexWithinSection: cardIndex,
        globalIndex,
      });
    });
  });
  return cards;
}

function renderMarkdownBlock(text) {
  if (!text) {
    return '<p class="empty">No answer provided.</p>';
  }

  const lines = text.split(/\n/);
  let html = '';
  let listBuffer = [];
  let listType = null;

  const flushList = () => {
    if (!listBuffer.length || !listType) {
      listBuffer = [];
      listType = null;
      return;
    }
    html += `<${listType}>${listBuffer.join('')}</${listType}>`;
    listBuffer = [];
    listType = null;
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*+]\s+(.*)/);
    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)/);

    if (bulletMatch || orderedMatch) {
      const currentType = orderedMatch ? 'ol' : 'ul';
      const content = renderInlineMarkdown(
        (orderedMatch && orderedMatch[1]) || (bulletMatch && bulletMatch[1]) || '',
      );

      if (listType && listType !== currentType) {
        flushList();
      }

      listType = listType || currentType;
      listBuffer.push(`<li>${content}</li>`);
      continue;
    }

    flushList();
    html += `<p>${renderInlineMarkdown(trimmed)}</p>`;
  }

  flushList();

  return html || '<p class="empty">No answer provided.</p>';
}

function renderInlineMarkdown(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function toSpeechText(text) {
  return text
    .replace(/<!--.*?-->/gs, '')
    .replace(/[#>*`]/g, ' ')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\*\*/g, '')
    .replace(/__|_/g, '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hydrateSectionPicker() {
  const picker = els.sectionPicker;
  picker.innerHTML = '';

  const defaultOption = document.createElement('option');
  defaultOption.value = 'all';
  defaultOption.textContent = 'All sections';
  picker.append(defaultOption);

  state.sections.forEach((section, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${index + 1}. ${section.title}`;
    picker.append(option);
  });

  picker.value = 'all';
}

function hydrateCardPicker() {
  const picker = els.cardPicker;
  picker.innerHTML = '';

  state.cards.forEach((card, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    const snippet = card.questionRaw.replace(/\s+/g, ' ').slice(0, 60);
    option.textContent = `${card.sectionTitle} — ${snippet}${snippet.length === 60 ? '…' : ''}`;
    picker.append(option);
  });
}

function setShuffle(enabled) {
  state.shuffle = enabled;
  const currentGlobalIndex = state.order[state.currentIndex] ?? 0;

  if (enabled) {
    state.order = shuffleArray(state.cards.map((_, index) => index));
  } else {
    state.order = state.cards.map((_, index) => index);
  }

  const newIndex = state.order.indexOf(currentGlobalIndex);
  state.currentIndex = newIndex >= 0 ? newIndex : 0;
  displayCard();
}

function shuffleArray(source) {
  const array = [...source];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function move(direction) {
  if (!state.order.length) {
    return false;
  }

  let nextIndex = state.currentIndex + direction;

  if (nextIndex < 0) {
    if (!state.loop) {
      nextIndex = 0;
    } else {
      nextIndex = state.order.length - 1;
    }
  } else if (nextIndex >= state.order.length) {
    if (!state.loop) {
      nextIndex = state.order.length - 1;
    } else {
      nextIndex = 0;
    }
  }

  if (nextIndex === state.currentIndex) {
    return false;
  }

  state.currentIndex = nextIndex;
  displayCard();
  return true;
}

function gotoCard(globalIndex) {
  const indexInOrder = state.order.indexOf(globalIndex);
  if (indexInOrder === -1) {
    return;
  }
  state.currentIndex = indexInOrder;
  displayCard();
}

function jumpToSection(value) {
  if (value === 'all') {
    return;
  }

  const sectionIndex = Number.parseInt(value, 10);
  const targetGlobalIndex = state.cards.findIndex(
    (card) => card.sectionIndex === sectionIndex,
  );

  if (targetGlobalIndex >= 0) {
    gotoCard(targetGlobalIndex);
  }
}

function getCurrentCard() {
  if (!state.order.length) {
    return null;
  }
  const globalIndex = state.order[state.currentIndex];
  const card = state.cards[globalIndex];
  if (card && card.globalIndex == null) {
    card.globalIndex = globalIndex;
  }
  return card || null;
}

function displayCard() {
  const card = getCurrentCard();
  if (!card) {
    showMessage('No cards available.');
    return;
  }

  hideMessage();

  clearAutoplayState();
  setAnswerVisibility(false);

  els.sectionTitle.textContent = card.sectionTitle;
  els.cardQuestion.innerHTML = card.questionHtml;
  els.cardQuestionRepeat.innerHTML = card.questionHtml;
  els.cardAnswer.innerHTML = card.answerHtml || '<p>No answer recorded.</p>';

  els.sectionMeta.textContent = `Section ${card.sectionIndex + 1} of ${state.sections.length}`;
  els.cardMeta.textContent = `Card ${state.currentIndex + 1} of ${state.order.length}`;

  const currentCard = getCurrentCard();
  if (currentCard) {
    els.cardPicker.value = String(currentCard.globalIndex);
    els.sectionPicker.value = String(currentCard.sectionIndex);
  }

  updateNavigationButtons();

  if (state.isPlaying) {
    scheduleAutoplay();
  }
}

function toggleAnswer() {
  setAnswerVisibility(!state.showingAnswer);
}

function setAnswerVisibility(show) {
  state.showingAnswer = show;
  if (els.toggleAnswerBtn) {
    els.toggleAnswerBtn.textContent = show ? 'Hide Answer' : 'Show Answer';
  }
  if (els.cardFront && els.cardBack) {
    els.cardFront.classList.toggle('hidden', show);
    els.cardBack.classList.toggle('hidden', !show);
  }
}

function setPlaying(shouldPlay) {
  if (shouldPlay === state.isPlaying) {
    if (shouldPlay) {
      scheduleAutoplay();
    }
    return;
  }

  state.isPlaying = shouldPlay;
  updatePlayButton();

  if (shouldPlay) {
    scheduleAutoplay();
  } else {
    clearAutoplayState();
  }
}

function updatePlayButton() {
  if (!els.playPauseBtn) {
    return;
  }
  els.playPauseBtn.textContent = state.isPlaying ? 'Pause' : 'Play';
  els.playPauseBtn.setAttribute('aria-pressed', state.isPlaying ? 'true' : 'false');
}

function scheduleAutoplay() {
  if (!state.isPlaying) {
    return;
  }

  const card = getCurrentCard();
  if (!card) {
    return;
  }

  clearAutoplayState();

  const token = Symbol('autoplay');
  state.autoplayToken = token;

  const speechAvailable = state.speechEnabled && (state.useCoquiTTS || state.useMeloTTS || state.useEdgeTTS || supportsSpeech()) && (card.questionSpeech || card.answerSpeech);

  if (speechAvailable) {
    runSpeechSequence(card, token);
  } else {
    scheduleSilentAutoplay(token);
  }
}

function runSpeechSequence(card, token) {
  (async () => {
    if (!isAutoplayTokenActive(token) || !state.isPlaying) {
      return;
    }

    if (card.questionSpeech) {
      await speak(card.questionSpeech, token);
      if (!isAutoplayTokenActive(token) || !state.isPlaying) {
        return;
      }
    }

    if (state.autoReveal) {
      await waitWithToken(state.revealDelayMs);
      if (!isAutoplayTokenActive(token) || !state.isPlaying) {
        return;
      }
      if (!state.showingAnswer) {
        setAnswerVisibility(true);
      }
    }

    const shouldReadAnswer = Boolean(card.answerSpeech) && (state.autoReveal || state.showingAnswer);
    if (shouldReadAnswer) {
      await speak(card.answerSpeech, token);
      if (!isAutoplayTokenActive(token) || !state.isPlaying) {
        return;
      }
    }

    scheduleAdvanceTimer(token);
  })();
}

function scheduleSilentAutoplay(token) {
  clearTimers();

  if (state.autoReveal && !state.showingAnswer) {
    if (state.revealDelayMs > 0) {
      state.timers.reveal = window.setTimeout(() => {
        state.timers.reveal = null;
        if (!isAutoplayTokenActive(token) || !state.isPlaying) {
          return;
        }
        setAnswerVisibility(true);
      }, state.revealDelayMs);
    } else {
      setAnswerVisibility(true);
    }

    const totalDelay = Math.max(0, state.revealDelayMs) + Math.max(0, state.advanceDelayMs);
    state.timers.advance = window.setTimeout(() => {
      state.timers.advance = null;
      if (!isAutoplayTokenActive(token) || !state.isPlaying) {
        return;
      }
      advanceAfterAutoplay();
    }, totalDelay);
  } else {
    state.timers.advance = window.setTimeout(() => {
      state.timers.advance = null;
      if (!isAutoplayTokenActive(token) || !state.isPlaying) {
        return;
      }
      advanceAfterAutoplay();
    }, Math.max(0, state.advanceDelayMs));
  }
}

function waitWithToken(duration) {
  if (duration <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function scheduleAdvanceTimer(token) {
  state.timers.advance = window.setTimeout(() => {
    state.timers.advance = null;
    if (!isAutoplayTokenActive(token) || !state.isPlaying) {
      return;
    }
    advanceAfterAutoplay();
  }, Math.max(0, state.advanceDelayMs));
}

function advanceAfterAutoplay() {
  if (!state.isPlaying) {
    return;
  }
  const moved = move(1);
  if (!moved) {
    setPlaying(false);
  }
}

function restartAutoplayIfPlaying() {
  if (!state.isPlaying) {
    return;
  }
  scheduleAutoplay();
}

function clearAutoplayState() {
  clearTimers();
  cancelSpeech();
  state.autoplayToken = null;
}

function clearTimers() {
  if (state.timers.reveal) {
    window.clearTimeout(state.timers.reveal);
    state.timers.reveal = null;
  }
  if (state.timers.advance) {
    window.clearTimeout(state.timers.advance);
    state.timers.advance = null;
  }
}

function cancelSpeech() {
  if (state.useCoquiTTS || state.useMeloTTS || state.useEdgeTTS) {
    if (state.currentAudio) {
      state.currentAudio.pause();
      state.currentAudio = null;
    }
  } else if (supportsSpeech()) {
    window.speechSynthesis.cancel();
  }
  state.activeUtterance = null;
}

async function speak(text, token) {
  if (!text || !isAutoplayTokenActive(token) || !state.isPlaying) {
    return;
  }

  if (state.useCoquiTTS || state.useMeloTTS || state.useEdgeTTS) {
    return speakWithCoqui(text, token);
  } else if (supportsSpeech()) {
    return speakWithBrowser(text, token);
  }
}

function getPrecompiledAudioPath(text, voiceName) {
  /**
   * Generate path to precompiled audio file
   * Format: audio_cache/{voice_name}/{md5_hash}.wav
   */
  const combined = `${text}|${voiceName}`;
  const hash = md5(combined);
  const safeVoiceName = voiceName.replace(/ /g, '_');
  return `${state.audioCacheDir}/${safeVoiceName}/${hash}.wav`;
}

function md5(str) {
  // Simple MD5 implementation for cache keys
  // For production, use a proper crypto library
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
}

async function checkPrecompiledAudio(text, voiceName) {
  /**
   * Check if precompiled audio exists and return it
   */
  if (!state.usePrecompiled) {
    return null;
  }

  try {
    const audioPath = getPrecompiledAudioPath(text, voiceName);
    const response = await fetch(audioPath);

    if (response.ok) {
      console.log('✓ Using precompiled audio:', audioPath);
      return await response.blob();
    }
  } catch (error) {
    // File doesn't exist, will generate on-demand
  }

  return null;
}

async function speakWithCoqui(text, token) {
  try {
    const voiceName = state.voiceName || state.voices[0]?.name || 'Claribel Dervla';

    // Check for precompiled audio first
    let audioBlob = await checkPrecompiledAudio(text, voiceName);

    if (!audioBlob) {
      // Determine which TTS server to use
      let ttsUrl = state.ttsServerUrl; // Default to Coqui
      if (state.useEdgeTTS) {
        ttsUrl = state.edgeTtsServerUrl;
      } else if (state.useMeloTTS) {
        ttsUrl = state.meloServerUrl;
      }

      // Generate on-demand if not precompiled
      const response = await fetch(`${ttsUrl}/api/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          speaker: voiceName,
          voice: voiceName, // Edge TTS uses 'voice' parameter
        }),
      });

      if (!response.ok) {
        console.error('TTS server error:', response.status);
        return;
      }

      audioBlob = await response.blob();
    }

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    state.currentAudio = audio;

    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (state.currentAudio === audio) {
          state.currentAudio = null;
        }
        resolve();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        if (state.currentAudio === audio) {
          state.currentAudio = null;
        }
        console.error('Audio playback error');
        resolve();
      };

      if (isAutoplayTokenActive(token) && state.isPlaying) {
        audio.play().catch((err) => {
          console.error('Audio play error:', err);
          resolve();
        });
      } else {
        resolve();
      }
    });
  } catch (error) {
    console.error('Coqui TTS error:', error);
  }
}

function speakWithBrowser(text, token) {
  return new Promise((resolve) => {
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.rate = state.speechRate;
    const voice = state.voices.find((candidate) => candidate.voiceURI === state.voiceURI);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      if (state.activeUtterance === utterance) {
        state.activeUtterance = null;
      }
      resolve();
    };

    utterance.onerror = () => {
      if (state.activeUtterance === utterance) {
        state.activeUtterance = null;
      }
      resolve();
    };

    state.activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  });
}

function supportsSpeech() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
}

function isAutoplayTokenActive(token) {
  return state.autoplayToken === token;
}

function initializeControls() {
  if (els.autoRevealToggle) {
    els.autoRevealToggle.checked = state.autoReveal;
  }
  if (els.autoRevealDelay) {
    els.autoRevealDelay.value = String(state.revealDelayMs);
  }
  if (els.autoAdvanceDelay) {
    els.autoAdvanceDelay.value = String(state.advanceDelayMs);
  }

  const speechAvailable = state.useCoquiTTS || supportsSpeech();
  if (!speechAvailable) {
    state.speechEnabled = false;
    if (els.speechToggle) {
      els.speechToggle.checked = false;
      els.speechToggle.disabled = true;
    }
  } else if (els.speechToggle) {
    els.speechToggle.checked = state.speechEnabled;
  }

  if (els.speechRate) {
    els.speechRate.value = String(state.speechRate);
  }

  updateDelayLabels();
  updateSpeechRateLabel();
  updateSpeechControlsState();
  updatePlayButton();
}

function updateDelayLabels() {
  if (els.autoRevealValue) {
    els.autoRevealValue.textContent = formatSeconds(state.revealDelayMs);
  }
  if (els.autoAdvanceValue) {
    els.autoAdvanceValue.textContent = formatSeconds(state.advanceDelayMs);
  }
}

function updateSpeechRateLabel() {
  if (els.speechRateValue) {
    els.speechRateValue.textContent = `${state.speechRate.toFixed(2)}x`;
  }
}

function updateSpeechControlsState() {
  const speechSupported = state.useCoquiTTS || state.useMeloTTS || state.useEdgeTTS || supportsSpeech();
  if (!speechSupported && els.speechToggle) {
    els.speechToggle.checked = false;
    els.speechToggle.disabled = true;
  }

  const disableSpeechControls = !speechSupported || !state.speechEnabled;

  if (els.voicePicker) {
    els.voicePicker.disabled = disableSpeechControls || !state.voices.length;
  }

  if (els.speechRate) {
    // Speech rate doesn't apply to Coqui TTS (it has its own fixed rate)
    els.speechRate.disabled = disableSpeechControls || state.useCoquiTTS || state.useMeloTTS || state.useEdgeTTS;
  }
}

async function initSpeech() {
  if (state.useCoquiTTS || state.useMeloTTS || state.useEdgeTTS) {
    await initServerTTS();
  } else if (supportsSpeech()) {
    initBrowserSpeech();
  } else {
    updateSpeechControlsState();
  }
}

async function initServerTTS() {
  try {
    let coquiVoices = [];
    let meloVoices = [];
    let edgeVoices = [];

    // Try Coqui TTS
    try {
      const healthResponse = await fetch(`${state.ttsServerUrl}/api/health`, {timeout: 2000});
      if (healthResponse.ok) {
        const voicesResponse = await fetch(`${state.ttsServerUrl}/api/voices`);
        const data = await voicesResponse.json();
        if (data.voices && data.voices.length > 0) {
          coquiVoices = data.voices.map(v => ({...v, provider: 'coqui'}));
          state.useCoquiTTS = true;
          console.log(`✓ Loaded ${coquiVoices.length} Coqui TTS voices`);
        }
      }
    } catch (error) {
      console.log('Coqui TTS server not available');
    }

    // Try MeloTTS
    try {
      const healthResponse = await fetch(`${state.meloServerUrl}/api/health`, {timeout: 2000});
      if (healthResponse.ok) {
        const voicesResponse = await fetch(`${state.meloServerUrl}/api/voices`);
        const data = await voicesResponse.json();
        if (data.voices && data.voices.length > 0) {
          meloVoices = data.voices.map(v => ({...v, provider: 'melo'}));
          state.useMeloTTS = true;
          console.log(`✓ Loaded ${meloVoices.length} MeloTTS voices`);
        }
      }
    } catch (error) {
      console.log('MeloTTS server not available');
    }

    // Try Edge TTS (FREE!)
    try {
      const healthResponse = await fetch(`${state.edgeTtsServerUrl}/api/health`, {timeout: 2000});
      if (healthResponse.ok) {
        const voicesResponse = await fetch(`${state.edgeTtsServerUrl}/api/voices`);
        const data = await voicesResponse.json();
        if (data.voices && data.voices.length > 0) {
          edgeVoices = data.voices.map(v => ({...v, provider: 'edge', name: v.name || v.id}));
          state.useEdgeTTS = true;
          console.log(`✓ Loaded ${edgeVoices.length} Edge TTS voices (FREE!)`);
        }
      }
    } catch (error) {
      console.log('Edge TTS server not available');
    }

    // Combine all voices (prioritize Edge TTS since it's free!)
    const allVoices = [...edgeVoices, ...coquiVoices, ...meloVoices];

    if (allVoices.length === 0) {
      console.warn('No TTS servers available, falling back to browser speech');
      state.useCoquiTTS = false;
      state.useMeloTTS = false;
      state.useEdgeTTS = false;
      initBrowserSpeech();
      return;
    }

    state.voices = allVoices;

    // Default to first British/Irish/Australian voice if available
    const preferredAccents = ['British', 'Irish', 'Australian'];
    const preferredVoice = allVoices.find(v =>
      v.accent && preferredAccents.includes(v.accent)
    ) || allVoices[0];

    state.voiceName = preferredVoice.name;
    state.voiceURI = preferredVoice.name;

    console.log(`Total voices available: ${allVoices.length}`);
    console.log(`Default voice: ${preferredVoice.name} [${preferredVoice.accent || 'N/A'}]`);

    populateVoicePicker();
    updateSpeechControlsState();
  } catch (error) {
    console.error('Failed to initialize TTS:', error);
    console.log('Falling back to browser speech');
    state.useCoquiTTS = false;
    state.useMeloTTS = false;
    initBrowserSpeech();
  }
}

function initBrowserSpeech() {
  if (!supportsSpeech()) {
    updateSpeechControlsState();
    return;
  }

  const applyVoices = () => {
    const voices = window.speechSynthesis
      .getVoices()
      .slice()
      .filter((voice) => voice.lang.toLowerCase().startsWith('en'))
      .sort((a, b) => a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name));

    if (!voices.length) {
      return;
    }

    state.voices = voices;

    if (!state.voiceURI || !voices.some((voice) => voice.voiceURI === state.voiceURI)) {
      const preferred =
        voices.find((voice) => voice.default) ||
        voices[0];
      state.voiceURI = preferred ? preferred.voiceURI : '';
    }

    populateVoicePicker();
    updateSpeechControlsState();
  };

  applyVoices();
  window.speechSynthesis.addEventListener('voiceschanged', applyVoices);
}

function populateVoicePicker() {
  if (!els.voicePicker) {
    return;
  }

  els.voicePicker.innerHTML = '';

  if (!state.voices.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'No voices available';
    els.voicePicker.append(option);
    els.voicePicker.disabled = true;
    return;
  }

  const fragment = document.createDocumentFragment();

  // Group by preferred accents first
  const preferredAccents = ['British', 'Irish', 'Australian'];
  const preferredVoices = state.voices.filter(v =>
    v.accent && preferredAccents.includes(v.accent)
  );
  const otherVoices = state.voices.filter(v =>
    !v.accent || !preferredAccents.includes(v.accent)
  );

  // Add preferred voices first with star indicator
  preferredVoices.forEach((voice) => {
    const option = document.createElement('option');
    option.value = voice.name;

    const accent = voice.accent ? ` [${voice.accent}]` : '';
    const gender = voice.gender ? ` (${voice.gender})` : '';
    const star = preferredAccents.includes(voice.accent) ? '⭐ ' : '';

    if (state.useCoquiTTS || state.useMeloTTS || state.useEdgeTTS) {
      option.textContent = `${star}${voice.name}${accent}${gender}`;
    } else {
      option.textContent = `${voice.name}${accent}${gender}`;
    }

    fragment.append(option);
  });

  // Add separator if we have both types
  if (preferredVoices.length > 0 && otherVoices.length > 0) {
    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '──────────';
    fragment.append(separator);
  }

  // Add other voices
  otherVoices.forEach((voice) => {
    const option = document.createElement('option');
    option.value = voice.name || voice.voiceURI;

    const accent = voice.accent ? ` [${voice.accent}]` : '';
    const gender = voice.gender ? ` (${voice.gender})` : '';

    if (state.useCoquiTTS || state.useMeloTTS || state.useEdgeTTS) {
      option.textContent = `${voice.name}${accent}${gender}`;
    } else {
      const lang = voice.lang ? ` (${voice.lang})` : '';
      option.textContent = `${voice.name}${lang}${gender}`;
    }

    fragment.append(option);
  });

  els.voicePicker.append(fragment);

  // Set default to first preferred voice if available
  const defaultVoice = preferredVoices[0] || state.voices[0];
  if (defaultVoice) {
    state.voiceName = defaultVoice.name || defaultVoice.voiceURI;
    state.voiceURI = state.voiceName;
    els.voicePicker.value = state.voiceName;
  }
}

function formatSeconds(milliseconds) {
  return `${(Math.max(0, milliseconds) / 1000).toFixed(1)}s`;
}

function updateNavigationButtons() {
  const atStart = state.currentIndex === 0;
  const atEnd = state.currentIndex === state.order.length - 1;

  els.prevBtn.disabled = atStart && !state.loop;
  els.nextBtn.disabled = atEnd && !state.loop;
}

function showMessage(text) {
  els.message.textContent = text;
  els.message.classList.remove('hidden');
}

function hideMessage() {
  els.message.classList.add('hidden');
  els.message.textContent = '';
}

function disableControls() {
  [
    els.playPauseBtn,
    els.prevBtn,
    els.nextBtn,
    els.toggleAnswerBtn,
    els.sectionPicker,
    els.cardPicker,
    els.shuffleToggle,
    els.loopToggle,
    els.autoRevealToggle,
    els.autoRevealDelay,
    els.autoAdvanceDelay,
    els.speechToggle,
    els.voicePicker,
    els.speechRate,
  ].forEach((element) => {
    if (element) {
      element.disabled = true;
    }
  });
}

bootstrap();
