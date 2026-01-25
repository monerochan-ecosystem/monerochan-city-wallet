import { html, type MiniValue } from "../../../mininext/mininext";
import { lowerButtonIds } from "../segments/walletLower";
//                LU RU RL LL / LU RU RL LL
const leftUpper = "8% 21% 8% 8% / 4% 15% 6% 6%;";
const middleUpper = "8% 8% 8% 8% / 4% 4% 6% 6%;";
const rightUpper = "21% 8% 8% 8% / 15% 4% 6% 6%;";
const rightLower = "8% 8% 8% 21% / 4% 4% 6% 15%;";
const leftLower = "8% 8% 21% 8% / 4% 4% 15% 6%;";

export const tacticleContentPlate = (
  content: MiniValue,
  border_radius: string,
  to: "top" | "bottom" = "bottom",
) => {
  return html`<div class="content-plate">
    ${content}<style>
      .content-plate {
        border-radius: ${border_radius};
        width: 320px;
        margin-left: 7px;
        margin-top: 15px;
        margin-bottom: 40px;
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
export const contentPlate = () => {
  if (!window.activeWalletPlate) return html`<div></div>`;
  if (window.activeWalletPlate === lowerButtonIds.send) {
    return tacticleContentPlate(html`<div>SEND</div>`, leftUpper);
  }
  if (window.activeWalletPlate === lowerButtonIds.receive) {
    return tacticleContentPlate(html`<div>RECEIVE</div>`, middleUpper);
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
  return html`<div></div>`;
};
