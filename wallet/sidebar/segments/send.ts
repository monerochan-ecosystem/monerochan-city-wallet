import {
  atomicWrite,
  convertAmountBigInt,
  convertBigIntAmount,
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
  dismissToolInvocation,
} from "./walletRoute";
import { sendSendTransactionEvent } from "../../../background/messagebus";
import type {
  ParsedMoneroToolInvocation,
  TxLog,
} from "@spirobel/monero-wallet-api";
import { latestToolInvocations } from "../../tools/toolInvocations";

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

export function walletUnlocked(): boolean {
  if (window.unlocked === undefined) return false;
  return window.unlocked;
}
let addressInputValue = "";
let parsedAddress: ParseAddressError | ParsedAddress | null = null;
function sendButtonActive() {
  const activeToolInvocations = latestToolInvocations();
  const sendToolInvocation = activeToolInvocations["001"];
  const parsedAmountBiggerThanAvailable =
    (parsedAmount || 0n) > (currentlySelectedWallet()?.amount || 1n);
  return !!(
    !parsedAmountBiggerThanAvailable &&
    connectedToNode() &&
    walletUnlocked() &&
    parsedAddress &&
    "address" in parsedAddress &&
    parsedAmount &&
    !justSentTx &&
    sendToolInvocation?.tool.valid !== "invalid"
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
  await resetSendInputs();
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
async function resetSendInputs() {
  const activeToolInvocations = latestToolInvocations();
  const sendToolInvocation = activeToolInvocations["001"];
  const sendToolInvoId = sendToolInvocation?.tool.invocation_id;

  if (sendToolInvoId) await dismissToolInvocation(sendToolInvoId);
  const amountInput = document.getElementById(
    "amountInput",
  ) as HTMLInputElement | null;

  if (amountInput) {
    amountInput.value = "";
    amountInputValue = "";
    parsedAmount = null;
    amountInput.disabled = false;
  }
  const addressInput = document.getElementById(
    "addressInput",
  ) as HTMLInputElement | null;

  if (addressInput) {
    addressInput.value = "";
    addressInputValue = "";
    parsedAddress = null;
    addressInput.disabled = false;
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
export function validityMessage(t?: ParsedMoneroToolInvocation) {
  if (!t) return "";

  if (t.valid === "invalid")
    return html`<div class="invalidity-message">
      <style>
        .invalidity-warning {
          color: #e74c3c;
          margin-top: 8px;
          margin-bottom: 8px;
          user-select: none;
        }
      </style>
      <span class="invalidity-warning ">the payment link is invalid</span><br />
      <span class="invalidity-hint">
        the payment destination server responded that it does not recognize this
        address <br />
      </span>
    </div>`;
  if (t.valid === "unverified")
    return html`<div class="unverified-message">
      <span
        >this is an open destination payment link, make sure you got it from a
        trusted source</span
      >
    </div>`;
  return "";
}
export function toolInfo(t?: ParsedMoneroToolInvocation) {
  if (!t) return "";
  const destinationLink = t[t.found_in];

  return html`<div class="tool-info">
    <style>
      .tool-info {
        display: flex;
        flex-direction: column;
        box-shadow:
          inset 0 4px 12px rgba(0, 0, 0, 0.45),
          0 5px 8px rgba(0, 0, 0, 0.4);
        margin-top: 4px;
        font-size: 14px;
        margin-bottom: 12px;
        cursor: pointer;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        padding: 8px 7px;
        margin-right: 12px;
        margin-left: 17px;
        margin-top: -5px;
      }
      .context-href {
        width: 236px;
        word-wrap: break-word;
      }
      .destination-link {
        width: 236px;
        word-wrap: break-word;
      }
      .grey-link {
        margin-top: 3px;
        text-decoration: underline;
        font-size: 10px;
        margin-bottom: 12px;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.3);
      }
      .grey-link:hover {
        color: white;
      }
      .valid {
        color: greenyellow !important;
      }
      .invalid {
        color: #e74c3c !important;
      }
      .unverified {
        color: rgba(255, 255, 255, 0.3);
      }
      .tool-context {
        color: rgba(255, 255, 255, 0.7);
      }
      .tool-label {
        color: rgba(255, 255, 255, 0.5);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .tool-value {
        color: white;
        font-weight: 600;
      }
      .tool-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }
    </style>
    <span class="tool-label">payment link</span>
    <div class="tool-row">
      <span class="tool-context">context:</span>
      <span class="tool-value">${t.context_domain}</span>
    </div>
    <a class="context-href grey-link" href=${t.context_href} target="_blank">
      ${t.context_href}
    </a>
    <div class="tool-row">
      <span class="tool-context">destination:</span>
      <span class="tool-value ${t.valid}">${t.destination_domain}</span>
    </div>
    <a
      class="destination-link grey-link"
      style="cursor: not-allowed"
      href=${destinationLink}
    >
      ${destinationLink}
    </a>
    <div class="tool-row">
      <span class="tool-context">clicked:</span>
      <span class="tool-value">${formatTime(t.timestamp)}</span>
    </div>
  </div> `;
}

export function sendPlateContent() {
  const activeToolInvocations = latestToolInvocations();
  const sendToolInvocation = activeToolInvocations["001"];
  const toolPayload = sendToolInvocation?.tool.tool.payload;
  const toolAmount =
    toolPayload && "amount" in toolPayload
      ? convertAmountBigInt(toolPayload.amount)
      : null;

  const toolInfoSnippet = toolInfo(sendToolInvocation?.tool);
  const validitySnippet = validityMessage(sendToolInvocation?.tool);
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
      parseAddressCallback();
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
    if (toolInfoSnippet !== "") {
      parsedAddressMessage = html`<div style="display: none;"></div>`;
    } else {
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
      ${toolInfoSnippet} ${validitySnippet}
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
