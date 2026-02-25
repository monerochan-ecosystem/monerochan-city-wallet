import { setupFinishedYet } from "../wallet/sidebar/init";
import {
  receiveChangeNodeUrlStartHeightEvent,
  receiveSendTransactionEvent,
  receiveWalletSetupFinishedEvent,
  receiveWalletWipeEvent,
  sendWalletChangedEvent,
  type ExtensionMessage,
} from "./messagebus";

import { openWallets } from "@spirobel/monero-wallet-api/dist";
import { defaultHappyPathSend } from "./sendTransaction";
declare global {
  var browser: typeof chrome;
}
if (typeof chrome !== "undefined" && typeof browser === "undefined") {
  globalThis.browser = chrome;
}

if (browser.runtime) {
  browser.runtime.onMessage.addListener((msg: ExtensionMessage, sender) => {
    receiveChangeNodeUrlStartHeightEvent(msg, async (payload) => {
      if (!wallets) wallets = await initWallets();
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
    receiveSendTransactionEvent(msg, async (payload) => {
      const result = await defaultHappyPathSend(payload, wallets);
      console.log(result);
    });
  });
}
let retryScheduled = false;
let wallets = await initWallets();
async function initWallets() {
  if (!(await setupFinishedYet())) return;
  const wallets = await openWallets({
    notifyMasterChanged: (result) => {
      sendWalletChangedEvent(result);
    },
    workerError: async (err) => {
      if (!(await setupFinishedYet())) return;

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
  return wallets;
}
