let rafScheduled = false;
const writeQueue: Array<() => void> = [];

function ensureRaf() {
  if (rafScheduled) return;
  rafScheduled = true;
  requestAnimationFrame(flushDomUpdates);
}

function flushDomUpdates() {
  for (const write of writeQueue) {
    write();
  }
  writeQueue.length = 0;
  rafScheduled = false;
}

type DomUpdateOptions = {
  // Text update: update this Text node's content.
  textTarget?: Text;
  text?: string;

  // Structural replacement: replace `target` with `replacement`.
  target?: Element | DocumentFragment | HTMLElement;
  replacement?: Element | DocumentFragment;

  cache: Cache;
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
  writeQueue.push(() => {
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
      if (!target.isConnected) return;

      const parent = target.parentNode;
      if (!parent) return;
      parent.replaceChild(replacement, target);
    }
  });

  ensureRaf();
}

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

export type Mini = {
  html: typeof html;
  click: (name: string, cb: () => void) => string;
  cacheAndCursor: CacheAndCursor;
};
export function makeNewMini(cac: CacheAndCursor): Mini {
  return {
    html,
    click: (name, handler) => {
      return clickHandler(name, handler, cac);
    },
    cacheAndCursor: cac,
  };
}
export type MiniHtmlString = {
  stringLiterals: TemplateStringsArray;
  values: MiniValue[];
  resolve(mini?: Mini): ResolvedMiniHtmlString;
};
export type ResolvedMiniHtmlString = {
  stringLiterals: StringArray;
  values: ResolvedMiniValue[];
  slots: string[];
  handlers: ClickHandler[];
  render: (
    target: Element | DocumentFragment | HTMLElement,
    cacheAndCursor?: CacheAndCursor
  ) => CacheAndCursor;
};
export type MiniComponent = (mini: Mini) => MiniHtmlString;
export type PrimitiveValue = string | number;
export type MiniValue = PrimitiveValue | MiniComponent | MiniHtmlString;
export type ResolvedMiniValue = PrimitiveValue | ResolvedMiniHtmlString;
export type CacheObject = {
  el?: DocumentFragment | HTMLElement;
  value: ResolvedMiniValue;
};

