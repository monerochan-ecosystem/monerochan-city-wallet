import { flatten, html } from "../../../mininext/mininext";
import { rightUpper, tactileContentPlate } from "../ui/content";
import { currentlySelectedWallet } from "./walletRoute";
import {
  truncateDecimalString,
  convertBigIntAmount,
} from "@spirobel/monero-wallet-api";
function transactionsList() {
  const txs = currentlySelectedWallet()
    ?.transactions.toReversed()
    .map((tx) => {
      const date = new Date(tx.outputs[0]?.block_timestamp! * 1000);
      return html`<div class="transaction">
        <div></div>
        <div class="amount">
          ${truncateDecimalString(convertBigIntAmount(tx.amount))}
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
        <div class="details">show details</div>
      </div>`;
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
            grid-template-columns: 1fr 60px 124px 60px;
            font-weight: 700;
            font-size: 16px;
            gap: 17px;
          }
          .timestamp {
          }
          .amount {
            color: rgba(255 68 68 / 0.5);
          }
          .details {
            color: rgb(0, 0, 238);
            cursor: pointer;
            font-family: sans-serif;
            font-weight: 700;
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
