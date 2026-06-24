import { defineAgent } from "eve";
import { model, modelContextWindowTokens } from "#lib/model.js";

export default defineAgent({
  description:
    "Review SpringForAll article drafts for audience fit, technical correctness, evidence gaps, editorial quality, and publish readiness.",
  model,
  modelContextWindowTokens,
});
