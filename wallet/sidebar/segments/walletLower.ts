import { html } from "../../../mininext/mininext";
import { addActive, tactileSwitch } from "../ui/buttons";
import { removeActive } from "../ui/buttons";
import { plate } from "../ui/content";

export const walletLower = () => {
  return html` <div class="lower">
    <style>
      .lower {
        display: grid;
        grid-template-rows: 40px 1fr 40px;
        height: 100%;
      }
    </style>
    ${lowerTopMenu()} ${plate()} ${lowerBottomMenu()}
  </div>`;
};
export function lowerClickHandler(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement | null;
  const id = (e.currentTarget as HTMLElement | null)?.id as LowerButtonId;
  if (!id || !target) return;
  removeActive(lowerButtonIds);
  addActive(target);
  if (window.activeWalletPlate === id) {
    window.activeWalletPlate = null;
    removeActive(lowerButtonIds);
    return;
  }
  window.activeWalletPlate = id;
}

export type LowerButtonId =
  (typeof lowerButtonIds)[keyof typeof lowerButtonIds];

export const lowerButtonIds = {
  send: "send",
  receive: "receive",
  history: "history",
  wallets: "wallets",
  connection: "connection",
} as const;
export function lowerTopMenu() {
  const historyButton = tactileSwitch(lowerButtonIds.history, "HISTORY");
  const receiveButton = tactileSwitch(lowerButtonIds.receive, "RECEIVE");

  const sendButton = tactileSwitch(
    lowerButtonIds.send,
    html`<span>
      <style>
        .red-dot {
          height: 4px;
          width: 4px;
          margin: 2px;
          background-color: #ff4444;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
          border-radius: 50%;
          display: inline-block;
        }
      </style>
      SEND <span class="red-dot"></span
    ></span>`,
  );
  return html`<div class="top-menu">
    ${sendButton} ${receiveButton}
    <div></div>
    ${historyButton}
    <style>
      .top-menu {
        display: grid;
        grid-template-columns: 80px 80px 1fr 80px;
        justify-content: start;
        gap: 8px;
        margin-left: 8px;
      }
    </style>
  </div> `;
}
export function lowerBottomMenu() {
  const walletsButton = tactileSwitch(lowerButtonIds.wallets, "WALLETS");

  const connectionButton = tactileSwitch(
    lowerButtonIds.connection,
    html`<span>
      <style>
        .green-dot {
          height: 4px;
          width: 4px;
          margin: 2px;
          background-color: #4ade80;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
          border-radius: 50%;
          display: inline-block;
        }
      </style>
      CONNECTION <span class="green-dot"></span
    ></span>`,
  );
  return html`<div class="bottom-menu">
    ${connectionButton}
    <div></div>
    ${walletsButton}
    <style>
      .bottom-menu {
        display: grid;
        grid-template-columns: 140px 1fr 140px;

        margin-left: 8px;
      }
    </style>
  </div> `;
}
