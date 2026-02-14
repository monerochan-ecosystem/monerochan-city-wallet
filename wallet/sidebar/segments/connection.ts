import {
  get_info,
  readNodeUrlFromScanSettings,
  writeNodeUrlToScanSettings,
} from "@spirobel/monero-wallet-api";
import { html } from "../../../mininext/mininext";
import { leftLower, tacticleContentPlate } from "../ui/content";
import { textInput } from "../ui/input";
import { sendChangeNodeUrlEvent } from "../../../background/messagebus";
import { developerSettings } from "./developerSettings";

async function readNodeUrl() {
  nodeUrlInputValue = (await readNodeUrlFromScanSettings()) || null;
  const nodeUrlInput = document.getElementById(
    "nodeUrl",
  ) as HTMLInputElement | null;
  if (nodeUrlInput) {
    nodeUrlInput.value = nodeUrlInputValue || "";
  }
}
let nodeUrlInputValue: string | null = null;
let test_result = "";
let status_message = "";
let openDevSettings = false;
export function updateNodeUrlCallback() {
  const nodeUrl = document.getElementById("nodeUrl") as HTMLInputElement | null;
  if (!nodeUrl) return;
  nodeUrlInputValue = nodeUrl.value;
}
function openDevSettingsHandler() {
  openDevSettings = !openDevSettings;
}
async function resetNodeUrlHandler() {
  await readNodeUrl();
  status_message = "Node URL reset";
}
async function saveNodeUrlHandler() {
  if (!nodeUrlInputValue) return;
  await writeNodeUrlToScanSettings(nodeUrlInputValue);
  sendChangeNodeUrlEvent(nodeUrlInputValue);
  status_message = "Node URL saved";
}

async function sendTestRequestHandler() {
  const nodeUrlInput = document.getElementById(
    "nodeUrl",
  ) as HTMLInputElement | null;
  if (!nodeUrlInput) return;
  try {
    const test = await get_info(nodeUrlInput.value);
    status_message = `get_info response success`;
    test_result = JSON.stringify(test, null, 2);
  } catch (err) {
    status_message = `get_info response failed`;
    test_result = "";
  }
}
export function connectionPlate() {
  const openDevSettingsButton = document.getElementById(
    "openDevSettingsButton",
  ) as HTMLInputElement | null;
  if (openDevSettingsButton) {
    openDevSettingsButton.onclick = openDevSettingsHandler;
  }
  const sendTestRequest = document.getElementById(
    "sendTestRequest",
  ) as HTMLInputElement | null;
  if (sendTestRequest) {
    sendTestRequest.onclick = sendTestRequestHandler;
  }
  const resetNodeUrl = document.getElementById(
    "resetNodeUrl",
  ) as HTMLInputElement | null;
  if (resetNodeUrl) {
    resetNodeUrl.onclick = resetNodeUrlHandler;
  }
  const saveNodeUrl = document.getElementById(
    "saveNodeUrl",
  ) as HTMLInputElement | null;
  if (saveNodeUrl) {
    saveNodeUrl.onclick = saveNodeUrlHandler;
  }
  const nodeUrlInput = document.getElementById(
    "nodeUrl",
  ) as HTMLInputElement | null;
  if (nodeUrlInput) {
    nodeUrlInput.oninput = updateNodeUrlCallback;
    if (
      nodeUrlInput.value.length === 0 &&
      nodeUrlInputValue &&
      nodeUrlInputValue.length > 0
    ) {
      nodeUrlInput.value = nodeUrlInputValue;
    }
    if (nodeUrlInputValue === null) readNodeUrl();
  }
  return tacticleContentPlate(
    html`<div>
      <style>
        .link-closed {
          margin-top: 5px;
          color: #0000ff;
          text-decoration: underline;
          font-family: serif;
          font-size: 16px;
          margin-bottom: 12px;
          cursor: pointer;
        }
        .link-open {
          color: #551a8b;
          text-decoration: underline;
          font-family: serif;
          font-size: 16px;
          margin-bottom: 12px;
          cursor: pointer;
        }
        .no-side-effect-action {
          box-shadow:
            inset 0 4px 12px rgba(0, 0, 0, 0.45),
            0 5px 8px rgba(0, 0, 0, 0.4);
          margin-top: 4px;
          font-size: 14px;
          margin-bottom: 12px;
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          padding: 2px 4px;
        }
        .no-side-effect-action:hover {
          color: white;
        }
        .side-effect-action {
          box-shadow:
            inset 0 4px 12px rgba(0, 0, 0, 0.45),
            0 5px 8px rgba(0, 0, 0, 0.4);
          margin-left: 12px;
          margin-top: 4px;
          font-size: 14px;
          margin-bottom: 12px;
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          padding: 2px 4px;
        }
        .side-effect-action:hover {
          color: white;
        }
        .send-test {
          display: flex;
          gap: 5px;
          margin-top: 4px;
          margin-bottom: 4px;
          user-select: none;
        }
        .test-result {
          margin-top: 4px;
          margin-bottom: 12px;
          height: 300px;
          width: 250px;
          background-color: #333;
          overflow-y: auto;
          text-wrap: auto;
        }
        #openDevSettingsButton {
          margin-top: 5px;
          text-decoration: underline;
          font-family: serif;
          font-size: 16px;
          margin-bottom: 12px;
          cursor: pointer;
          ${openDevSettings ? "color: #551a8b;" : ""}
        }
        #openDevSettingsButton:hover {
          ${openDevSettings
          ? "color: rgba(255, 255, 255, 0.3)"
          : "color: white;"}

        }
      </style>
      ${textInput("nodeUrl", "Enter node URL")}
      <div class="send-test">
        <span class="no-side-effect-action" id="sendTestRequest">
          TEST CONNECTION</span
        >
        <span class="no-side-effect-action" id="resetNodeUrl"> RESET</span>
        <span></span>
        <span class="side-effect-action" id="saveNodeUrl"> SAVE</span>
      </div>
      <div style="margin-left: 14px;">
        <div style="height: 14px;">
          <span style="user-select: none;"> ${status_message}</span>
        </div>
        <pre class="test-result">        ${test_result}</pre>
      </div>
      <div style="margin-top: 50px">
        <span id="openDevSettingsButton">developer settings </span>
      </div>
      <div id="devSettings">${openDevSettings ? developerSettings() : ""}</div>
    </div>`,
    leftLower,
    "top",
    "calc(100vh - 398px)",
  );
}
