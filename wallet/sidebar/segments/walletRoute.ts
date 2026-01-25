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
  safteyClickHandler,
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
  attachHandlers(safetyButtonIds, safteyClickHandler);
  attachHandlers(lowerButtonIds, lowerClickHandler);
  return mini.html`
        <div class="main">
        <style>
            .main {
                display: flex;
                flex-direction: column;
                height: 100%;
                max-height: 900px;
                padding: 8px;
                gap: 11px;
            }
        </style>
        
            ${walletUpper()}
            ${walletLower()}
        </div>`;
};
