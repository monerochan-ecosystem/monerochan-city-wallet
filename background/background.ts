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
let wallets = await initWallets();
async function initWallets() {
  wallets?.stopWorker(); // kills all old worker threads
  if (!(await setupFinishedYet())) return;
  const local_wallets = await openWallets({
    notifyMasterChanged: (result) => {
      sendWalletChangedEvent(result);
    },
    workerError: async (err) => {
      if (!(await setupFinishedYet())) return;
      console.log(
        "scan worker error, typically loss of network connection, retry in 1 second",
        err,
      );
    },
    autoRetry: true,
    retryDelayMs: 1000,
    no_stats: true,
  });
  return local_wallets;
}
