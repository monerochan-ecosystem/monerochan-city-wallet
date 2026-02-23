import { type CacheChangedCallbackParameters } from "@spirobel/monero-wallet-api";
export type ExtensionMessage =
  | ChangeNodeUrlStartHeightEvent
  | WalletCacheChangedEvent
  | WalletWipeEvent
  | { type: "ping"; payload?: never }
  | { type: "response"; payload: any };
export type WalletCacheChangedEvent = {
  type: "walletCacheChanged";
  payload: CacheChangedCallbackParameters;
};

export function sendWalletChangedEvent(
  payload: CacheChangedCallbackParameters,
) {
  const msg: WalletCacheChangedEvent = {
    type: "walletCacheChanged",
    payload,
  };
  browser.runtime.sendMessage(msg).catch(() => {});
}
export function receiveWalletChangedEvent(
  msg: ExtensionMessage,
  cb: (payload: CacheChangedCallbackParameters) => void,
) {
  if (msg.type === "walletCacheChanged") {
    cb(msg.payload);
  }
}
export type ChangeNodeUrlStartHeightPayload = {
  nodeUrl?: string;
  start_height?: number;
};
export type ChangeNodeUrlStartHeightEvent = {
  type: "changeNodeUrlStartHeight";
  payload: ChangeNodeUrlStartHeightPayload;
};
export function sendChangeNodeUrlStartHeightEvent(
  nodeUrl?: string,
  start_height?: number,
) {
  const msg: ChangeNodeUrlStartHeightEvent = {
    type: "changeNodeUrlStartHeight",
    payload: { nodeUrl, start_height },
  };
  browser.runtime.sendMessage(msg).catch(() => {});
}
export function receiveChangeNodeUrlStartHeightEvent(
  msg: ExtensionMessage,
  cb: (payload: ChangeNodeUrlStartHeightPayload) => void,
) {
  if (msg.type === "changeNodeUrlStartHeight") {
    cb(msg.payload);
  }
}

export type WalletWipeEvent = {
  type: "walletWipe";
  payload: null;
};
export function sendWalletWipeEvent() {
  const msg: WalletWipeEvent = {
    type: "walletWipe",
    payload: null,
  };
  browser.runtime.sendMessage(msg).catch(() => {});
}

export function receiveWalletWipeEvent(msg: ExtensionMessage, cb: () => void) {
  if (msg.type === "walletWipe") {
    cb();
  }
}
