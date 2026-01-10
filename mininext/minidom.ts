import type { CacheAndCursor, MiniCache } from "./minicache";
import { makeNewMini, type MiniHtmlString } from "./mininext";

export type RootOptions = {
  component: MiniHtmlString;
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
      const { component, container, cac } = root;
      const resolvedComponent = cac
        ? component.resolve(makeNewMini(cac))
        : component.resolve();
      root.cac = resolvedComponent.render(container, cac);
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
  target?: Element | DocumentFragment | HTMLElement;
  replacement?: Element | DocumentFragment;

  cache: MiniCache;
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
