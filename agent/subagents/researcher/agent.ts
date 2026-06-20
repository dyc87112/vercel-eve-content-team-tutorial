import { defineAgent } from "eve";

export default defineAgent({
  description:
    "Research Java, Spring, and AI engineering topics, collect source anchors, and identify uncertainty before writing.",
  model: process.env.EVE_GATEWAY_MODEL_ID ?? "minimax/minimax-m3",
});
