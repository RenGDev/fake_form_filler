function scanForm() {
  const fields = [...document.querySelectorAll("input, textarea")]
    .filter(el => el.type !== "file")
    .map(el => ({
      name: el.name || el.id || "",
      type: el.type || "text",
      placeholder: el.placeholder || ""
    }));

    const html = document.body.innerText;


  return {fields, html};
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  if (msg.action === "scanForm") {
    sendResponse(scanForm());
  }

  if (msg.action === "fillForm") {
    const fakeData = msg.data;

    for (const [key, value] of Object.entries(fakeData)) {
      const el =
        document.querySelector(`[name="${key}"]`) ||
        document.getElementById(key);

        if (!el) return;

        if (el.tagName === "INPUT" && el.type === "file") {
          console.warn("Ignorando <input type='file'>:", el.name || el.id);
          return;
        }

        el.value = value;
    }
  }
});
