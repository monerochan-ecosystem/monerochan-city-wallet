import { html } from "../../../mininext/mininext";
import { actionButton } from "../ui/buttons";
import { leftUpper, tacticleContentPlate } from "../ui/content";
import { sendButtonDotStyles } from "./walletLower";

export function sendPossible() {
  return window.unlocked;
}
export function sendPlate() {
  const sendButtonClass = sendPossible() ? "red-dot" : "grey-dot";

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
    ${tacticleContentPlate(html`<div>SEND</div>`, leftUpper)}
    <div class="actions">
      ${actionButton(
        "send-action",
        html`<span class="send-button-content">
          ${sendButtonDotStyles}<span class="${sendButtonClass}"></span> SEND
        </span>`,
      )}
      <div></div>
      ${actionButton("reset-send", "RESET")}
    </div>
  </div>`;
}
