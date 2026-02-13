import { html } from "../../../mininext/mininext";

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
    <div class="upper">
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
      </style>
    </div>
  </div>`;
}
