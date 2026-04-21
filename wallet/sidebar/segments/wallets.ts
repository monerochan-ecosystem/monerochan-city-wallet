import {
  convertBigIntAmount,
  truncateDecimalString,
  type ParsedMoneroToolInvocation,
  writeWalletToScanSettings,
  writeWalletSecretsToDotEnv,
  writeScanSettingsFileDefaultLocation,
} from "@spirobel/monero-wallet-api";
import { flatten, html, type MiniHtmlString } from "../../../mininext/mininext";
import { router } from "../router";
import { rightLower, tactileContentPlate } from "../ui/content";
import {
  allWallets,
  dismissToolInvocation,
  navigateToFirstWallet,
} from "./walletRoute";
import {
  latestToolInvocations,
  type ToolInvocation,
} from "../../tools/toolInvocations";
import {
  getWalletSecret,
  walletRouteFromString,
  walletRouteToString,
  type WalletRoute,
} from "@spirobel/seedphrase";
import { initWallets } from "../init";
import { sendWalletSetupFinishedEvent } from "../../../background/messagebus";
import { textInput } from "../ui/input";
let shareWalletToolInvocation: ToolInvocation | null | undefined = null;
let openAdvancedOptions = false;
let restoreRouteMessage: MiniHtmlString = html`<div></div>`;
let removeRouteMessage: MiniHtmlString = html`<div></div>`;

function openWalletsAdvancedOptionsHandler() {
  openAdvancedOptions = !openAdvancedOptions;
  restoreRouteMessage = html`<div></div>`;
  removeRouteMessage = html`<div></div>`;
}

async function removeWalletRouteHandler() {
  const removeInput = document.getElementById(
    "removeWalletRoute",
  ) as HTMLInputElement | null;
  if (!removeInput) return;
  removeInput.value = removeInput.value.trim();
  const res = walletRouteFromString(removeInput.value);
  if (res.ok) {
    await writeScanSettingsFileDefaultLocation({
      async writeCallback(settings) {
        const toRemove = removeInput.value;
        // Find matching wallet first so we can delete its files
        const matching = settings.wallets.find(
          (w) => w.wallet_route === toRemove,
        );
        if (matching) {
          await Bun.file(`${matching.primary_address}_cache.json`).delete();
          await Bun.file(`${matching.primary_address}_stats.json`).delete();
        }
        settings.wallets = settings.wallets.filter(
          (w) => w.wallet_route !== toRemove,
        );
      },
    });
    await initWallets();
    sendWalletSetupFinishedEvent();
    removeInput.value = "";
    navigateToFirstWallet();
  } else {
    removeRouteMessage = html`<div class="options-message-negative">
      Invalid wallet route, ${res.error}
    </div>`;
    return;
  }
}

async function restoreWalletRouteHandler() {
  const restoreInput = document.getElementById(
    "restoreWalletRoute",
  ) as HTMLInputElement | null;
  if (!restoreInput) return;
  restoreInput.value = restoreInput.value.trim();
  const res = walletRouteFromString(restoreInput.value);
  if (res.ok) {
    await addWalletFromRoute(res.route);
    restoreInput.value = "";
    return;
  } else {
    restoreRouteMessage = html`<div class="options-message-negative">
      Invalid wallet route, ${res.error}
    </div>`;
    return;
  }
}

