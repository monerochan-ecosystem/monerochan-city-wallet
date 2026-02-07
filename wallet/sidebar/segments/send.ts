import {
  parseAddress,
  type ParseAddressError,
  type ParsedAddress,
} from "@spirobel/monero-wallet-api";
import { html } from "../../../mininext/mininext";
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
  const parsedAddressMessage = addressInputvalue.length
    ? parsedAddress?.address
      ? html`<div>
          parsed valid ${parsedAddress.network} address:
          <div class="parsed-address">${parsedAddress.address}</div>
          <style>
            .parsed-address {
              width: 245px;
              word-wrap: break-word;
              display: inline-block;
              margin-bottom: 20px;
            }
          </style>
        </div>`
      : "invalid address"
    : "";
  return html`<div class="address-input">
    <style>
      .address-input {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      #addressInput {
        color: white;
        background: #333;
        margin-right: 12px;
        margin-top: 12px;
        font-size: 16px;
        padding: 2px;
      }
      #addressInput:focus {
        outline: none;
        border: 2px solid #007bff;
        box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
      }
      #addressInput::selection {
        background: #007bff;
      }
    </style>

    <input
      type="text"
      id="addressInput"
      name="addressInput"
      placeholder="Enter address"
    />
    <div class="parsed-address-message">${parsedAddressMessage}</div>
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
