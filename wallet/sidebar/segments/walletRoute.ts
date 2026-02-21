import type { ManyScanCachesOpened } from "@spirobel/monero-wallet-api";
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
export function connectedToNode(): boolean {
  //todo check if there was a connection status update
  // in the last 10 seconds
  return false;
}
