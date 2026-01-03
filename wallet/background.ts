declare global {
  var browser: typeof chrome;
}
if (typeof chrome !== "undefined" && typeof browser === "undefined") {
  globalThis.browser = chrome;
}
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("onMessage fired", msg, sender, sendResponse);
  sendResponse({ received: true });
  return true;
});

browser.runtime.onInstalled.addListener(async () => {
  console.log("onInstalled fired");

  const { scanWallets } = await import("@spirobel/monero-wallet-api");

  scanWallets(
    (x) => browser.runtime.sendMessage({ type: "RESULT", payload: x }),
    undefined
  );
});
