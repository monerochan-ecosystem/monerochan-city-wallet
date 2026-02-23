import {
  openWallets,
  SCAN_SETTINGS_STORE_NAME_DEFAULT,
} from "@spirobel/monero-wallet-api";
import {
  receiveWalletChangedEvent,
  type ExtensionMessage,
} from "../../background/messagebus";
import { router } from "./router";

if (typeof chrome !== "undefined" && typeof browser === "undefined") {
  globalThis.browser = chrome;
}
export async function initSidebar() {
  if (await setupFinishedYet()) {
    router.navigate("/main/no_domain/single/0");
  } else {
    router.navigate("/onboarding");
    return;
  }
  window.wallets = await openWallets({
    no_worker: true,
  });
  //if (!wallets) throw new Error("Could not open wallets");
  console.log("wallets", window.wallets);

  if (browser.runtime) {
    browser.runtime.onMessage.addListener((msg: ExtensionMessage, sender) => {
      receiveWalletChangedEvent(msg, (payload) => {
        window.wallets?.feed(payload);
      });
    });
  }
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
