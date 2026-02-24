import type { FoundTransaction } from "@spirobel/monero-wallet-api/dist/scanning-syncing/scanresult/scanCacheOpened";
import { flatten, html } from "../../../mininext/mininext";
import { rightUpper, tactileContentPlate } from "../ui/content";
import { currentlySelectedWallet } from "./walletRoute";
import {
  truncateDecimalString,
  convertBigIntAmount,
} from "@spirobel/monero-wallet-api";
import type { Pending } from "@spirobel/monero-wallet-api/dist/scanning-syncing/scanresult/scanResult";
const openDetails: Record<string, boolean | undefined> = {};
function setOpenDetails(tx_hash: string) {
  const details = document.getElementById(
    `${tx_hash}-details`,
  ) as HTMLElement | null;
  if (details) {
    if (openDetails[tx_hash]) {
      details.style.display = "block";
    } else {
      details.style.display = "none";
    }
  }
}
function txDetails(tx: FoundTransaction) {
  //console.log(tx.outputs[0]);
  const sub_index = tx.outputs[0]?.subaddress_index;
  const sub_snippet = sub_index
    ? html`<div class="tx-detail">
        <div>subaddress index:</div>
        <div style="color: white;">${sub_index}</div>
      </div>`
    : "";
  const is_miner = tx.outputs[0]?.is_miner_tx;
  const miner_snippet = is_miner
    ? html`<div class="tx-detail">
        <div>is miner tx:</div>
        <div style="color: white;">yes</div>
      </div>`
    : "";
  const is_pending = tx.status.status === "pending";
  const pending_snippet = is_pending
    ? html`<div class="tx-detail">
        <div>unlock height:</div>
        <div style="color: white;">${(tx.status as Pending).unlock_height}</div>
      </div>`
    : "";
  const is_confirmed = tx.status.status === "spendable";
  const confirmed_snippet = is_confirmed
    ? html`<div class="tx-detail">
        <div>confirmed:</div>
        <div style="color: white;">yes</div>
      </div>`
    : "";

  return html`<div>
    <style>
      .tx-detail {
        display: grid;
        grid-template-columns: 50px 158px;
        margin-top: 5px;
        margin-bottom: 4px;
        margin-left: 33px;
        gap: 40px;
      }
      .tx-hash {
        width: 162px;
        word-wrap: break-word;
        display: inline-block;
        color: white;
      }
    </style>
    <div class="tx-detail">
      <div>tx_hash:</div>
      <div class="tx-hash">${tx.tx_hash}</div>
    </div>
    <div class="tx-detail">
      <div>block_height:</div>
      <div>${tx.outputs[0]?.block_height!}</div>
    </div>
    <div class="tx-detail">
      <div>payment_id:</div>
      <div>${tx.outputs[0]?.payment_id!}</div>
    </div>
    ${sub_snippet} ${miner_snippet} ${pending_snippet} ${confirmed_snippet}
  </div>`;
}
function transactionsList() {
  const txs = currentlySelectedWallet()
    ?.transactions.toReversed()
    .map((tx) => {
      const tx_hash = tx.tx_hash;

      const date = new Date(tx.outputs[0]?.block_timestamp! * 1000);
      const showDetailsBtn = document.getElementById(tx_hash);
      if (showDetailsBtn) {
        showDetailsBtn.onclick = () => {
          const details = document.getElementById(
            `${tx_hash}-details`,
          ) as HTMLElement | null;
          if (details) {
            if (openDetails[tx_hash]) {
              details.style.display = "none";
              openDetails[tx_hash] = false;
            } else {
              details.style.display = "block";
              openDetails[tx_hash] = true;
            }
          }
        };
      }
      setOpenDetails(tx_hash);
      const amount_class = tx.status.status === "pending" ? "" : "amount";
      return html`<div class="tx-container">
        <div class="transaction">
          <div></div>
          <div>
            <span class="sign">+</span>
            <span class="${amount_class}">
              ${truncateDecimalString(convertBigIntAmount(tx.amount))}
            </span>
          </div>
          <div class="timestamp">
            ${date.toLocaleString(undefined, {
              year: "2-digit",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
            ${tx.status.status === "pending"
              ? html`<span class="pending">(pending)</span>`
              : ""}
          </div>
          <div class="details" id="${tx.tx_hash}">
            ${openDetails[tx.tx_hash] ? "hide" : "show"} details
          </div>
        </div>
        <div class="tx-details" id="${tx.tx_hash}-details">
          ${openDetails[tx_hash] ? txDetails(tx) : html`<div></div>`}
        </div>
      </div> `;
    });
  if (!txs || txs.length === 0) {
    return html`<div style="user-select: none;margin-left: 148px;">
      no transactions found yet
    </div>`;
  }
  return flatten(txs);
}
export function historyPlate() {
  return tactileContentPlate(
    html`
      <div class="tx-history-container">
        <style>
          .transaction {
            margin-top: 10px;
            margin-right: 5px;
            display: grid;
            grid-template-columns: 1fr 69px 124px 60px;
            font-weight: 700;
            font-size: 16px;
            gap: 12px;
          }
          .timestamp {
          }
          .sign {
            margin-right: 4px;
          }
          .amount {
            color: #ff4444;
          }
          .pending {
            color: #ff4444;
          }
          .details {
            cursor: pointer;
            font-family: sans-serif;
            font-weight: 700;
            user-select: none;
          }
          .details:hover {
            color: white;
          }
        </style>

        ${transactionsList()}
      </div>
    `,
    rightUpper,
    undefined,
    "500px",
  );
}
