import {
  html,
  type Mini,
  type MiniHtmlString,
} from "../../../mininext/mininext";
import { buttonIds, lowerBottomMenu, lowerTopMenu } from "./buttons";
export const walletMain = (mini: Mini) => {
  return mini.html`
        <div class="main">
        <style>
            .main {
                display: flex;
                flex-direction: column;
                height: 100%;
                max-height: 900px;
                padding: 8px;
                gap: 11px;
            }
        </style>
        
            ${walletUpper(mini)}
            ${walletLower(mini)}
        </div>`;
};
const walletUpper = (mini: Mini) => {
  return mini.html`
        <div class="upper">
            <div class="labels">
                <div class="safe">0</div>
                <div class="fire">1.37 XMR</div>
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
            <style>
          .upper {
    height: 199px;
    background: linear-gradient(145deg, #444 0%, #2a2a2a 100%);
    border-radius: 12px;
    border: 4px solid #666;
    box-shadow: inset 0 4px 12px rgba(0, 0, 0, 0.6), 0 15px 25px rgba(0, 0, 0, 0.4);
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

.knob-left {  }
.knob-right {  }

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

.safe { color: white; margin-left:35px;}
.fire { color: #ff4444; white-space: nowrap; }

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
export type ButtonId = (typeof buttonIds)[keyof typeof buttonIds];
export type PlateState = {
  activePlate: ButtonId | null;
  plateContent: MiniHtmlString | string;
};

export function attachHandlers(cb: (event: MouseEvent) => void) {
  for (const id in buttonIds) {
    const button = document.getElementById(id);
    if (button) button.onclick = cb;
  }
}
export function removeActive() {
  for (const id in buttonIds) {
    const button = document.getElementById(id);
    if (button) button.classList.remove("active");
  }
}
export const walletLower = (mini: Mini) => {
  const plateState = mini.state<PlateState>("plateState", {
    activePlate: null,
    plateContent: "",
  }).value;
  function clickHandler(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement | null;
    const id = (e.currentTarget as HTMLElement | null)?.id as ButtonId;
    if (!id || !target) return;
    removeActive();
    target.classList.add("active");
    if (plateState.activePlate === id) {
      plateState.activePlate = null;
      removeActive();
      return;
    }
    plateState.activePlate = id;
    plateState.plateContent = id;
  }
  attachHandlers(clickHandler);
  return mini.html`
        <div class="lower">
        <style>
            .lower {
                display: grid;
                grid-template-rows: 40px 1fr 40px;
                height:100%;
              }
        </style>
        ${lowerTopMenu()}
        ${contentPlate(plateState)}
        ${lowerBottomMenu()}
        </div>`;
};
export const contentPlate = (plateState: PlateState) => {
  if (plateState.activePlate === null) return html`<div></div>`;
  return html`<div class="content-plate">
    ${plateState.plateContent}<style>
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
