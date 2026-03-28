import {
  atomicWrite,
  parseAddress,
  type ParseAddressError,
  type ParsedAddress,
} from "@spirobel/monero-wallet-api";
import { html, type MiniHtmlString } from "../../../mininext/mininext";
import { actionButton } from "../ui/buttons";
import { leftUpper, tactileContentPlate } from "../ui/content";
import { sendButtonDotStyles } from "./walletLower";
import {
  connectedToNode,
  currentlySelectedWallet,
  latestToolInvocations,
} from "./walletRoute";
import { sendSendTransactionEvent } from "../../../background/messagebus";
import type { TxLog } from "@spirobel/monero-wallet-api";

let parsedAmount: bigint | null = null;
let amountInputValue = "";
let justSentTx = false;
export function parseAmountCallback() {
  const amountInput = document.getElementById(
    "amountInput",
  ) as HTMLInputElement | null;
  if (!amountInput) return;
  parsedAmount = convertAmountBigInt(amountInput.value);
  amountInputValue = amountInput.value;
}
export function convertBigIntAmount(amount: bigint): string {
  let display_amount = "";
  // to go from atomic units to display amount,
  // we move from the end to the beginning and insert a dot 12 digits in
  // https://www.getmonero.org/resources/moneropedia/atomic-units.html
  let afterDot = amount.toString().padStart(12, "0").slice(-12);
  let beforeDot = amount.toString().padStart(12, "0").slice(0, -12);
  if (!beforeDot || beforeDot.startsWith("0")) beforeDot = "0";
  display_amount = beforeDot + ".";
  display_amount += afterDot;
  // remove trailing zeros
  while (display_amount[display_amount.length - 1] === "0") {
    display_amount = display_amount.slice(0, -1);
  }
  const last_char = display_amount.at(-1);
  if (last_char === ".") display_amount = display_amount.slice(0, -1);
  // trailing . or , should be removed
  return display_amount;
}
export function convertAmountBigInt(amount_double: string): bigint {
  // accept both dot and comma
  amount_double = amount_double.replaceAll(",", ".");
  const last_char = amount_double.at(-1);
  if (last_char === ".") amount_double = amount_double.slice(0, -1);
  // trailing . or , should be removed
  const beforeDot = amount_double.split(".")[0];
  let afterDot = amount_double.split(".")[1];
  if (!afterDot) afterDot = "000000000000";
  afterDot = afterDot?.padEnd(12, "0").slice(0, 12);
  let bigIntString = afterDot;
  if (beforeDot?.length && !beforeDot.startsWith("0"))
    bigIntString = beforeDot + afterDot;

  let amount = BigInt("0");
  try {
    amount = BigInt(bigIntString);
  } catch (error) {
    // in case the input is not a valid number,
    // the amount stays zero. Keeps the UI easy for copy and paste
  }
  return amount;
}
export function walletUnlocked(): boolean {
  if (window.unlocked === undefined) return false;
  return window.unlocked;
}
let addressInputValue = "";
let parsedAddress: ParseAddressError | ParsedAddress | null = null;
function sendButtonActive() {
  const parsedAmountBiggerThanAvailable =
    (parsedAmount || 0n) > (currentlySelectedWallet()?.amount || 1n);
  return !!(
    !parsedAmountBiggerThanAvailable &&
    connectedToNode() &&
    walletUnlocked() &&
    parsedAddress &&
    "address" in parsedAddress &&
    parsedAmount &&
    !justSentTx
  );
}
function sendCallback() {
  if (
    sendButtonActive() &&
    parsedAddress &&
    "address" in parsedAddress &&
    parsedAmount
  ) {
    const wallet_to_send_from_pa = currentlySelectedWallet()?.primary_address;
    if (!wallet_to_send_from_pa)
      throw new Error("wallet_to_send_from_pa is undefined");

    justSentTx = true;
    setTimeout(() => {
      justSentTx = false;
    }, 2000);

    sendSendTransactionEvent(
      parsedAddress.address,
      parsedAmount.toString(),
      wallet_to_send_from_pa,
    );
    resetSendInputs();
  }
}
async function resetCallback() {
  resetSendInputs();
  justSentTx = false;
  const timestamp = Date.now();
  await atomicWrite(
    "last-send-reset.json",
    JSON.stringify({ timestamp }, null, 2),
  );
  lastReset = timestamp;
  readLastTxLog();
}
async function readLastSendReset() {
  const jsonString = await Bun.file("last-send-reset.json")
    .text()
    .catch(() => undefined);
  return jsonString
    ? (JSON.parse(jsonString) as { timestamp: number })
    : undefined;
}

