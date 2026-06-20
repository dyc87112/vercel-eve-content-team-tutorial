import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.EVE_GATEWAY_MODEL_ID ?? "minimax/minimax-m3",
});
