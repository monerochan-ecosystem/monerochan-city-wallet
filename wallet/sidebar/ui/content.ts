import { html } from "../../../mininext/mininext";

export const contentPlate = () => {
  if (!window.activeWalletPlate) return html`<div></div>`;
  return html`<div class="content-plate">
    ${window.activeWalletPlate}<style>
      .content-plate {
        border-radius: 8% 21% 8% 9% / 4% 15% 6% 6%;
        height: 500px;
        width: 320px;
        margin-left: 7px;
        margin-top: 15px;
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
      }
    </style>
  </div>`;
};
