import { readDir } from "@spirobel/monero-wallet-api";
import { html, flatten } from "../../../mininext/mininext";
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
    } else {
      content.innerText = fileObject.content;
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
        <div class="filename file-closed" id="${String(i)}">
          ${file.filename}
        </div>
        <div class="content" id="${String(i)}-content">
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
  return html`<div>
    <style>
      .dir {
        width: 270px;
        word-wrap: break-word;
        display: inline-block;
        margin-bottom: 20px;
      }
      .filename {
        user-select: none;
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
        margin-top: 5px;
        color: #0000ff;
        text-decoration: underline;
        font-family: serif;
        font-size: 16px;
        margin-bottom: 12px;
        cursor: pointer;
      }
    </style>
    Sharing the content of these files will result in the loss of your funds &
    privacy. ${files}
  </div>`;
}
