chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.target === "content") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, msg.message, sendResponse);
    });

    return true; 
  }
});
