import { defineAgent } from "eve";
import { model, modelContextWindowTokens } from "#lib/model.js";

export default defineAgent({
  description:
    "Research SpringForAll content topics, collect source plans, compare candidate angles, and return evidence-aware topic briefs.",
  model,
  modelContextWindowTokens,
});