let lastReset: number | null = null;
let last_tx_log: TxLog | null = null;
async function readLastTxLog() {
  if (lastReset === null)
    lastReset = (await readLastSendReset())?.timestamp || 0;
  const fetched_lastlog = currentlySelectedWallet()?.tx_logs.at(-1);
  if (!fetched_lastlog) return;
  if (fetched_lastlog.timestamp > lastReset) {
    last_tx_log = fetched_lastlog;
  } else {
    last_tx_log = null;
  }
  setTXlogStatusMsg();
}
let lastTxLogMessage = "";
let lastTxLogMessageClass = "";
function setTXlogStatusMsg() {
  lastTxLogMessage = "";
  lastTxLogMessageClass = "";
  if (last_tx_log && last_tx_log.sendResult?.status !== "OK") {
    lastTxLogMessage =
      "failed to send transaction " + formatTime(last_tx_log.timestamp);
    lastTxLogMessageClass = "txlog-error";
  }
  if (last_tx_log && last_tx_log.sendResult?.status === "OK") {
    lastTxLogMessage =
      "successfully sent transaction " + formatTime(last_tx_log.timestamp);
    lastTxLogMessageClass = "txlog-success";
  }
}
function resetSendInputs() {
  const amountInput = document.getElementById(
    "amountInput",
  ) as HTMLInputElement | null;

  if (amountInput) {
    amountInput.value = "";
    amountInputValue = "";
    parsedAmount = null;
  }
  const addressInput = document.getElementById(
    "addressInput",
  ) as HTMLInputElement | null;

  if (addressInput) {
    addressInput.value = "";
    addressInputValue = "";
    parsedAddress = null;
  }
}
export async function parseAddressCallback() {
  const addressInput = document.getElementById(
    "addressInput",
  ) as HTMLInputElement | null;
  if (!addressInput) return;
  parsedAddress = await parseAddress(addressInput.value.trim());
  addressInputValue = addressInput.value;
}

export function sendPlateContent() {
  const activeToolInvocations = latestToolInvocations();
  const sendToolInvocation = activeToolInvocations["001"];
  const toolPayload = sendToolInvocation?.tool.tool.payload;
  const toolAmount =
    toolPayload && "amount" in toolPayload
      ? convertAmountBigInt(toolPayload.amount)
      : null;
  const amountInput = document.getElementById(
    "amountInput",
  ) as HTMLInputElement | null;

  if (amountInput) {
    amountInput.oninput = parseAmountCallback;
    if (amountInput.value.length === 0 && amountInputValue.length > 0) {
      amountInput.value = amountInputValue;
      parseAmountCallback();
    }
    if (toolAmount) {
      amountInputValue = convertBigIntAmount(toolAmount);
      amountInput.value = amountInputValue;
      parseAmountCallback();
      amountInput.disabled = true;
    }
  }
  const addressInput = document.getElementById(
    "addressInput",
  ) as HTMLInputElement | null;

  if (addressInput) {
    addressInput.oninput = parseAddressCallback;
    if (addressInput.value.length === 0 && addressInputValue.length > 0) {
      addressInput.value = addressInputValue;
    }
    if (toolPayload && "address" in toolPayload) {
      addressInputValue = toolPayload.address;
      addressInput.value = addressInputValue;
      addressInput.disabled = true;
    }
  }
  const parsedAmountMessage: string = parsedAmount
    ? convertBigIntAmount(parsedAmount)
    : "0.00";
  const parsedAmountBiggerThanAvailable =
    (parsedAmount || 0n) > (currentlySelectedWallet()?.amount || 1n)
      ? "exceeds unlocked funds"
      : "";
  let parsedAddressMessage: MiniHtmlString | string = addressInputValue.length
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
  const sendBtn = document.getElementById("send-action") as HTMLButtonElement;
  if (sendBtn) {
    sendBtn.onclick = sendCallback;
  }
  const resetBtn = document.getElementById("reset-send") as HTMLButtonElement;
  if (resetBtn) {
    resetBtn.onclick = resetCallback;
  }

  return html`<div class="send-plate-container">
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
        <span style="user-select: none; color: #e74c3c;"
          >${parsedAmountBiggerThanAvailable}</span
        >
      </div>
    </div>
    <div class="input-block">
      <style>
        .send-plate-container {
          height: 100%;
          display: grid;
          grid-template-rows: 56px 1fr 40px;
        }
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
    ${!connectedToNode()
      ? html`
          <div>
            <style>
              .connection-warning {
                color: #e74c3c;
                margin-top: 8px;
                margin-bottom: 8px;
                user-select: none;
              }
            </style>
            <span class="connection-warning">no connection to node</span><br />
            <span class="connection-hint">
              select a different node in connection menu <br />
            </span>
          </div>
        `
      : ""}
  </div>`;
}
export function formatTime(timestamp: number, block_timestamp = false) {
  const date = block_timestamp
    ? new Date(timestamp * 1000)
    : new Date(timestamp);
  return date.toLocaleString(undefined, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
export function sendPlate() {
  readLastTxLog();
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
        grid-template-areas:
          "action action action"
          "result result result";
        margin-left: 8px;
      }
      .send-button-content {
        margin-left: 14px;
      }
      .txlog-success {
        grid-area: result;
        margin-left: 39px;
        color: #00ff00;
      }
      .txlog-error {
        grid-area: result;
        margin-left: 39px;
        color: #ff0000;
      }
    </style>
    ${tactileContentPlate(sendPlateContent(), leftUpper, undefined, "425px")}
    <div class="actions">
      ${actionButton(
        "send-action",
        html`<span class="send-button-content">
          ${sendButtonDotStyles}<span class="${sendButtonClass}"></span> SEND
        </span>`,
        sendButtonActive(),
      )}
      <div></div>
      ${actionButton("reset-send", "RESET")}
      <div class="${lastTxLogMessageClass}">${lastTxLogMessage}</div>
    </div>
  </div>`;
}
