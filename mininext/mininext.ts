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
  target?: Element;
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
  cache: Cache;
  _handlers: ClickHandler[];
};
export type MiniHtmlString = {
  stringLiterals: TemplateStringsArray;
  values: MiniValue[];
  resolve(): ResolvedMiniHtmlString;
};
export type ResolvedMiniHtmlString = {
  stringLiterals: TemplateStringsArray;
  values: ResolvedMiniValue[];
  render: (
    target: Element,
    id?: string,
    cache?: Cache
  ) => {
    id: string;
    cache: Cache;
  };
};
export type MiniComponent = (mini: Mini) => MiniHtmlString;
export type PrimitiveValue = string | number;
export type MiniValue = PrimitiveValue | MiniComponent | MiniHtmlString;
export type ResolvedMiniValue = PrimitiveValue | ResolvedMiniHtmlString;
export type CacheObject = {
  el: DocumentFragment | HTMLElement;
  value: ResolvedMiniValue;
  slots: string[];
};

export type Cache = Map<string, CacheObject>;
export function resolveMiniValue(
  value: MiniValue,
  mini: Mini
): ResolvedMiniValue {
  if (typeof value === "function") {
    const component = value(mini);
    // if this happened we need to save the handlers to the cache
    return component.resolve();
  }
  if (typeof value === "object" && "resolve" in value) return value.resolve();
  return value;
}
export function html(
  stringLiterals: TemplateStringsArray,
  ...values: MiniValue[]
): MiniHtmlString {
  const _cache = new Map<string, CacheObject>();
  const _handlers: ClickHandler[] = []; // this is the wrong place to initialize handlers and cache
  return {
    stringLiterals,
    values,
    resolve: (mini?: Mini) => {
      if (!mini) {
        // we should initialize handlers here (or should we? )
        mini = {
          html,
          click: (name, handler) => {
            return clickHandler(name, handler, _handlers);
          },
          _handlers,
          cache: _cache,
        };
      }

      const resolvedValues: ResolvedMiniValue[] = [];

      for (const unresolvedValue of values) {
        // here we should make ids and push it into cache, so the mini object has the latest handlers
        // handlers attached to cache object
        resolvedValues.push(resolveMiniValue(unresolvedValue, mini));
      }
      return {
        stringLiterals,
        values: resolvedValues,
        render: (target: Element, id?: string, cache?: Cache) => {
          if (!cache) cache = _cache; //and cache here
          return render({
            target,
            stringLiterals,
            resolvedValues,
            cache,
            _handlers,
            id,
          });
        },
      };
    },
    //  resolveMiniHtmlString({ stringLiterals, values })
  };
}
export function makeOrUsePlaceholderFragment(
  stringLiterals: TemplateStringsArray,
  values: ResolvedMiniValue[],
  cache: Cache
) {
  let placeholder = "";
  const ids = [];
  let index = 0;
  const inside = { element: false, singleQuotes: false, doubleQuotes: false };
  //if literals are the same as in cache, we use the old element
  for (const literal of stringLiterals) {
    isInside(literal, inside);
    const id = crypto.randomUUID();
    ids.push(id);
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

  return { placeholderFragment, ids, newPlaceholder: true };
}

export function updateValues(
  placeholderFragment: DocumentFragment,
  values: ResolvedMiniValue[],
  ids: string[],
  cache: Cache
) {
  let index = 0;
  for (const value of values) {
    const id = ids[index];
    index++;
    if (!id) throw new Error(`Could not find id in placeholder for ${value}`);
    const el = placeholderFragment.getElementById(id);
    if (!el) continue;
    // throw new Error(
    //   `Could not find element in placeholder for ${value}, ${id}, ${placeholder}`
    // );

    if (typeof value == "object" && "render" in value) {
      //if values + templatestrings as in cache.get(id) are the same we dont render
      value.render(el);
      //should we call render in the domupdate?
    } else {
      //scheduleDomUpdate({ target: el, text: String(value) });
      el.textContent = String(value);
    }
  }
}

export type RenderArgs = {
  target: Element;
  stringLiterals: TemplateStringsArray;
  resolvedValues: ResolvedMiniValue[];
  cache: Cache;
  _handlers: ClickHandler[];
  id?: string; // implicit in the cache, only value never found in other slots
};

export function render({
  target,
  stringLiterals,
  resolvedValues,
  cache,
  _handlers,
  id,
}: RenderArgs) {
  if (!id) id = crypto.randomUUID();

  const { placeholderFragment, ids, newPlaceholder } =
    makeOrUsePlaceholderFragment(stringLiterals, resolvedValues, cache);

  updateValues(placeholderFragment, resolvedValues, ids, cache);
  // if we still use the same string literals (= html snippet skeleton),
  // we dont need to replace, only values get updated if they changed
  if (newPlaceholder) {
    attachHandlers(placeholderFragment, _handlers);
    replace({ target, replacement: placeholderFragment, cache });
  }
  return { id, cache };
}
export type ClickHandler = {
  cb: (event?: MouseEvent) => void;
  id: string;
  name: string;
};
export function attachHandlers(
  placeholderFragment: DocumentFragment,
  _handlers: ClickHandler[]
) {
  // dont reattach event handlers if they have already been attached
  for (const clickHandler of _handlers) {
    const el = placeholderFragment.getElementById(clickHandler.id);
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
  handlers: ClickHandler[]
) {
  const handler = handlers.find((handler) => handler.name === name);
  if (handler) return handler.id;
  const id = crypto.randomUUID();
  handlers.push({ cb, id, name });
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
function arraysEqual(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((str, index) => str === arr2[index]);
}
