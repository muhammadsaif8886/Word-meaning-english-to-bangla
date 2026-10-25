chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'TRANSLATE') {
    const url =
      'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bn&dt=t&q=' +
      encodeURIComponent(msg.text);

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const meaning = (data && data[0])
          ? data[0].map((part) => part[0]).join('')
          : '';
        sendResponse({ ok: true, meaning });
      })
      .catch((err) => sendResponse({ ok: false, error: String(err) }));

    return true;
  }
});
