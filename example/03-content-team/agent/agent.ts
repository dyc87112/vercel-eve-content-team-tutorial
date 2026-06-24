import { defineAgent } from "eve";
import { model, modelContextWindowTokens } from "#lib/model.js";

export default defineAgent({
  model,
  modelContextWindowTokens,
});
