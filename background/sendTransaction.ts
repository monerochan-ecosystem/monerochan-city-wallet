import type { ManyScanCachesOpened } from "@spirobel/monero-wallet-api";
import type { SendTransactionPayload } from "./messagebus";

export async function defaultHappyPathSend(
  payload: SendTransactionPayload,
  wallets?: ManyScanCachesOpened,
) {
  if (!wallets?.wallets)
    throw new Error("no opened wallets, can't make & send transaction.");
  const wallet = wallets.wallets.find(
    (w) => w.primary_address === payload.wallet_to_send_from_pa,
  );
  if (!wallet)
    throw new Error(
      "specified wallet not found, can't make & send transaction.",
    );
  const tx = await wallet.makeStandardTransaction(
    payload.address,
    payload.amount,
  );
  const signed = await wallet.signTransaction(tx);
  const result = await wallet.sendTransaction(signed);
  return result;
}
