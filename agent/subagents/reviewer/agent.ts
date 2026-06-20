import { defineAgent } from "eve";

export default defineAgent({
  description:
    "Review SpringForAll drafts for factual safety, reader value, source quality, and publication readiness.",
  model: process.env.EVE_GATEWAY_MODEL_ID ?? "minimax/minimax-m3",
});
