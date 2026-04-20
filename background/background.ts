import { setupFinishedYet } from "../wallet/sidebar/init";
import {
  receiveChangeNodeUrlStartHeightEvent,
  receiveMoneroToolEvent,
  receiveSendTransactionEvent,
  receiveWalletSetupFinishedEvent,
  receiveWalletWipeEvent,
  sendWalletChangedEvent,
  type ExtensionMessage,
} from "./messagebus";

import { atomicWrite, openWallets } from "@spirobel/monero-wallet-api";
import { defaultHappyPathSend } from "./sendTransaction";
import { pushToolInvocation } from "../wallet/tools/toolInvocations";
declare global {
  var browser: typeof chrome;
}
if (typeof chrome !== "undefined" && typeof browser === "undefined") {
  globalThis.browser = chrome;
}

if (browser.runtime) {
  browser.runtime.onMessage.addListener((msg: ExtensionMessage, sender) => {
    console.log(msg);
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
    receiveMoneroToolEvent(msg, async (payload) => {
      await pushToolInvocation(payload);
    });
  });
}
let retryScheduled = false;
let wallets = await initWallets();
async function initWallets() {
  if (!(await setupFinishedYet())) return;
  const wallets = await openWallets({
    notifyMasterChanged: (result) => {
      doETA();
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
let blocks_till_tip = null;
let last_height: null | number = null;
let last_height_update_timestamp: null | number = null;
let blocks_since_last_update: null | number = null;
let duration: null | number = null;
function doETA() {
  if (!wallets?.wallets) return;
  const wallet = wallets.wallets[0];
  const daemon_height = wallet?.daemon_height;
  const current_height = wallet?.current_height;
  if (typeof daemon_height !== "number" || typeof current_height !== "number")
    return;

  blocks_till_tip = daemon_height - current_height;
  if (typeof last_height === "number")
    blocks_since_last_update = current_height - last_height;

  if (typeof last_height_update_timestamp === "number") {
    duration = Date.now() - last_height_update_timestamp;
  }

  last_height = current_height;
  last_height_update_timestamp = Date.now();

  if (blocks_since_last_update !== null && duration !== null) {
    const blocks_per_ms = blocks_since_last_update / duration;
    const eta = blocks_till_tip / blocks_per_ms;
    function msToHHMM(ms: number): string {
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return "00:00";
      }

      const paddedHours = String(hours).padStart(2, "0");
      const paddedMinutes = String(remainingMinutes).padStart(2, "0");

      return `${paddedHours}:${paddedMinutes}`;
    }
    atomicWrite("eta.json", JSON.stringify({ eta: msToHHMM(eta) }, null, 2));
  }
}
