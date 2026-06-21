import { defineAgent } from "eve";

const defaultGatewayModelId = "minimax/minimax-m3";

export default defineAgent({
  model: process.env.EVE_GATEWAY_MODEL_ID ?? defaultGatewayModelId,
  modelContextWindowTokens: 200_000,
});
