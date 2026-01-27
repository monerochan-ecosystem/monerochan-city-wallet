import { flatten, html } from "../../../mininext/mininext";
import { actionButton, attachHandlers } from "../ui/buttons";
import { middleUpper, tacticleContentPlate } from "../ui/content";
import { currentlySelectedWallet } from "./walletRoute";
export type ReceiveActionButtonIds =
  (typeof receiveActionButtonIds)[keyof typeof receiveActionButtonIds];
export const receiveActionButtonIds = {
  newAddress: "new-address",
  copyAddress: "copy-address",
} as const;
export function receivePlate() {
  attachHandlers(receiveActionButtonIds, receiveClickHandler);
  //console.log(document.getElementById(receiveActionButtonIds.newAddress));
  const subaddresses = currentlySelectedWallet()?.subaddresses;
  let plateContent = html`<div></div>`;
  if (subaddresses?.length) {
    plateContent = flatten(
      subaddresses.map((subaddress) => {
        return html`<div class="subaddress">${subaddress.address}</div>`;
      }),
    );
  } else {
    plateContent = html`<div class="no-subaddress">
      no subaddresses <br />
    </div>`;
  }
  return html`<div class="plate">
    <style>
      .plate {
        display: grid;
        grid-template-rows: 1fr 80px;
      }
      .actions {
        display: grid;
        grid-template-columns: 140px 1fr 140px;
        margin-left: 8px;
      }
      .subaddress {
        width: 245px;
        word-wrap: break-word;
        display: inline-block;
        margin-bottom: 20px;
      }
    </style>
    ${tacticleContentPlate(plateContent, middleUpper)}
    <div class="actions">
      ${actionButton(receiveActionButtonIds.newAddress, "NEW ADDRESS")}
      <div></div>
      ${actionButton(receiveActionButtonIds.copyAddress, "COPY")}
    </div>
  </div>`;
}

export function receiveClickHandler(e: MouseEvent) {
  console.log("receiveClickHandler");
  console.log(e);
  const target = e.currentTarget as HTMLElement | null;
  const id = (e.currentTarget as HTMLElement | null)
    ?.id as ReceiveActionButtonIds;
  if (!id || !target) return;
  console.log(id, target);
  if (id === receiveActionButtonIds.newAddress) {
    const subaddress = currentlySelectedWallet()?.makeSubaddress();
    console.log(subaddress);
  }
}
