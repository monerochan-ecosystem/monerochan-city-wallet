import {
  parseAddress,
  type ParseAddressError,
  type ParsedAddress,
} from "@spirobel/monero-wallet-api";
import { html, type MiniHtmlString } from "../../../mininext/mininext";
import { actionButton } from "../ui/buttons";
import { leftUpper, tacticleContentPlate } from "../ui/content";
import { sendButtonDotStyles } from "./walletLower";
import { connectedToNode } from "./walletRoute";

export function walletUnlocked() {
  return window.unlocked;
}
let addressInputvalue = "";
let parsedAddress: ParseAddressError | ParsedAddress | null = null;
export async function parseAddressCallback() {
  const addressInput = document.getElementById(
    "addressInput",
  ) as HTMLInputElement | null;
  if (!addressInput) return;
  parsedAddress = await parseAddress(addressInput.value.trim());
  addressInputvalue = addressInput.value;
}
export function sendPlateContent() {
  const addressInput = document.getElementById(
    "addressInput",
  ) as HTMLInputElement | null;

  if (addressInput) {
    addressInput.oninput = parseAddressCallback;
    if (addressInput.value.length === 0 && addressInputvalue.length > 0) {
      addressInput.value = addressInputvalue;
    }
  }
  const parsedAmountMessage: string = "0.00";
  let parsedAddressMessage: MiniHtmlString | string = addressInputvalue.length
    ? html`<div style="user-select: none;">invalid address</div>`
    : "";
  if (parsedAddress && "address" in parsedAddress) {
    parsedAddressMessage = html`<div>
      <div style="user-select: none;">
        destination address (${parsedAddress.network}):</div>
        <div class="parsed-address">${parsedAddress.address}</div>
        <style>
          .parsed-address {
            width: 245px;
            word-wrap: break-word;
            display: inline-block;
            margin-top: 8px;
            color: white;
          }
        </style>
      </div>
    </div>`;
  }

  return html`<div>
    <div class="input-block">
      <input
        type="text"
        id="amountInput"
        name="amountInput"
        class="send-input-element"
        placeholder="Enter amount"
      />
      <div>
        <span style="user-select: none;"> selected amount: </span>
        <span style="color:white">${parsedAmountMessage}</span>
      </div>
    </div>
    <div class="input-block">
      <style>
        .input-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .send-input-element {
          color: white;
          background: #333;
          margin-right: 12px;
          margin-top: 12px;
          font-size: 16px;
          padding: 2px;
        }
        .send-input-element:focus {
          outline: none;
          border: 2px solid #007bff;
          box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
        }
        .send-input-element::selection {
          background: #007bff;
        }
      </style>

      <input
        type="text"
        id="addressInput"
        name="addressInput"
        class="send-input-element"
        placeholder="Enter address"
      />
      <div class="parsed-address-message">${parsedAddressMessage}</div>
    </div>
  </div>`;
}
export function sendPlate() {
  const sendButtonClass = walletUnlocked() ? "red-dot" : "grey-dot";

  return html`<div class="plate">
    <style>
      .plate {
        display: grid;
        grid-template-rows: 1fr 80px;
        height: 100%;
      }
      .actions {
        display: grid;
        grid-template-columns: 140px 1fr 140px;
        margin-left: 8px;
      }
      .send-button-content {
        margin-left: 14px;
      }
    </style>
    ${tacticleContentPlate(sendPlateContent(), leftUpper)}
    <div class="actions">
      ${actionButton(
        "send-action",
        html`<span class="send-button-content">
          ${sendButtonDotStyles}<span class="${sendButtonClass}"></span> SEND
        </span>`,
        connectedToNode() && walletUnlocked(),
      )}
      <div></div>
      ${actionButton("reset-send", "RESET")}
    </div>
  </div>`;
}
