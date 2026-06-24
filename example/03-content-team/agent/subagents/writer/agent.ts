import { defineAgent } from "eve";
import { model, modelContextWindowTokens } from "#lib/model.js";

export default defineAgent({
  description:
    "Turn an approved SpringForAll topic brief into title options, an outline, and a practical Chinese technical article draft.",
  model,
  modelContextWindowTokens,
});
