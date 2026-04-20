import {
  checkToolInvocationValidity,
  parseToolInvocation,
} from "@spirobel/monero-wallet-api/tools";
import {
  sendMoneroToolEvent,
  sendOpenSideBarEvent,
} from "../background/messagebus";
declare global {
  var browser: typeof chrome;
}
if (typeof chrome !== "undefined" && typeof browser === "undefined") {
  globalThis.browser = chrome;
}
function processTargetLink(element: HTMLAnchorElement | null) {
  if (!element || element.tagName !== "A") return false;

  const href = element.href || element.getAttribute("href") || "";
  const text = element.textContent || element.innerText || "";

  // matches if EITHER the href OR the visible text contains the tool link
  return parseToolInvocation(href, text, location);
}

function handleEvent(e: Event) {
  if (!(e.target instanceof Element)) {
    return;
  }
  const link = e.target.closest("a");
  const monerotoolLink = processTargetLink(link);
  if (!link || !monerotoolLink) return;

  const eventType = e.type;
  const href = link.href || link.getAttribute("href") || "";

  e.preventDefault();
  e.stopImmediatePropagation();
  sendMoneroToolEvent(monerotoolLink);
  sendOpenSideBarEvent();

  console.log(
    `Intercepted ${eventType} (before any site code):`,
    href,
    "parse result:",
    monerotoolLink,
  );
  checkToolInvocationValidity(monerotoolLink).then((result) => {
    monerotoolLink.valid = result;
    sendMoneroToolEvent(monerotoolLink);
  });
}

function init() {
  document.addEventListener("click", handleEvent, true);
  document.addEventListener("touchend", handleEvent, true);
  document.addEventListener("keydown", handleEvent, true);
}

init();
