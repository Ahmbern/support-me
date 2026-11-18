import { z } from "zod";
import { assetCode, txHash } from "./common";

export const listWithdrawalsQuerySchema = z.object({
  creatorUsername: z.string().optional(),
});

// The SEP-24 withdraw transaction statuses this app's anchor integration can
// report, per https://stellar.org/protocol/sep-24#transaction-status.
// Restricting to this enum (#393) means later code can switch on `status`
// exhaustively instead of trusting an arbitrary client-supplied string.
export const sep24WithdrawStatus = z.enum([
  "incomplete",
  "pending_user_transfer_start",
  "pending_anchor",
  "pending_stellar",
  "pending_external",
  "completed",
  "refunded",
  "expired",
  "no_market",
  "too_small",
  "too_large",
  "error",
]);

export const createWithdrawalSchema = z.object({
  creatorUsername: z.string().min(1, "creatorUsername is required"),
  amountIn: z.coerce.number().positive("amountIn must be a positive number"),
  amountOut: z.coerce.number().nonnegative().optional(),
  fee: z.coerce.number().nonnegative().optional(),
  currency: assetCode.default("USDC"),
  anchorTxId: z.string().min(1, "anchorTxId is required").max(128),
  stellarTxId: txHash.optional(),
  status: sep24WithdrawStatus.default("completed"),
});
