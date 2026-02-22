import { html } from "../../../mininext/mininext";
import { rightUpper, tactileContentPlate } from "../ui/content";
import { currentlySelectedWallet } from "./walletRoute";

export function historyPlate() {
  console.log("historyPlate", currentlySelectedWallet()?.cache);
  return tactileContentPlate(html`<div>HISTORY</div>`, rightUpper);
}
