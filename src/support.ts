// ── Support settings ───────────────────────────────────────────────────────
// Fill these in and redeploy. Anything left empty is simply not shown.
//
// DODO_LINK: the payment link for your product, copied from the Dodo Payments
// dashboard (create a product — "pay what you want" suits donations — then
// copy its payment link). No server is needed: Dodo hosts the checkout.
//
// WALLETS: paste each address exactly. Double-check them — crypto sent to a
// wrong address, or on a different network than the one named, is gone.

export const DODO_LINK = "https://dodo.pe/doomsday";

export interface Wallet {
  coin: string;
  network: string; // shown to the sender so they pick the right one
  address: string;
}

export const WALLETS: Wallet[] = [
  { coin: "Bitcoin (BTC)", network: "Bitcoin network", address: "" },
  { coin: "Ethereum (ETH)", network: "Ethereum mainnet (ERC-20)", address: "0x802389e8e8f487560e6253d2efc5889b19a41784" },
  { coin: "USDT", network: "Tron (TRC-20)", address: "" },
  { coin: "Solana (SOL)", network: "Solana network", address: "GpUe56V3QJZyK3WZaCwQe2Ze3Be3pgw14vQorR59b15A" },
];
