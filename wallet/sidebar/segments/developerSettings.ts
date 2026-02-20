import { readDir } from "@spirobel/monero-wallet-api";
import { html, flatten } from "../../../mininext/mininext";
import { textInput } from "../ui/input";
import { router } from "../router";
let fileObjects: { filename: string; content: string; opened: boolean }[] = [];
async function readFiles() {
  const files = [];
  const filenames = await readDir("");
  for (const filename of filenames) {
    const content = await Bun.file(filename).text();
    files.push({ filename, content, opened: false });
  }
  return files;
}
async function deleteAllfiles() {
  for (const file of fileObjects) {
    await Bun.file(file.filename).delete();
  }
}
async function wipeWalletCallback() {
  const wipeWallet = document.getElementById(
    "wipeWallet",
  ) as HTMLInputElement | null;
  if (!wipeWallet) return;
  if (wipeWallet.value === "DELETE ALL FILES") {
    await deleteAllfiles();
    router.navigate("/onboarding");
  }
}
async function exportWallet() {
  const download = (filename: string, text: string) =>
    Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([text], { type: "text/plain" })),
      download: filename,
    }).click();

  const backup = {
    files: fileObjects.map((file) => {
      return {
        filename: file.filename,
        content: file.content,
      };
    }),
  };
  download("wallets.json", JSON.stringify(backup, null, 2));
}
function openFile(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement | null;
  const id = (e.currentTarget as HTMLElement | null)?.id as string;
  const fileObject = fileObjects[Number(id)];
  if (!fileObject || !target) return;
  fileObject.opened = !fileObject.opened;
  target.classList.toggle("file-opened");
  target.classList.toggle("file-closed");
  const content = document.getElementById(`${id}-content`);
  if (content) {
    if (target.classList.contains("file-closed")) {
      content.innerText = "";
      content.style.backgroundColor = "unset";
    } else {
      content.innerText = fileObject.content;
      content.style.backgroundColor = "#333";
    }
  }
}
export function developerSettings() {
  if (!fileObjects.length)
    readFiles().then((files) => {
      fileObjects = files;
    });

  const dirlist = fileObjects.map(
    (file, i) =>
      html`<div class="dir">
        <div
          class="filename ${file.opened ? "file-opened" : "file-closed"}"
          id="${String(i)}"
        >
          ${file.filename}
        </div>
        <div
          class="content ${file.opened ? "content-opened" : "content-closed"}"
          id="${String(i)}-content"
        >
          ${file.opened ? file.content : ""}
        </div>
      </div>`,
  );
  const dirElement = document.getElementsByClassName("filename");
  if (dirElement) {
    for (const element of dirElement) {
      (element as HTMLElement).onclick = openFile;
    }
  }

  const files = flatten(dirlist);
  const exportWalletButton = document.getElementById(
    "exportWallet",
  ) as HTMLElement | null;
  if (exportWalletButton) {
    exportWalletButton.onclick = exportWallet;
  }
  const wipeWalletInput = document.getElementById(
    "wipeWallet",
  ) as HTMLInputElement | null;
  if (wipeWalletInput) {
    wipeWalletInput.oninput = wipeWalletCallback;
  }
  return html`<div>
    <style>
      .dir {
        width: 270px;
        word-wrap: break-word;
        display: inline-block;
      }
      .filename {
        user-select: none;
      }
      .content {
        padding: 5px;
        overflow-y: auto;
        text-wrap: auto;
      }
      .content-opened {
        background-color: #333;
      }
      .content-closed {
        background-color: unset;
      }
      .file-opened {
        color: #551a8b;
        text-decoration: underline;
        font-family: serif;
        font-size: 16px;
        margin-bottom: 12px;
        cursor: pointer;
      }

      .file-closed {
        color: rgba(255, 255, 255, 0.3);
        text-decoration: underline;
        font-family: serif;
        font-size: 16px;
        cursor: pointer;
      }
      .file-closed:hover {
        color: #551a8b;
      }
      #exportWallet {
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
      #exportWallet:hover {
        color: white;
      }
    </style>
    <div style="margin-top: 12px">
      Sharing the content of these files will result in the loss of your funds &
      privacy.
    </div>
    <div style="margin-bottom: 36px; margin-top: 12px">
      <span id="exportWallet">EXPORT WALLETS</span>
    </div>
    <div>
      <span> type DELETE ALL FILES to reset your wallet: </span>
      ${textInput("wipeWallet", "DELETE ALL FILES")}
    </div>
    <div style="margin-top: 85px; margin-bottom: 7px">
      inspect wallet files:
    </div>
    ${files}
  </div>`;
}
