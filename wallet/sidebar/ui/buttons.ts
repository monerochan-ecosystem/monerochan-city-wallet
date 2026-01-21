import { html, type MiniHtmlString } from "../../../mininext/mininext";

export function tactileSwitch(id: string, buttonText: string | MiniHtmlString) {
  return html`<div id="${id}" class="tactile-switch">
    ${buttonText}<style>
      .tactile-switch {
        border-radius: 3% 10% 6% 16% / 18% 72% 21% 74%;
        height: 30px;
        min-width: 75px;
        margin-right: 7px;
        color: rgba(255, 255, 255, 0.3);
        background-color: #666;
        background-image: linear-gradient(
          to bottom,
          transparent 0px 2px,
          rgba(0, 0, 0, 0.5) 2px 5px,
          transparent 5px 7px,
          rgba(0, 0, 0, 0.5) 7px 10px,
          rgba(0, 0, 0, 0.14) 10px 16px
        );
        outline: 2px solid rgba(102, 102, 102, 0.5);
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        padding: 0px 4px;
        box-sizing: border-box;
        font-size: 12px;
        font-weight: bold;
        box-shadow:
          inset 0 4px 12px rgba(0, 0, 0, 0.45),
          0 15px 25px rgba(0, 0, 0, 0.4);
        cursor: pointer;
        user-select: none;
      }
      .tactile-switch:hover {
        color: rgba(255, 255, 255, 0.7);
      }
    </style>
  </div>`;
}
export const buttonIds = {
  send: "send",
  receive: "receive",
  history: "history",
  wallets: "wallets",
  connection: "connection",
} as const;
export function lowerTopMenu() {
  const historyButton = tactileSwitch(buttonIds.history, "HISTORY");
  const receiveButton = tactileSwitch(buttonIds.receive, "RECEIVE");

  const sendButton = tactileSwitch(
    buttonIds.send,
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
  const walletsButton = tactileSwitch(buttonIds.wallets, "WALLETS");

  const connectionButton = tactileSwitch(
    buttonIds.connection,
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
        justify-content: start;
        gap: 8px;
        margin-left: 8px;
      }
    </style>
  </div> `;
}
