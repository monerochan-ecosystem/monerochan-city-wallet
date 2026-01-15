import { type CacheChangedCallbackParameters } from "@spirobel/monero-wallet-api";
export type WalletCacheChangedEvent = {
  type: "walletCacheChanged";
  payload: CacheChangedCallbackParameters;
};
export type ExtensionMessage =
  | WalletCacheChangedEvent
  | { type: "ping"; payload?: never }
  | { type: "response"; payload: any };
export function sendWalletChangedEvent(
  payload: CacheChangedCallbackParameters
) {
  const msg: WalletCacheChangedEvent = {
    type: "walletCacheChanged",
    payload,
  };
  browser.runtime.sendMessage(msg).catch(() => {});
}
export function receiveWalletChangedEvent(
  msg: ExtensionMessage,
  cb: (payload: CacheChangedCallbackParameters) => void
) {
  if (msg.type === "walletCacheChanged") {
    cb(msg.payload);
  }
}
