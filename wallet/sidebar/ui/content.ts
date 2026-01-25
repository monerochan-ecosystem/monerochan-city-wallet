import { html, type MiniValue } from "../../../mininext/mininext";
import { lowerButtonIds } from "../segments/walletLower";
import { currentlySelectedWallet } from "../segments/walletRoute";
import { actionButton } from "./buttons";
//                LU RU RL LL / LU RU RL LL
const leftUpper = "25px 66px 25px 25px / 21px 78px 31px 31px;";
const middleUpper = "25px 25px 25px 25px / 21px 21px 31px 31px;";
const rightUpper = "66px 25px 25px 25px / 78px 21px 31px 31px;";
const rightLower = "25px 25px 25px 66px / 21px 21px 31px 78px;";
const leftLower = "25px 25px 66px 25px / 21px 21px 78px 31px;";

export const tacticleContentPlate = (
  content: MiniValue,
  border_radius: string,
  to: "top" | "bottom" = "bottom",
) => {
  return html`<div class="content-plate">
    ${content}<style>
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
    // console.log(currentlySelectedWallet());
    //return tacticleContentPlate(html`<div>RECEIVE</div>`, middleUpper);
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
      ${tacticleContentPlate(html`<div></div>`, middleUpper)}
      <div class="actions">
        ${actionButton("new-address", "NEW ADDRESS")}
        <div></div>
        ${actionButton("copy-address", "COPY")}
      </div>
    </div>`;
  }
  if (window.activeWalletPlate === lowerButtonIds.history) {
    return tacticleContentPlate(html`<div>HISTORY</div>`, rightUpper);
  }
  if (window.activeWalletPlate === lowerButtonIds.connection) {
    return tacticleContentPlate(html`<div>CONNECTION</div>`, leftLower, "top");
  }
  if (window.activeWalletPlate === lowerButtonIds.wallets) {
    return tacticleContentPlate(html`<div>WALLETS</div>`, rightLower, "top");
  }
  return plate;
};
