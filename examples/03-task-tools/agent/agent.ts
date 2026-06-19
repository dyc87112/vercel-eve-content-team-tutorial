import { defineAgent } from "eve";

export default defineAgent({
  model: "minimax/minimax-m3",
  modelContextWindowTokens: 32768,
});
