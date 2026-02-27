import {
  get_info,
  readConnectionStatusDefaultLocation,
  type ManyScanCachesOpened,
} from "@spirobel/monero-wallet-api";
import type { Mini } from "../../../mininext/mininext";
import type { WalletRouteParams } from "../router";
import { attachHandlers } from "../ui/buttons";
import {
  lowerButtonIds,
  lowerClickHandler,
  walletLower,
  type LowerButtonId,
} from "./walletLower";
import {
  safetyButtonIds,
  safetyClickHandler,
  walletUpper,
} from "./walletUpper";
declare global {
  interface Window {
    walletRouteParams?: WalletRouteParams | null;
    activeWalletPlate?: LowerButtonId | null;
    wallets?: ManyScanCachesOpened;
    unlocked?: boolean;
  }
}

export const walletRoute = (mini: Mini, params: WalletRouteParams) => {
  window.walletRouteParams = params;
  //derive current wallet from that
  // with window.wallets
  attachHandlers(safetyButtonIds, safetyClickHandler);
  attachHandlers(lowerButtonIds, lowerClickHandler);
  return mini.html`
        <div class="main">
        <style>
            .main {
                display: flex;
                flex-direction: column;
                height: 100%;
                padding: 8px;
                gap: 11px;
            }
        </style>
        
            ${walletUpper()}
            ${walletLower()}
        </div>`;
};
export function allWallets() {
  if (!window.wallets?.wallets) return [];
  return window.wallets.wallets;
}
export function currentlySelectedWallet() {
  if (!window.wallets?.wallets) return undefined;
  return window.wallets?.wallets[0];
}
export function currentStartingHeight() {
  if (!window.wallets?.wallets) return undefined;
  return window.wallets.start_height;
}
export async function setCurrentStartingHeight(start_height: number | null) {
  if (!window.wallets?.wallets) throw new Error("no wallets");
  await window.wallets.changeStartHeight(start_height);
}
let interval: null | number | NodeJS.Timeout = null;
let connected_to_node = false;
let etaString: string | null = null;

export function eta(): string | null {
  return etaString;
}

export function connectedToNode(): boolean {
  if (!interval) interval = setInterval(checkConnection, 2500);
  return connected_to_node;
}

async function checkConnection() {
  const jsonString = await Bun.file("eta.json")
    .text()
    .catch(() => null);
  if (jsonString) {
    const etaJSON = JSON.parse(jsonString);
    if (etaJSON.eta) {
      etaString = etaJSON.eta;
    }
  }
  const connectionStatus = await readConnectionStatusDefaultLocation();
  if (
    connectionStatus?.last_packet.status === "OK" &&
    isWithinLast10Seconds(connectionStatus?.last_packet.timestamp)
  ) {
    connected_to_node = true;
  } else if (connectionStatus?.last_packet.status !== "OK") {
    connected_to_node = false; // if connection status is not OK, we assume no connection
    activeConnectionCheck(); // still tx processing, takes time, so we do an active check
  } else {
    connected_to_node = true;
    activeConnectionCheck();
  }
}
async function activeConnectionCheck() {
  if (!window.wallets?.wallets) {
    connected_to_node = false;
    return;
  }
  const wallet = window.wallets.wallets[0];
  const node_url = wallet?.node_url;
  if (!node_url) {
    connected_to_node = false;
    return;
  }
  try {
    await get_info(wallet?.node_url);
    connected_to_node = true;
    return;
  } catch (error) {
    connected_to_node = false;
    return;
  }
}
function isWithinLast10Seconds(timestamp?: string): boolean {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return false;
  }
  const now = Date.now();
  const tsTime = date.getTime();
  const ageInMs = now - tsTime;
  return ageInMs >= 0 && ageInMs <= 10_000;
}