export function walletsPlate() {
  const activeToolInvocations = latestToolInvocations();
  shareWalletToolInvocation = activeToolInvocations["002"];

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

  if (shareWalletToolInvocation?.tool.invocation_id) {
    const dismissBtn = document.getElementById("dismissShareWallet");
    if (dismissBtn) {
      dismissBtn.onclick = dismissShareViewWalletTool;
    }
    const acceptBtn = document.getElementById("acceptShareWallet");
    if (acceptBtn) {
      acceptBtn.onclick = acceptShareViewWalletTool;
    }
  }

  const openAdvancedOptionsButton = document.getElementById(
    "openWalletsAdvancedOptionsButton",
  ) as HTMLElement | null;
  if (openAdvancedOptionsButton) {
    openAdvancedOptionsButton.onclick = openWalletsAdvancedOptionsHandler;
  }

  const removeBtn = document.getElementById("removeWalletRouteBtn");
  if (removeBtn) {
    removeBtn.onclick = removeWalletRouteHandler;
  }

  const restoreBtn = document.getElementById("restoreWalletRouteBtn");
  if (restoreBtn) {
    restoreBtn.onclick = restoreWalletRouteHandler;
  }

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
        #openWalletsAdvancedOptionsButton {
          margin-top: 12px;
          text-decoration: underline;
          font-family: serif;
          font-size: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          ${openAdvancedOptions ? "color: #551a8b;" : ""}
        }
        #openWalletsAdvancedOptionsButton:hover {
          ${openAdvancedOptions
          ? "color: rgba(255, 255, 255, 0.3)"
          : "color: white;"}
        }
        .dev-message-positive {
          color: #00ff00;
          font-size: 12px;
          margin-top: 4px;
        }
        .dev-message-negative {
          color: #ff0000;
          font-size: 12px;
          margin-top: 4px;
        }
        .wallet-options-input {
          margin-bottom: 8px;

        }

        .wallet-options-buttons {
          display: grid;
          grid-template-columns: 198px 78px;
          margin-top: 8px;
          margin-bottom: 12px;
        }
        .wallet-options-button {
        box-shadow:
          inset 0 4px 12px rgba(0, 0, 0, 0.45),
          0 5px 8px rgba(0, 0, 0, 0.4);
        margin-top: 4px;
        font-size: 14px;
        margin-bottom: 12px;
        cursor: pointer;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        padding: 2px 4px;
        user-select: none;
        justify-self: end;
        }
        .wallet-options-button:hover {
          color: white;
        }
      </style>
      ${toolInfoSnippet} ${walletsList()}
      <div style="margin-top: 15px; user-select: none;">
        <span id="openWalletsAdvancedOptionsButton">advanced options</span>
      </div>
      <div id="walletsAdvancedOptions">
        ${openAdvancedOptions
          ? html`<div
              style="margin-left: 10px; margin-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.2); padding-top: 12px;"
            >
              <div
                style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-bottom: 8px;"
              >
                Remove Wallet Route
              </div>
              <div class="wallet-options-input">
                ${textInput(
                  "removeWalletRoute",
                  "Enter wallet route to remove",
                )}
              </div>
              <div class="wallet-options-buttons">
                ${removeRouteMessage}

                <span class="wallet-options-button" id="removeWalletRouteBtn"
                  >REMOVE</span
                >
              </div>

              <div
                style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-bottom: 8px; margin-top: 12px;"
              >
                Restore Wallet Route
              </div>
              <div class="wallet-options-input">
                ${textInput(
                  "restoreWalletRoute",
                  "Enter wallet route to restore",
                )}
                <div class="wallet-options-buttons">
                  <span>${restoreRouteMessage}</span>
                  <span
                    class="wallet-options-button restore"
                    id="restoreWalletRouteBtn"
                    >RESTORE</span
                  >
                </div>
              </div>
            </div>`
          : ""}
      </div>
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

async function dismissShareViewWalletTool() {
  if (shareWalletToolInvocation?.tool.invocation_id)
    return await dismissToolInvocation(
      shareWalletToolInvocation.tool.invocation_id!,
    );
}

async function acceptShareViewWalletTool() {
  if (!shareWalletToolInvocation?.tool.invocation_id) return;
  if ("wallet_slot" in shareWalletToolInvocation.tool.tool.payload === false)
    return;
  const wallet_slot = String(
    shareWalletToolInvocation.tool.tool.payload["wallet_slot"],
  );

  const t = shareWalletToolInvocation.tool;
  const walletRoute: WalletRoute = {
    identity: "main",
    domain: t.context_domain,
    wallet_type: "single" as const,
    wallet_slot,
  };
  await addWalletFromRoute(walletRoute);

  await dismissToolInvocation(t.invocation_id!);
}

export async function addWalletFromRoute(walletRoute: WalletRoute) {
  const seedphrase = Bun.env["SEEDPHRASE"];
  if (!seedphrase) return;
  const passphrase = Bun.env["PASSPHRASE"];
  const spendkeySecretSeed = getWalletSecret(
    walletRoute,
    seedphrase,
    passphrase,
  );
  let primary_address = await writeWalletSecretsToDotEnv(spendkeySecretSeed);

  await writeWalletToScanSettings({
    primary_address,
    wallet_route: walletRouteToString(walletRoute),
  });

  await initWallets();
  sendWalletSetupFinishedEvent();
}
