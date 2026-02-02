import { readDir } from "@spirobel/monero-wallet-api";
import { flatten, html } from "../../../mininext/mininext";
import { leftLower, tacticleContentPlate } from "../ui/content";
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
      </style>
      developer settings ${files}
    </div>`,
    leftLower,
    "top",
    "398px",
  );
}
