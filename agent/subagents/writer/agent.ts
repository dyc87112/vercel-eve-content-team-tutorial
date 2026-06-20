import { defineAgent } from "eve";

export default defineAgent({
  description:
    "Write practical Chinese technical article drafts for SpringForAll from a selected brief and source notes.",
  model: process.env.EVE_GATEWAY_MODEL_ID ?? "minimax/minimax-m3",
});
