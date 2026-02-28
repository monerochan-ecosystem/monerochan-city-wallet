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

const openDetails: Record<string, boolean | undefined> = {};

export function receivePlate() {
  attachHandlers(receiveActionButtonIds, receiveClickHandler);
  const subaddresses = currentlySelectedWallet()?.subaddresses;
  let plateContent = html`<div></div>`;
  if (subaddresses?.length) {
    plateContent = flatten(
      subaddresses.map((subaddress) => {
        const showDetailsBtn = document.getElementById(subaddress.address);
        if (showDetailsBtn) {
          showDetailsBtn.onclick = () => {
            const details = document.getElementById(
              `details-${subaddress.address}`,
            ) as HTMLElement | null;
            if (details) {
              if (openDetails[subaddress.address]) {
                details.style.display = "none";
                openDetails[subaddress.address] = false;
              } else {
                details.style.display = "block";
                openDetails[subaddress.address] = true;
              }
            }
          };
        }
        const colorclass =
          subaddress.received_amount || 0n > 0
            ? "amount-positive"
            : "amount-zero";
        const amount = convertBigIntAmount(subaddress.received_amount || 0n);
        const amountTrun = truncateDecimalString(amount, 3);
        return html`<div class="subaddress-container">
          <div class="subaddress">${subaddress.address}</div>
          <div>
            <div class="amount ${colorclass}">${amountTrun}</div>
            <div class="show-info" id="${subaddress.address}">
              ${openDetails[subaddress.address] ? "hide" : "show"} details
            </div>
          </div>
          <div class="subaddress-details" id="details-${subaddress.address}">
            subadddress minor index: ${subaddress.minor}
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
        grid-template-areas:
          "subaddress amount"
          "details details";
      }
      .show-info {
        width: 36px;
        margin-top: 7px;
        cursor: pointer;
        font-family: sans-serif;
        font-weight: 700;
        user-select: none;
      }
      .show-info:hover {
        color: white;
      }
      .amount {
      }
      .amount-positive {
        color: #ff4444;
      }
      .amount-zero {
        color: white;
      }
      .subaddress-details {
        grid-area: details;
        display: none;
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
