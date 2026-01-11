import type { CacheAndCursor, CacheObject, MiniCache } from "./minicache";
import { makeNewMini, type Mini, type MiniHtmlString } from "./mininext";

export type RootOptions = {
  component: (mini: Mini) => MiniHtmlString;
  container: HTMLElement;
  cac?: CacheAndCursor;
};
let roots: RootOptions[] = [];
export function renderRoot(options: RootOptions) {
  roots.push(options);
  startRafLoop();
}
let rafRunning = false;
function startRafLoop() {
  if (rafRunning) return;
  rafRunning = true;
  function loop() {
    for (const root of roots) {
      let { component, cac } = root;
      if (!cac) {
        cac = {
          cache: new Map<string, CacheObject>(),
          cursor: crypto.randomUUID(),
        };
      }
      const mini = makeNewMini(cac);
      const evaluated = component(mini);
      const resolved = evaluated.resolve(mini);
      root.cac = resolved.render(root.container, cac);
    }
    flushDomUpdates();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
const writeQueue: Array<DomUpdateOptions> = [];

function flushDomUpdates() {
  for (const write of writeQueue) {
    replace(write);
  }
  writeQueue.length = 0;
}

type DomUpdateOptions = {
  // Text update: update this Text node's content.
  textTarget?: Text;
  text?: string;

  // Structural replacement: replace `target` with `replacement`.
  target?: Element | HTMLElement;
  replacement?: Element;
};
export function replace(options: DomUpdateOptions): void {
  const { textTarget, text, target, replacement } = options;
  if (textTarget) {
    if (!textTarget.isConnected) return;

    if (typeof text === "string") {
      if (textTarget.textContent === text) return;
      textTarget.textContent = text;
    }
    return;
  }

  if (target && replacement) {
    // if (!target.isConnected) return;

    const parent = target.parentNode;
    if (!parent) return;
    parent.replaceChild(replacement, target);
  }
}
// only cache hits trigger dom update schedules ( if the value changed )
export function scheduleDomUpdate(options: DomUpdateOptions): void {
  writeQueue.push(options);
}
