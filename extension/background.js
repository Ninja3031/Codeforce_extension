chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FETCH_LEADERBOARD") {
    fetch(request.url)
      .then(res => res.json())
      .then(data => sendResponse(data))
      .catch(err => sendResponse({ error: err.message }));

    return true; // required for async response
  }
  
  if (request.type === "SHOW_NOTIFICATION") {
    chrome.notifications.create(request.notificationId || "", {
      type: "basic",
      iconUrl: "images/icon48.png", // Assuming valid or default
      title: request.title || "Codeforces Update",
      message: request.message || ""
    });
    return true;
  }

  if (request.type === "API_REQUEST") {
    const options = {
      method: request.method || "GET",
      headers: {
        "Content-Type": "application/json"
      }
    };
    if (request.body) {
      options.body = JSON.stringify(request.body);
    }

    fetch(request.url, options)
      .then(res => res.json())
      .then(data => sendResponse(data))
      .catch(err => sendResponse({ error: err.message }));

    return true;
  }
});