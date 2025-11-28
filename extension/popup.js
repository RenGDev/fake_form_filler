function sendToContent(message) {
  return new Promise(async (resolve) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    chrome.tabs.sendMessage(tab.id, message, resolve);
  });
}

document.getElementById("generate").addEventListener("click", async () => {

  const scan = await sendToContent({ action: "scanForm" });

  console.log("SCAN:", scan);

  if (!scan) {
    document.getElementById("result").innerText = "ERRO: scanForm retornou vazio.";
    return;
  }

  const response = await fetch("http://localhost:5000/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: scan.fields,
      html: scan.html
    })
  });

  const fakeData = await response.json();

  document.getElementById("result").innerText =
    JSON.stringify(fakeData, null, 2);

  await sendToContent({
    action: "fillForm",
    data: fakeData
  });
});
