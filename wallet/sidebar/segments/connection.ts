import {
  get_info,
  readDir,
  readNodeUrlFromScanSettings,
} from "@spirobel/monero-wallet-api";
import { flatten, html } from "../../../mininext/mininext";
import { leftLower, tacticleContentPlate } from "../ui/content";
import { textInput } from "../ui/input";
let fileObjects: { filename: string; content: string }[] = [];
async function readFiles() {
  const files = [];
  const filenames = await readDir("");
  for (const filename of filenames) {
    const content = await Bun.file(filename).text();
    files.push({ filename, content });
  }
  return files;
}
async function readNodeUrl() {
  nodeUrlInputValue = (await readNodeUrlFromScanSettings()) || null;
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
  readFiles().then((files) => {
    fileObjects = files;
  });

  const dirlist = fileObjects.map(
    (dir) =>
      html`<div class="dir">
        <div class="filename">${dir.filename}</div>
        <div class="content">${dir.content}</div>
      </div>`,
  );
  const files = flatten(dirlist);
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
        .dir {
          width: 270px;
          word-wrap: break-word;
          display: inline-block;
          margin-bottom: 20px;
        }
        .filename {
          color: #551a8b;
          text-decoration: underline;
          font-family: serif;
          font-size: 16px;
          margin-bottom: 12px;
          cursor: pointer;
        }
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
          margin-left: 29px;
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
        <span class="no-side-effect-action"> RESET</span>
        <span class="side-effect-action"> SAVE</span>
      </div>
      <div style="margin-left: 14px;">
        <div style="height: 14px;">
          <span style="user-select: none;"> ${status_message}</span>
        </div>
        <pre class="test-result">        ${test_result}</pre>
      </div>
      <div style="margin-top: 60px">
        <span id="openDevSettingsButton">developer settings </span>
      </div>
      <div id="devSettings">${openDevSettings ? files : ""}</div>
    </div>`,
    leftLower,
    "top",
    "398px",
  );
}
