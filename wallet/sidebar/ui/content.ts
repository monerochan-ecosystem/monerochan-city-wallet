import { html, type MiniValue } from "../../../mininext/mininext";
import { connectionPlate } from "../segments/connection";
import { receivePlate } from "../segments/receive";
import { lowerButtonIds } from "../segments/walletLower";
import { actionButton } from "./buttons";
//                        LU RU RL LL / LU RU RL LL
export const leftUpper = "25px 66px 25px 25px / 21px 78px 31px 31px;";
export const middleUpper = "25px 25px 25px 25px / 21px 21px 31px 31px;";
export const rightUpper = "66px 25px 25px 25px / 78px 21px 31px 31px;";
export const rightLower = "25px 25px 25px 66px / 21px 21px 31px 78px;";
export const leftLower = "25px 25px 66px 25px / 21px 21px 78px 31px;";

export const tacticleContentPlate = (
  content: MiniValue,
  border_radius: string,
  to: "top" | "bottom" = "bottom",
  inner_distract_height: string = "451px",
) => {
  return html`<div class="content-plate">
    <div class="content-plate-inner">${content}</div>
    <style>
      .content-plate-inner {
        max-height: calc(100vh - ${inner_distract_height});

        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #888 #333;
      }
      .content-plate {
        border-radius: ${border_radius};
        margin-left: 7px;
        margin-right: 7px;
        margin-top: 15px;
        margin-bottom: 20px;
        color: rgba(255, 255, 255, 0.3);
        background-color: #666;
        background-image: linear-gradient(
          to ${to},
          transparent 0px 2px,
          rgba(0, 0, 0, 0.5) 2px 5px,
          transparent 5px 7px,
          rgba(0, 0, 0, 0.5) 7px 10px,
          rgba(0, 0, 0, 0.14) 10px 16px
        );
        outline: 2px solid rgba(102, 102, 102, 0.5);

        padding: 18px 12px 12px;
        box-sizing: border-box;
        font-size: 12px;
        font-weight: bold;
        box-shadow:
          inset 0 4px 12px rgba(0, 0, 0, 0.45),
          0 15px 25px rgba(0, 0, 0, 0.4);
      }
    </style>
  </div>`;
};

export const plate = () => {
  let plate = html`<div></div>`;
  if (!window.activeWalletPlate) return plate;
  if (window.activeWalletPlate === lowerButtonIds.send) {
    //return tacticleContentPlate(html`<div>SEND</div>`, leftUpper);
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
      </style>
      ${tacticleContentPlate(html`<div>SEND</div>`, leftUpper)}
      <div class="actions">
        ${actionButton("send-action", "SEND")}
        <div></div>
        ${actionButton("reset-send", "RESET")}
      </div>
    </div>`;
  }
  if (window.activeWalletPlate === lowerButtonIds.receive) {
    return receivePlate();
  }
  if (window.activeWalletPlate === lowerButtonIds.history) {
    return tacticleContentPlate(html`<div>HISTORY</div>`, rightUpper);
  }
  if (window.activeWalletPlate === lowerButtonIds.connection) {
    return connectionPlate();
  }
  if (window.activeWalletPlate === lowerButtonIds.wallets) {
    return tacticleContentPlate(html`<div>WALLETS</div>`, rightLower, "top");
  }
  return plate;
};
