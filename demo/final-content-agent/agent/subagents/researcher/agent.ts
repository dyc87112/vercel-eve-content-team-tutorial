import { defineAgent } from "eve";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const defaultGatewayModelId = "minimax/minimax-m3";
const customBaseURL = process.env.EVE_MODEL_BASE_URL;
const usesCustomGateway = customBaseURL !== undefined && customBaseURL.trim() !== "";

function parseContextWindowTokens(value: string | undefined) {
  if (value === undefined || value.trim() === "") {
    return 128000;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("EVE_MODEL_CONTEXT_WINDOW_TOKENS must be a positive integer.");
  }

  return parsed;
}

function requireCustomModelId() {
  const modelId = process.env.EVE_MODEL_ID;
  if (modelId === undefined || modelId.trim() === "") {
    throw new Error("EVE_MODEL_ID is required when EVE_MODEL_BASE_URL is set.");
  }

  return modelId;
}

const model = usesCustomGateway
  ? createOpenAICompatible({
      name: "custom",
      baseURL: customBaseURL,
      apiKey: process.env.EVE_MODEL_API_KEY,
      includeUsage: true,
    }).chatModel(requireCustomModelId())
  : (process.env.EVE_GATEWAY_MODEL_ID ?? defaultGatewayModelId);

const modelContextWindowTokens = parseContextWindowTokens(process.env.EVE_MODEL_CONTEXT_WINDOW_TOKENS);

export default defineAgent({
  description:
    "Research Java, Spring, and AI engineering topics, collect source anchors, and identify uncertainty before writing.",
  model,
  modelContextWindowTokens,
});
