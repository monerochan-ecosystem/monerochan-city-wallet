import { setupFinishedYet } from "../wallet/sidebar/init";
import {
  receiveChangeNodeUrlStartHeightEvent,
  receiveMoneroToolEvent,
  receiveOpenSideBarEvent,
  receiveSendTransactionEvent,
  receiveShareViewkeyEvent,
  receiveShareViewkeyFAILEDEvent,
  receiveWalletSetupFinishedEvent,
  receiveWalletWipeEvent,
  sendShareViewkeyEvent,
  sendWalletChangedEvent,
  type ExtensionMessage,
} from "./messagebus";

import {
  atomicWrite,
  openWallets,
  writeScanSettingsFileDefaultLocation,
} from "@spirobel/monero-wallet-api";
import { defaultHappyPathSend } from "./sendTransaction";
import { pushToolInvocation } from "../wallet/tools/toolInvocations";
import { dismissToolInvocationByType } from "../wallet/sidebar/segments/walletRoute";
declare global {
  var browser: typeof chrome;
}
if (typeof chrome !== "undefined" && typeof browser === "undefined") {
  globalThis.browser = chrome;
}

if (browser.runtime) {
  let port002: null | chrome.runtime.Port = null;
  let port002_invo_id: null | string = null;
  browser.runtime.onMessage.addListener((msg: ExtensionMessage, sender) => {
    console.log(msg);
    receiveOpenSideBarEvent(msg, () => {
      (browser as any).sidebarAction?.open().catch(() => {});
    });
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
    receiveShareViewkeyEvent(msg, async (payload) => {
      if (!port002) return;
      if (payload.tool_invo.invocation_id !== port002_invo_id) return;
      sendShareViewkeyEvent(payload, port002);
    });
    receiveShareViewkeyFAILEDEvent(msg, async (payload) => {
      const primary_address = payload.primary_address;

      await writeScanSettingsFileDefaultLocation({
        async writeCallback(settings) {
          // Find matching wallet first so we can delete its files
          const matching = settings.wallets.find(
            (w) => w.primary_address === primary_address,
          );
          if (matching) {
            await Bun.file(`${matching.primary_address}_cache.json`).delete();
            await Bun.file(`${matching.primary_address}_stats.json`).delete();
          }
          settings.wallets = settings.wallets.filter(
            (w) => w.primary_address !== primary_address,
          );
        },
      });
      wallets = await initWallets();
      await atomicWrite(
        "failed_wallet_restore_002.json",
        JSON.stringify(payload, null, 2),
      );
    });
  });
  browser.runtime.onConnect.addListener((port) => {
    if (port002) port002.disconnect();
    port002 = port;
    port002_invo_id = port.name;
    port002.onDisconnect.addListener(async () => {
      console.log("002 tab closed");
      await dismissToolInvocationByType("002");
      port002_invo_id = null;
      port002 = null;
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
