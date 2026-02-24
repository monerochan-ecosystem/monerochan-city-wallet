import { flatten, html } from "../../../mininext/mininext";
import { rightUpper, tactileContentPlate } from "../ui/content";
import { currentlySelectedWallet } from "./walletRoute";
import {
  truncateDecimalString,
  convertBigIntAmount,
} from "@spirobel/monero-wallet-api";
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
            console.log("hiiiii", openDetails);
          }
        };
      }
      setOpenDetails(tx_hash);
      return html`<div class="tx-container">
        <div class="transaction">
          <div></div>
          <div>
            <span class="sign">+</span>
            <span class="amount">
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
          </div>
          <div class="details" id="${tx.tx_hash}">
            ${openDetails[tx.tx_hash] ? "hide" : "show"} details
          </div>
        </div>
        <div class="tx-details" id="${tx.tx_hash}-details">hide details</div>
      </div> `;
    });
  if (!txs) return html`<div>no transactions found yet</div>`;

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
