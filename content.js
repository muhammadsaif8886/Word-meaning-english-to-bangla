let popupElement = null;

document.addEventListener('mouseup', () => {
  setTimeout(handleTextSelection, 50);
}, true);

document.addEventListener('keyup', () => {
  setTimeout(handleTextSelection, 50);
}, true);

document.addEventListener('mousedown', (e) => {
  if (popupElement && !popupElement.contains(e.target)) {
    removePopup();
  }
}, true);

async function handleTextSelection() {
  const selection = window.getSelection();
  if (!selection) return;

  const selectedText = selection.toString().trim();

  if (selectedText.length > 0 && selectedText.length < 100) {
    if (selection.rangeCount === 0) return;

    if (popupElement && popupElement.contains(selection.anchorNode)) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    removePopup();

    const x = rect.left + window.scrollX;
    const y = rect.bottom + window.scrollY + 8;

    showPopup(x, y, selectedText, 'খোঁজা হচ্ছে...');

    try {
      const meaning = await fetchTranslation(selectedText);
      updatePopup(meaning);
    } catch (err) {
      updatePopup('অর্থ পাওয়া যায়নি (Network Error)');
    }
  }
}

function showPopup(x, y, word, text) {
  popupElement = document.createElement('div');
  popupElement.className = 'dict-popup-card';
  popupElement.style.left = `${x}px`;
  popupElement.style.top = `${y}px`;

  const header = document.createElement('div');
  header.className = 'dict-popup-header';
  header.textContent = word;

  const meaning = document.createElement('div');
  meaning.className = 'dict-popup-meaning dict-popup-loading';
  meaning.textContent = text;

  popupElement.append(header, meaning);
  document.body.appendChild(popupElement);
}

function updatePopup(meaning) {
  if (!popupElement) return;
  const meaningEl = popupElement.querySelector('.dict-popup-meaning');
  if (meaningEl) {
    meaningEl.classList.remove('dict-popup-loading');
    meaningEl.textContent = meaning;
  }
}

function removePopup() {
  if (popupElement) {
    popupElement.remove();
    popupElement = null;
  }
}

function fetchTranslation(text) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'TRANSLATE', text }, (res) => {
      if (chrome.runtime.lastError || !res || !res.ok) {
        reject(new Error('translate failed'));
      } else {
        resolve(res.meaning || 'অর্থ পাওয়া যায়নি');
      }
    });
  });
}
