import {
  clickHandler,
  type CacheAndCursor,
  type PrimitiveValue,
} from "./minicache";
import { resolve, type ResolvedMiniHtmlString } from "./miniresolve";
export { renderRoot } from "./minidom";
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

export type MiniComponent = (mini: Mini) => MiniHtmlString;
export type MiniValue = PrimitiveValue | MiniComponent | MiniHtmlString;

export function html(
  stringLiterals: TemplateStringsArray,
  ...values: MiniValue[]
): MiniHtmlString {
  return {
    stringLiterals,
    values,
    resolve: (mini?: Mini): ResolvedMiniHtmlString => {
      return resolve(stringLiterals, values, mini);
    },
  };
}
