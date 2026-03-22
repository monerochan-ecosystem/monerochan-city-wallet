import {
  convertBigIntAmount,
  truncateDecimalString,
} from "@spirobel/monero-wallet-api";
import { flatten, html, type MiniHtmlString } from "../../../mininext/mininext";
import { router } from "../router";
import { rightLower, tactileContentPlate } from "../ui/content";
import { allWallets } from "./walletRoute";

export function walletsPlate() {
  const walletsList: () => MiniHtmlString = () => {
    const wl = allWallets().map((wallet) => {
      const colorclass =
        wallet.amount || 0n > 0 ? "amount-positive" : "amount-zero";
      const amount = convertBigIntAmount(wallet.amount || 0n);
      const amountTrun = truncateDecimalString(amount, 3);
      return html`<div class="wallet-route">
        <a class="wallet" href=${router.link(wallet.wallet_route || "")}>
          ${wallet.wallet_route || '""'}
        </a>
        <div class="amount ${colorclass}">${amountTrun}</div>
      </div>`;
    }) || [html`<div class="wallet">no wallets</div>`];
    return flatten(wl);
  };

  return tactileContentPlate(
    html`<div>
      <style>
        .wallet {
          box-sizing: border-box;
          color: rgb(0, 0, 238);
          cursor: pointer;
          display: inline;
          font-family: sans-serif;
          font-size: 16px;
          font-weight: 700;
        }
        .wallet-route {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 28px;
          place-items: baseline;
        }
        .amount-positive {
          color: #ff4444;
        }
        .amount-zero {
          color: white;
        }
      </style>
      ${walletsList()}
    </div>`,
    rightLower,
    "top",
    "468px",
  );
}
