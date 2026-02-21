import {
  receiveChangeNodeUrlStartHeightEvent,
  sendWalletChangedEvent,
  type ExtensionMessage,
} from "./messagebus";

import { openWallets } from "@spirobel/monero-wallet-api/dist";
declare global {
  var browser: typeof chrome;
}
if (typeof chrome !== "undefined" && typeof browser === "undefined") {
  globalThis.browser = chrome;
}

if (browser.runtime) {
  browser.runtime.onMessage.addListener((msg: ExtensionMessage, sender) => {
    receiveChangeNodeUrlStartHeightEvent(msg, (payload) => {
      wallets?.changeNodeUrlAndStartHeight(
        payload.nodeUrl,
        payload.start_height,
      );
    });
  });
}
let retryScheduled = false;
const wallets = await openWallets({
  notifyMasterChanged: (result) => {
    sendWalletChangedEvent(result);
  },
  workerError: (err) => {
    console.log(
      "scan worker error, typically loss of network connection, retry in 1 second",
      err,
    );
    if (retryScheduled) return;

    retryScheduled = true;
    setTimeout(() => {
      wallets?.retry();
      retryScheduled = false;
    }, 1000);
  },
  no_stats: true,
});
