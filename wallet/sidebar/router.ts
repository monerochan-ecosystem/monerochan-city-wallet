import { createRouter, type Mini, type Params } from "../../mininext/mininext";
import { walletRoute } from "./segments/walletRoute";
export type WalletRouteParams =
  Params<"/:identity/:domain/:wallet_type/:wallet_id">;
const routes = {
  "/:identity/:domain/:wallet_type/:wallet_id": (
    params: Params<"/:identity/:domain/:wallet_type/:wallet_id">,
    mini: Mini,
  ) => walletRoute(mini, params),
} as const;

export const router = createRouter(routes);

router.navigate("/main/no_domain/single/0");
