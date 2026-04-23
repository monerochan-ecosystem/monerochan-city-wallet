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
} from "../../background/messagebus";
import { router } from "./router";
import { readToolInvocationLog } from "../tools/toolInvocations";
import { lowerButtonIds } from "./segments/walletLower";
import { removeActive } from "./ui/buttons";
import { navigateToFirstWallet } from "./segments/walletRoute";

if (typeof chrome !== "undefined" && typeof browser === "undefined") {
  globalThis.browser = chrome;
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
        //TODO implement function that shows 002 notification about falure
        // this notification should be dismissable and delete the
        // failed_wallet_restore_002.json
        // this one should also be called in init sidebar function
      });
    });
  }
}
export async function initSidebar() {
  if (await setupFinishedYet()) {
    navigateToFirstWallet();
    await initToolInvocation();
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
