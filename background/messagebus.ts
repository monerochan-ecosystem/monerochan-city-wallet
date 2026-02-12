import { type CacheChangedCallbackParameters } from "@spirobel/monero-wallet-api";
export type WalletCacheChangedEvent = {
  type: "walletCacheChanged";
  payload: CacheChangedCallbackParameters;
};
export type ExtensionMessage =
  | ChangeNodeUrlEvent
  | WalletCacheChangedEvent
  | { type: "ping"; payload?: never }
  | { type: "response"; payload: any };
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
export type ChangeNodeUrlPayload = { nodeUrl: string };
export type ChangeNodeUrlEvent = {
  type: "changeNodeUrl";
  payload: ChangeNodeUrlPayload;
};
export function sendChangeNodeUrlEvent(nodeUrl: string) {
  const msg: ChangeNodeUrlEvent = {
    type: "changeNodeUrl",
    payload: { nodeUrl },
  };
  browser.runtime.sendMessage(msg).catch(() => {});
}
export function receiveChangeNodeUrlEvent(
  msg: ExtensionMessage,
  cb: (payload: ChangeNodeUrlPayload) => void,
) {
  if (msg.type === "changeNodeUrl") {
    cb(msg.payload);
  }
}
