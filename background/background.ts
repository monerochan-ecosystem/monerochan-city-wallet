import { setupFinishedYet } from "../wallet/sidebar/init";
import {
  receiveChangeNodeUrlStartHeightEvent,
  receiveWalletSetupFinishedEvent,
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
      console.log("wipe", wallets);
      wallets?.stopWorker();
      wallets = undefined;
    });
    receiveWalletSetupFinishedEvent(msg, async () => {
      wallets = await initWallets();
    });
  });
}
let retryScheduled = false;
let wallets = await initWallets();
let initInProgress = false;
async function initWallets() {
  if (initInProgress) return;
  initInProgress = true;
  if (!(await setupFinishedYet())) return;
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
  initInProgress = false;
  return wallets;
}
