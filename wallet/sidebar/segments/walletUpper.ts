import { html } from "../../../mininext/mininext";
export const safetyButtonIds = {
  fire: "fire",
  safe: "safe",
} as const;
export const walletUpper = () => {
  return html` <div class="upper">
    <div class="labels">
      <div class="safe-label">0</div>
      <div class="fire-label">1.37 XMR</div>
    </div>

    <div class="track" id="track">
      <div class="knob knob-left" id="knob">
        <div class="knob-outer">
          <div class="knob-inner"></div>
        </div>
      </div>
    </div>

    <div class="multi"></div>
    <div class="divider"></div>
    <div class="wallet-name">main</div>
    <div id="safe"></div>
    <div id="fire"></div>
    <style>
      #safe {
        position: absolute;
        width: 100px;
        height: 80px;
      }
      #fire {
        position: absolute;
        margin-left: 100px;
        width: 170px;
        height: 80px;
      }
      .upper {
        height: 199px;
        background: linear-gradient(145deg, #444 0%, #2a2a2a 100%);
        border-radius: 12px;
        border: 4px solid #666;
        box-shadow:
          inset 0 4px 12px rgba(0, 0, 0, 0.6),
          0 15px 25px rgba(0, 0, 0, 0.4);
        display: grid;
        grid-template-areas:
          "labels labels labels"
          "track track track"
          "multi multi multi"
          "divider divider divider"
          "wallet wallet wallet";
        grid-template-rows: 30px 16px 30px 4px 40px;
        grid-template-columns: 30px 1fr 30px;
        padding: 20px 30px;
        box-sizing: border-box;
        gap: 10px 0;
        user-select: none;
      }
      .multi {
        grid-area: multi;
        height: 100%;
      }
      .track {
        grid-area: track;
        width: 200px;
        height: 100%;
        background: #555;
        border-radius: 6px;
        border: 2px inset #777;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.8);
        cursor: pointer;
      }
      .knob {
        height: 28px;
        cursor: pointer;
        transform: translate(3px, -5px);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
      }
      .knob-outer {
        width: 24px;
        height: 100%;
        background: linear-gradient(145deg, #666, #444);
        border: 2px solid #888;
        border-radius: 3px;
        box-shadow:
          inset 0 1px 3px rgba(255, 255, 255, 0.1),
          0 3px 8px rgba(0, 0, 0, 0.6);
      }

      .knob-inner {
        position: relative;
        left: 2px;
        width: 16px;
        height: 24px;
        background: #555;
        border: 1px solid #777;
        border-radius: 1px;
        transform: rotate(90deg);
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.8);
      }

      .knob-left {
      }
      .knob-right {
      }

      .labels {
        grid-area: labels;
        display: flex;
        align-items: flex-end;
        padding-bottom: 3px;
        margin-right: 10px;
        justify-content: space-between;
        font-size: 20px;
        font-weight: bold;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
      }

      .safe-label {
        color: white;
        margin-left: 35px;
      }
      .fire-label {
        color: #ff4444;
        white-space: nowrap;
      }

      .divider {
        grid-area: divider;
        height: 4px;
        background: #666;
        border-radius: 12px;
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.6);
      }

      .wallet-name {
        grid-area: wallet;
        text-align: right;
        margin-right: 10px;
        font-size: 18px;
        font-weight: bold;
        color: #bbb;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
      }
    </style>
  </div>`;
};
