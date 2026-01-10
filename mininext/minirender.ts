import {
  attachHandlers,
  getCacheEntryThrows,
  getResolvedMiniHtmlStringThrows,
  type CacheAndCursor,
  type CacheObject,
} from "./minicache";
import { scheduleDomUpdate } from "./minidom";

export function render(
  target: Element | DocumentFragment | HTMLElement,
  cac: CacheAndCursor
): CacheAndCursor {
  const cacheEntry = getCacheEntryThrows(cac);
  const htmlsnippet = getResolvedMiniHtmlStringThrows(cac);
  if (!htmlsnippet.stringLiterals || !htmlsnippet.values || !htmlsnippet.slots)
    throw new Error("should have lits,values & slots once resolved");
  const children: Map<string, CacheObject> = new Map();
  let placeholderFragment: DocumentFragment | null = null;

  if (cacheEntry.dirty) {
    let placeholder = "";
    let index = 0;
    const inside = {
      element: false,
      singleQuotes: false,
      doubleQuotes: false,
    };
    for (const literal of htmlsnippet.stringLiterals) {
      isInside(literal, inside);
      const id = htmlsnippet.slots[index];
      if (inside.element) {
        placeholder += literal + escapeHtml(htmlsnippet.values[index]);
      } else if (!inside.element && index < htmlsnippet.values.length) {
        placeholder += literal + `<div id="${id}"></div>`;
      } else {
        placeholder += literal;
      }
      index++;
    }
    placeholderFragment = fragmentFromHtml(placeholder);
    for (const childId of htmlsnippet.slots) {
      const el = placeholderFragment.getElementById(childId);
      const cacheEntry = cac.cache.get(childId);
      if (!el || !cacheEntry) continue;
      cacheEntry.el = el;
      children.set(childId, cacheEntry);
    }
  }

  if (!cacheEntry.dirty) {
    for (const childId of htmlsnippet.slots) {
      const cacheEntry = cac.cache.get(childId);
      if (!cacheEntry) continue;
      children.set(childId, cacheEntry);
    }
  }
  for (const [childId, child] of children) {
    const value = child.value;
    if (typeof value == "object") {
      const target = placeholderFragment ?? cacheEntry.el;
      if (!target)
        throw new Error(`if not dirty should have el: ${htmlsnippet}`);
      render(target, { ...cac, cursor: childId });
    } else {
      if (!child.dirty) continue;
      if (!child.el) throw new Error(`${child} should have el`);
      child.el.textContent = String(value);
      child.dirty = false;
    }
  }

  if (placeholderFragment) {
    attachHandlers(placeholderFragment, cac);
    scheduleDomUpdate({
      target,
      replacement: placeholderFragment,
      cache: cac.cache,
    });
    cacheEntry.el = placeholderFragment;
    cacheEntry.dirty = false;
  }

  return cac;
}

export type IsInside = {
  element: boolean;
  singleQuotes: boolean;
  doubleQuotes: boolean;
};

export function isInside(stringLiteral: string, isInside: IsInside) {
  for (const char of stringLiteral) {
    // Check for HTML element start (< not in quotes)
    if (char === "<" && !isInside.singleQuotes && !isInside.doubleQuotes) {
      isInside.element = true;
    }
    if (char === ">" && !isInside.singleQuotes && !isInside.doubleQuotes) {
      isInside.element = false;
    }
    if (!isInside.element) continue;
    // Handle quotes
    if (char === "'" && !isInside.doubleQuotes) {
      isInside.singleQuotes = !isInside.singleQuotes;
    } else if (char === '"' && !isInside.singleQuotes) {
      isInside.doubleQuotes = !isInside.doubleQuotes;
    }
  }
}

function escapeHtml(string?: any): string {
  if (!string) return "";
  string = String(string);
  const div = document.createElement("div");
  div.textContent = string;
  return div.innerHTML;
}
export type StringArray = string[] | TemplateStringsArray;

function fragmentFromHtml(html: string): DocumentFragment {
  const template = document.createElement("template");
  template.innerHTML = html;
  const fragment = template.content.cloneNode(true) as DocumentFragment;

  const hasManyRoots = fragment.childElementCount > 1;
  if (hasManyRoots)
    throw new Error(
      `Mini html placeholder template:\n
    ${html}\n
    Root elements: ${fragment.childElementCount}
    Every mini html string should have only one root element.\n`
    );

  return fragment;
}