export type Cache = Map<string, CacheObject>;
export function resolveMiniValue(
  value: MiniValue,
  parentMini: Mini,
  slotId: string
): ResolvedMiniValue {
  // make new mini with slotid as cursor
  const mini = makeNewMini({ ...parentMini.cacheAndCursor, cursor: slotId });

  if (typeof value === "function") {
    const component = value(mini);
    // if this happened we need to save the handlers to the cache
    return component.resolve(mini);
  }
  if (typeof value === "object" && "resolve" in value)
    return value.resolve(mini);
  return value;
}
export function resolveMiniHtmlString(
  stringLiterals: StringArray,
  unresolvedValues: MiniValue[],
  mini: Mini,
  slots: string[],
  handlers: ClickHandler[]
): ResolvedMiniHtmlString {
  const resolvedValues: ResolvedMiniValue[] = [];
  let index = 0;
  for (const unresolvedValue of unresolvedValues) {
    const slotId = slots[index];
    if (!slotId)
      throw new Error(`Could not find slot id for ${unresolvedValue}`);
    resolvedValues.push(resolveMiniValue(unresolvedValue, mini, slotId));
    index++;
  }

  return {
    handlers,
    slots,
    stringLiterals,
    values: resolvedValues,
    render: (
      target: Element | DocumentFragment | HTMLElement,
      cacheAndCursor?: CacheAndCursor
    ) => {
      if (!cacheAndCursor) cacheAndCursor = mini.cacheAndCursor; //and cache here
      return render({
        target,
        stringLiterals,
        resolvedValues,
        cacheAndCursor,
      });
    },
  };
}
export function makeNewResolvedMiniHtmlString(
  stringLiterals: StringArray,
  unresolvedValues: MiniValue[],
  mini?: Mini
) {
  if (!mini) {
    const cac = {
      cache: new Map<string, CacheObject>(),
      cursor: crypto.randomUUID(),
    };
    mini = makeNewMini(cac);
  }

  const slots = unresolvedValues.map(() => crypto.randomUUID());
  const result = resolveMiniHtmlString(
    stringLiterals,
    unresolvedValues,
    mini,
    slots,
    []
  );
  // make slotids and push the cache entry
  // only write it to cache here if the cache did not exist
  // should only be updated in render
  // we need to do this so we can save handler ids before first render

  mini.cacheAndCursor.cache.set(mini.cacheAndCursor.cursor, {
    value: result,
  });

  return result;
}
export function html(
  stringLiterals: TemplateStringsArray,
  ...values: MiniValue[]
): MiniHtmlString {
  const _handlers: ClickHandler[] = []; // this is the wrong place to initialize handlers and cache
  return {
    stringLiterals,
    values,
    resolve: (mini?: Mini): ResolvedMiniHtmlString => {
      if (mini && getCacheEntry(mini.cacheAndCursor)) {
        // CASE: mini already exists, we can assume cache exits too
        const cacheEntry = getResolvedMiniHtmlStringThrows(mini.cacheAndCursor);
        const htmlUnchanged = arraysEqual(
          stringLiterals,
          cacheEntry.stringLiterals
        );
        // in case we attached a handler, slots.length will be 0
        // we need to make sure we actually have real slots
        if (cacheEntry.slots.length === 0) {
          cacheEntry.slots = values.map(() => crypto.randomUUID());
        }
        const slots = htmlUnchanged
          ? cacheEntry.slots
          : values.map(() => crypto.randomUUID()); // in case the html changed, we need to make new slots
        return resolveMiniHtmlString(
          stringLiterals,
          values,
          mini,
          slots,
          cacheEntry.handlers
        );
      }
      // CASE: mini does not exist yet. Probably root component

      return makeNewResolvedMiniHtmlString(stringLiterals, values, mini);
    },
    //  resolveMiniHtmlString({ stringLiterals, values })
  };
}
export function makeOrUsePlaceholderFragment(
  stringLiterals: StringArray,
  values: ResolvedMiniValue[],
  cacheAndCursor: CacheAndCursor
) {
  const cacheEntry = getCacheEntryThrows(cacheAndCursor);
  const resolved = getResolvedMiniHtmlStringThrows(cacheAndCursor);
  if (cacheEntry.el) {
    //if literals are the same as in cache, we use the old element
    const htmlUnchanged = arraysEqual(stringLiterals, resolved.stringLiterals);

    if (htmlUnchanged)
      return {
        placeholderFragment: cacheEntry.el,
        ids: resolved.slots,
        newPlaceholder: false,
      };
  }
  let placeholder = "";
  let index = 0;
  const inside = { element: false, singleQuotes: false, doubleQuotes: false };
  for (const literal of stringLiterals) {
    isInside(literal, inside);
    const id = resolved.slots[index];
    if (inside.element) {
      placeholder += literal + escapeHtml(values[index]);
    } else if (!inside.element && index < values.length) {
      placeholder += literal + `<div id="${id}"></div>`;
    } else {
      placeholder += literal;
    }
    index++;
  }
  const placeholderFragment = fragmentFromHtml(placeholder);
  // add child elements to cache
  for (const id of resolved.slots) {
    const el = placeholderFragment.getElementById(id);
    if (!el) continue;
    if (!cacheAndCursor.cache.has(id))
      cacheAndCursor.cache.set(id, { el, value: id });
  }
  cacheEntry.el = placeholderFragment;
  resolved.stringLiterals = stringLiterals;
  resolved.values = values;
  return { placeholderFragment, ids: resolved.slots, newPlaceholder: true };
}
export function updateValue(
  el: DocumentFragment | HTMLElement,
  value: ResolvedMiniValue,
  id: string,
  cacheAndCursor: CacheAndCursor
) {
  if (typeof value == "object" && "render" in value) {
    //if values + templatestrings as in cache.get(id) are the same we dont render

    value.render(el, { ...cacheAndCursor, cursor: id });
    //should we call render in the domupdate?
  } else {
    //scheduleDomUpdate({ target: el, text: String(value) });
    el.textContent = String(value);
  }
}
export function updateValues(
  placeholderFragment: DocumentFragment | HTMLElement,
  values: ResolvedMiniValue[],
  ids: string[],
  cacheAndCursor: CacheAndCursor
) {
  const doc =
    placeholderFragment instanceof HTMLElement ? document : placeholderFragment;
  let index = 0;
  for (const value of values) {
    const id = ids[index];
    index++;
    if (!id) throw new Error(`Could not find id in placeholder for ${value}`);

    let el: DocumentFragment | HTMLElement | undefined | null =
      doc.getElementById(id);

    if (!el) el = cacheAndCursor.cache.get(id)?.el;
    if (!el) continue;
    updateValue(el, value, id, cacheAndCursor);
  }
}
export type CacheAndCursor = {
  cache: Cache;
  cursor: string;
};
export type RenderArgs = {
  target: Element | DocumentFragment | HTMLElement;
  stringLiterals: StringArray;
  resolvedValues: ResolvedMiniValue[];
  cacheAndCursor: CacheAndCursor;
};

