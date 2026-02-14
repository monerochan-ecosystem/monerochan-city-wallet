import { flatten, html } from "../../../mininext/mininext";
import { generateSeedphrase } from "@spirobel/seedphrase";

const seedphrase = generateSeedphrase().split(" ");
export function onboarding() {
  return html`<div class="main">
    <style>
      .main {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 8px;
        gap: 11px;
      }
    </style>
    ${onboardingUpper()}
  </div>`;
}

function onboardingUpper() {
  const seedwords = seedphrase.map((word, i) => {
    return html`<div class="seed-phrase" id="word${i + 1}">${word}</div>`;
  });
  return flatten(seedwords, (htmlstrings) => {
    return html`<div class="upper">
      <style>
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
            "seedphrase seedphrase seedphrase seedphrase"
            "seedphrase seedphrase seedphrase seedphrase"
            "seedphrase seedphrase seedphrase seedphrase"
            "divider divider divider divider"
            "passphrase passphrase passphrase passphrase";
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(5, 20px);
          box-sizing: border-box;
          gap: 14px;
          padding: 17px;
        }
        .seed-phrase {
          font-size: 14px;
          font-weight: bold;
          color: #bbb;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        }
        .divider {
          margin-top: 10px;
          grid-area: divider;
          height: 4px;
          background: #666;
          border-radius: 12px;
          box-shadow: 0 0 12px rgba(0, 0, 0, 0.6);
        }
        .passphrase {
          grid-area: passphrase;
          font-size: 14px;
          font-weight: bold;
          color: #bbb;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        }
        .divider::before {
          content: "seedphrase";
          margin-top: -14px;
          float: right;
          font-size: 10px;
          color: #888;
          font-weight: normal;
          user-select: none;
          pointer-events: none;
          white-space: nowrap;
        }

        .divider::after {
          content: "seedoffset passphrase";
          margin-top: 7px;
          float: right;
          font-size: 10px;
          color: #888;
          font-weight: normal;
          user-select: none;
          pointer-events: none;
          white-space: nowrap;
        }
      </style>
      ${htmlstrings}
      <div class="divider"></div>
      <div class="passphrase">this is my secret password</div>
    </div>`;
  });
}
