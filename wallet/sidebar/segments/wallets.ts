import { flatten, html, type MiniHtmlString } from "../../../mininext/mininext";
import { router } from "../router";
import { rightLower, tactileContentPlate } from "../ui/content";
import { allWallets } from "./walletRoute";

export function walletsPlate() {
  const walletsList: () => MiniHtmlString = () => {
    const wl = allWallets().map(
      (wallet) =>
        html`<a class="wallet" href=${router.link(wallet.wallet_route || "")}>${wallet.wallet_route || '""'}</div>`,
    ) || [html`<div class="wallet">no wallets</div>`];
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
      </style>
      ${walletsList()}
    </div>`,
    rightLower,
    "top",
  );
}
