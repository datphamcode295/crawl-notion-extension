chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'sendMarkdown') {
    fetch(
      'https://datpvworkspace--has-simple-web-endpoint-fastapi-app.modal.run/api/upload',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message.payload),
      }
    )
      .then((response) => response.json())
      .then((data) => sendResponse(data))
      .catch((error) => sendResponse({ error: error.message }));

    return true; // Keep message channel open for async response
  }
});
