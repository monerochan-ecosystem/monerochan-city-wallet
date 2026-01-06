//necessary for chrome because of its MV3 charade. Basically the same outcome as firefox with the background script
let creating: null | Promise<void> = null;
async function setupOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
  });

  if (existingContexts.length > 0) {
    return;
  }

  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: "/background/offscreen/bridge.html",
      reasons: ["WORKERS"],
      justification: "worker for wallet syncing and scanning utxos.",
    });
    await creating;
    creating = null;
  }
}

chrome.runtime.onStartup.addListener(setupOffscreenDocument);
chrome.runtime.onInstalled.addListener(setupOffscreenDocument);
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
