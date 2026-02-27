import {
  convertBigIntAmount,
  truncateDecimalString,
} from "@spirobel/monero-wallet-api";
import { flatten, html } from "../../../mininext/mininext";
import { actionButton, attachHandlers } from "../ui/buttons";
import { middleUpper, tactileContentPlate } from "../ui/content";
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
        const colorclass =
          subaddress.amount || 0n > 0 ? "amount-positive" : "amount-zero";
        const amount = convertBigIntAmount(subaddress.amount || 0n);
        const amountTrun = truncateDecimalString(amount, 3);
        return html`<div class="subaddress-container">
          <div class="subaddress">${subaddress.address}</div>
          <div>
            <div class="amount ${colorclass}">${amountTrun}</div>
            <div class="show-info">show details</div>
          </div>
        </div>`;
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
        width: 210px;
        word-wrap: break-word;
        display: inline-block;
        margin-bottom: 20px;
        user-select: all;
      }
      .subaddress-container {
        display: grid;
        grid-template-columns: 230px 1fr;
      }
      .show-info {
        width: 36px;
        margin-top: 7px;
      }
      .amount {
      }
      .amount-positive {
        color: #ff4444;
      }
      .amount-zero {
        color: white;
      }
    </style>
    ${tactileContentPlate(plateContent, middleUpper)}
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