export function render({
  target,
  stringLiterals,
  resolvedValues,
  cacheAndCursor,
}: RenderArgs) {
  const { placeholderFragment, ids, newPlaceholder } =
    makeOrUsePlaceholderFragment(
      stringLiterals,
      resolvedValues,
      cacheAndCursor
    );
  updateValues(placeholderFragment, resolvedValues, ids, cacheAndCursor);
  // if we still use the same string literals (= html snippet skeleton),
  // we dont need to replace, only values get updated if they changed
  if (newPlaceholder) {
    attachHandlers(placeholderFragment, cacheAndCursor);
    replace({
      target,
      replacement: placeholderFragment,
      cache: cacheAndCursor.cache,
    });
  }
  return cacheAndCursor;
}
export type ClickHandler = {
  cb: (event?: MouseEvent) => void;
  id: string;
  name: string;
};
export function getCacheEntry(cacheAndCursor: CacheAndCursor) {
  return cacheAndCursor.cache.get(cacheAndCursor.cursor);
}
export function getCacheEntryThrows(cacheAndCursor: CacheAndCursor) {
  const entry = getCacheEntry(cacheAndCursor);
  if (!entry)
    throw new Error(
      `Could not find cache entry for cursor ${cacheAndCursor.cursor}`
    );
  return entry;
}
export function getResolvedMiniHtmlStringThrows(
  cacheAndCursor: CacheAndCursor
) {
  const cacheEntry = getCacheEntryThrows(cacheAndCursor);
  if (typeof cacheEntry.value !== "object")
    throw new Error(
      `primitive value, handlers only exist on ResolvedMiniHtmlString. ${JSON.stringify(
        cacheEntry
      )}`
    );
  return cacheEntry.value;
}
export function getHandlers(cacheAndCursor: CacheAndCursor) {
  return getResolvedMiniHtmlStringThrows(cacheAndCursor).handlers;
}
export function attachHandlers(
  placeholderFragment: DocumentFragment | HTMLElement,
  cacheAndCursor: CacheAndCursor
) {
  const handlers = getHandlers(cacheAndCursor);
  const doc =
    placeholderFragment instanceof HTMLElement ? document : placeholderFragment;
  // dont reattach event handlers if they have already been attached
  for (const clickHandler of handlers) {
    const el = doc.getElementById(clickHandler.id);
    if (!el)
      throw new Error(
        `Could not find element to attach handler for ${clickHandler.id}`
      );
    el.addEventListener("click", clickHandler.cb);
  }
}

export function clickHandler(
  name: string,
  cb: (event?: MouseEvent) => void,
  cacheAndCursor: CacheAndCursor
) {
  const cacheEntry = getCacheEntry(cacheAndCursor);
  if (!cacheEntry) {
    makeNewResolvedMiniHtmlString([], [], makeNewMini(cacheAndCursor));
  }
  const handlers = getHandlers(cacheAndCursor);

  const handler = handlers.find((handler) => handler.name === name);
  if (handler) return handler.id;
  const id = crypto.randomUUID();
  handlers.push({ cb, id, name });
  delete cacheEntry?.el; // we want to dirty the cache in any case
  return id;
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
function arraysEqual(arr1: StringArray, arr2: StringArray): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((str, index) => str === arr2[index]);
}
