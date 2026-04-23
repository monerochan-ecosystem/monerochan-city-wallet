import {
  openWallets,
  SCAN_SETTINGS_STORE_NAME_DEFAULT,
  type ParsedMoneroToolInvocation,
} from "@spirobel/monero-wallet-api";
import {
  receiveMoneroToolEvent,
  receiveShareViewkeyFAILEDEvent,
  receiveWalletChangedEvent,
  type ExtensionMessage,
  type ShareViewkeyFAILEDPayload,
} from "../../background/messagebus";
import { router } from "./router";
import { readToolInvocationLog } from "../tools/toolInvocations";
import { lowerButtonIds } from "./segments/walletLower";
import { removeActive } from "./ui/buttons";
import { navigateToFirstWallet } from "./segments/walletRoute";

if (typeof chrome !== "undefined" && typeof browser === "undefined") {
  globalThis.browser = chrome;
}

export async function showFailedWalletRestoreNotification(payload: {
  tool_invo: ParsedMoneroToolInvocation;
  viewkey: string;
  primary_address: string;
}) {
  // Reload the failed wallet restore data from disk
  // The background script has already written to failed_wallet_restore_002.json
  await loadFailedWalletRestoreData(payload);
}
let failed002: null | ShareViewkeyFAILEDPayload = null;
export async function loadFailedWalletRestoreData(
  payload?: ShareViewkeyFAILEDPayload,
) {
  if (!payload) {
    failed002 = await readFailedWalletRestore();
  } else {
    failed002 = payload;
  }
}

export function getFailedWalletRestoreData() {
  return failed002;
}
export async function clearFailedWalletRestoreData() {
  await deleteFailedWalletRestore();
  failed002 = null;
}
export async function readFailedWalletRestore(): Promise<ShareViewkeyFAILEDPayload | null> {
  try {
    const jsonString = await Bun.file("failed_wallet_restore_002.json")
      .text()
      .catch(() => undefined);
    return jsonString
      ? (JSON.parse(jsonString) as ShareViewkeyFAILEDPayload)
      : null;
  } catch {
    return null;
  }
}

export async function deleteFailedWalletRestore() {
  try {
    await Bun.file("failed_wallet_restore_002.json").delete();
  } catch {
    // file does not exist
  }
}

export async function initWallets() {
  window.wallets = await openWallets({
    no_worker: true,
  });
  //if (!wallets) throw new Error("Could not open wallets");
  console.log("wallets", window.wallets);

  if (browser.runtime) {
    browser.runtime.onMessage.addListener((msg: ExtensionMessage, sender) => {
      receiveWalletChangedEvent(msg, async (payload) => {
        await window.wallets?.feed(payload);
      });
      receiveMoneroToolEvent(msg, async (payload) => {
        syncUItoToolInvocation(payload);
      });
      receiveShareViewkeyFAILEDEvent(msg, async (payload) => {
        // Display the 002 notification about failure
        // The notification will be shown in the wallets plate
        // and is dismissable by clicking dismiss:  will delete failed_wallet_restore_002.json
        await showFailedWalletRestoreNotification(payload);
      });
    });
  }
}
export async function initSidebar() {
  if (await setupFinishedYet()) {
    navigateToFirstWallet();
    await initToolInvocation();
    await loadFailedWalletRestoreData();
  } else {
    router.navigate("/onboarding");
    return;
  }
  await initWallets();
}

export async function setupFinishedYet() {
  const scan_settings_file_content = await Bun.file(
    SCAN_SETTINGS_STORE_NAME_DEFAULT,
  )
    .text()
    .catch(() => "");
  if (scan_settings_file_content.length) {
    return true;
  } else {
    return false;
  }
}

export async function initToolInvocation() {
  const toolInvocationLog = await readToolInvocationLog();
  const lastInvocation = toolInvocationLog.at(-1);

  if (lastInvocation && !lastInvocation.dismissed) {
    syncUItoToolInvocation(lastInvocation.tool);
  }
}

export function syncUItoToolInvocation(
  lastInvocation: ParsedMoneroToolInvocation,
) {
  removeActive(lowerButtonIds);
  // open activity according to tool id
  if (lastInvocation.tool.tool_id === "001") {
    window.activeWalletPlate = lowerButtonIds.send;
  }
  if (lastInvocation.tool.tool_id === "002") {
    window.activeWalletPlate = lowerButtonIds.wallets;
  }
  if (!window.activeWalletPlate) return;
  const button = document.getElementById(window.activeWalletPlate);
  if (button) button.classList.add("active-switch");
}
