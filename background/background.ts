import {
  receiveChangeNodeUrlStartHeightEvent,
  receiveWalletWipeEvent,
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
    receiveWalletWipeEvent(msg, () => {
      wallets?.stopWorker();
      wallets = undefined;
    });
  });
}
let retryScheduled = false;
let wallets = await initWallets();

async function initWallets() {
  return await openWallets({
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
}
//TODO if scansettings.json is empty, nuke worker by calling pause and
// check every second if we have scan settings again and then rerun openWallets
// -> use events instead
