import {
  convertBigIntAmount,
  truncateDecimalString,
  type ParsedMoneroToolInvocation,
} from "@spirobel/monero-wallet-api";
import { flatten, html, type MiniHtmlString } from "../../../mininext/mininext";
import { router } from "../router";
import { rightLower, tactileContentPlate } from "../ui/content";
import { allWallets } from "./walletRoute";
import { latestToolInvocations } from "../../tools/toolInvocations";

export function walletsPlate() {
  const activeToolInvocations = latestToolInvocations();
  const shareWalletToolInvocation = activeToolInvocations["002"];

  function shareWalletToolInfo(t?: ParsedMoneroToolInvocation) {
    if (!t || t.tool.tool_id !== "002") return "";

    const walletSlot = t.tool.payload.wallet_slot;

    return html`<div>
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
          margin-top: 12px;
        }
        .context-href {
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
          color: greenyellow;
        }
        .invalid {
          color: #e74c3c;
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
        .tool-actions {
          display: flex;
          gap: 8px;
          margin-top: 8px;
          margin-bottom: 4px;
        }
        .tool-action {
          box-shadow:
            inset 0 4px 12px rgba(0, 0, 0, 0.45),
            0 5px 8px rgba(0, 0, 0, 0.4);
          margin-left: 12px;
          margin-top: 4px;
          font-size: 14px;
          margin-bottom: 12px;
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          padding: 2px 4px;
        }
        .tool-action:hover {
          color: white;
        }
        .tool-action-accept {
          color: #00ff00;
        }
        .tool-action-dismiss {
          color: #ff4444;
        }
      </style>
      <div class="tool-info">
        <span class="tool-label">view-only wallet share</span>
        <div class="tool-row">
          <span class="tool-context">context:</span>
          <span class="tool-value">${t.context_domain}</span>
        </div>
        <a
          class="context-href grey-link"
          href=${t.context_href}
          target="_blank"
        >
          ${t.context_href}
        </a>
        <div class="tool-row">
          <span class="tool-context">wallet slot:</span>
          <span class="tool-value">${walletSlot}</span>
        </div>
        <div class="tool-row">
          <span class="tool-context">domain:</span>
          <span class="tool-value">${t.context_domain}</span>
        </div>
        <div class="tool-row">
          <span class="tool-context">clicked:</span>
          <span class="tool-value">${formatTime(t.timestamp)}</span>
        </div>
        <div class="tool-actions">
          <span class="tool-action" id="acceptShareWallet">ACCEPT</span>
          <span class="tool-action" id="dismissShareWallet">DISMISS</span>
        </div>
      </div>
    </div>`;
  }

  const toolInfoSnippet = shareWalletToolInfo(shareWalletToolInvocation?.tool);

  const walletsList: () => MiniHtmlString = () => {
    const wl = allWallets().map((wallet) => {
      const colorclass =
        wallet.amount || 0n > 0 ? "amount-positive" : "amount-zero";
      const amount = convertBigIntAmount(wallet.amount || 0n);
      const amountTrun = truncateDecimalString(amount, 3);
      return html`<div class="wallet-route">
        <a class="wallet" href=${router.link(wallet.wallet_route || "")}>
          ${wallet.wallet_route || '""'}
        </a>
        <div class="amount ${colorclass}">${amountTrun}</div>
      </div>`;
    }) || [html`<div class="wallet">no wallets</div>`];
    return flatten(wl);
  };

  return tactileContentPlate(
    html`<div>
      <style>
        .wallet {
          box-sizing: border-box;
          color: rgb(0, 0, 238);
          cursor: pointer;
          display: inline;
          font-family: sans-serif;
          font-size: 16px;
          font-weight: 700;
        }
        .wallet-route {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 28px;
          place-items: baseline;
        }
        .amount-positive {
          color: #ff4444;
        }
        .amount-zero {
          color: white;
        }
      </style>
      ${toolInfoSnippet} ${walletsList()}
    </div>`,
    rightLower,
    "top",
    "468px",
  );
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
