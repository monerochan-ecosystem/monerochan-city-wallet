import { type CacheChangedCallbackParameters } from "@spirobel/monero-wallet-api";
export type ExtensionMessage =
  | ChangeNodeUrlStartHeightEvent
  | WalletCacheChangedEvent
  | WalletWipeEvent
  | WalletSetupFinishedEvent;
export type WalletCacheChangedEvent = {
  type: "walletCacheChanged";
  payload: string;
};

export function sendWalletChangedEvent(
  payload: CacheChangedCallbackParameters,
) {
  const msg: WalletCacheChangedEvent = {
    type: "walletCacheChanged",
    payload: JSON.stringify(payload, (key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  };
  browser.runtime.sendMessage(msg).catch(() => {});
}
export function receiveWalletChangedEvent(
  msg: ExtensionMessage,
  cb: (payload: CacheChangedCallbackParameters) => void,
) {
  if (msg.type === "walletCacheChanged") {
    cb(
      JSON.parse(msg.payload, (key, value) => {
        if (key === "amount") return BigInt(value);
        return value;
      }),
    );
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

export type WalletSetupFinishedEvent = {
  type: "walletSetupFinished";
  payload: null;
};
export function sendWalletSetupFinishedEvent() {
  const msg: WalletSetupFinishedEvent = {
    type: "walletSetupFinished",
    payload: null,
  };
  browser.runtime.sendMessage(msg).catch(() => {});
}

export function receiveWalletSetupFinishedEvent(
  msg: ExtensionMessage,
  cb: () => void,
) {
  if (msg.type === "walletSetupFinished") {
    cb();
  }
}
