import {
  getCacheEntry,
  getResolvedMiniHtmlStringThrows,
  type CacheAndCursor,
  type CacheObject,
  type ClickHandler,
  type PrimitiveValue,
  type ResolvedMiniCacheValue,
} from "./minicache";
import { makeNewMini, type Mini, type MiniValue } from "./mininext";
import { render, type StringArray } from "./minirender";

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
  handlers: ClickHandler[] | null
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
      return render(target, cacheAndCursor);
    },
  };
}

export type ResolvedMiniHtmlString = {
  stringLiterals: StringArray;
  values: ResolvedMiniValue[];
  slots: string[];
  handlers: ClickHandler[] | null;
  render: (
    target: Element | DocumentFragment | HTMLElement,
    cacheAndCursor?: CacheAndCursor
  ) => CacheAndCursor;
};
export type ResolvedMiniValue = PrimitiveValue | ResolvedMiniHtmlString;
export function resolveValuesForCache(
  unresolvedValues: MiniValue[],
  cac: CacheAndCursor,
  slots: string[] | null = null
) {
  if (!slots) slots = unresolvedValues.map(() => crypto.randomUUID());
  const values: ResolvedMiniCacheValue[] = unresolvedValues.map(
    (value, index) => {
      const childId = slots[index];
      if (!childId) throw new Error("Could not find slot id for value");

      // CASE: primitive
      if (typeof value === "string" || typeof value === "number") {
        const cacheEntry = cac.cache.get(childId);
        if (cacheEntry) {
          cacheEntry.value = value;
          cacheEntry.dirty = true;
          return value;
        }
        cac.cache.set(childId, { value, dirty: true });
        return value;
      }

      // CASE: child mini htmlstring or component

      return { childId };
    }
  );
  return { slots, values };
}
export function resolve(
  stringLiterals: StringArray,
  unresolvedValues: MiniValue[],
  mini: Mini
): ResolvedMiniHtmlString {
  // CASE our cache entry does not exist yet
  const cac = mini.cacheAndCursor;
  const cacheEntry = getCacheEntry(cac);
  if (!cacheEntry) {
    const { slots, values } = resolveValuesForCache(unresolvedValues, cac);

    cac.cache.set(cac.cursor, {
      value: { stringLiterals, values, slots, handlers: null },
      dirty: true,
    });
  } else {
    const cacheValue = getResolvedMiniHtmlStringThrows(cac);

    const htmlUnchanged = arraysEqual(
      stringLiterals,
      cacheValue.stringLiterals || []
    );
    const { slots, values } = resolveValuesForCache(
      unresolvedValues,
      cac,
      htmlUnchanged
        ? cacheValue.slots
        : unresolvedValues.map(() => crypto.randomUUID())
    );
    if (!htmlUnchanged) {
      //recursively delete all children
      deleteAllChildren(cac);
      cacheValue.stringLiterals = stringLiterals;
      cacheValue.slots = slots;
      cacheEntry.dirty = true;
    }
    cacheValue.values = values;
  }
  // at this point we know the cache entry exists

  const cacheValue = getResolvedMiniHtmlStringThrows(cac);
  const slots = cacheValue.slots;
  const handlers = cacheValue.handlers;
  // we also know slots exist
  if (!slots) throw new Error("slots not found");
  return resolveMiniHtmlString(
    stringLiterals,
    unresolvedValues,
    mini,
    slots,
    handlers
  );
}
function deleteAllChildren(cac: CacheAndCursor) {
  const cacheEntry = getCacheEntry(cac);
  if (!cacheEntry) return;
  if (typeof cacheEntry.value !== "object") {
    cac.cache.delete(cac.cursor); // leaf primitive value
    return;
  }
  const cacheValue = getResolvedMiniHtmlStringThrows(cac);
  if (!cacheValue.slots) return;
  for (const child of cacheValue.slots) {
    deleteAllChildren({ ...cac, cursor: child });
  }
}
function arraysEqual(arr1: StringArray, arr2: StringArray): boolean {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((str, index) => str === arr2[index]);
}
