chrome.runtime.onInstalled.addListener(() => {
  console.log("Webcam Authentication Extension Installed!");
});

// Optional: Listen for messages from content or popup scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "uploadImage") {
    fetch("http://localhost:5000/upload", {
      method: "POST",
      body: message.data,
    })
      .then((response) => response.json())
      .then((result) => sendResponse({ success: true, result }))
      .catch((error) => sendResponse({ success: false, error }));
    return true; // Keeps the message channel open for async responses
  }
});
