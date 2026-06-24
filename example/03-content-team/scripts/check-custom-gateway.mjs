import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnvLocal() {
  const envPath = resolve(".env.local");
  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) {
      continue;
    }

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

loadDotEnvLocal();

const baseURL = process.env.EVE_MODEL_BASE_URL;
const apiKey = process.env.EVE_MODEL_API_KEY;
const model = process.env.EVE_MODEL_ID;

if (!baseURL) {
  console.error("EVE_MODEL_BASE_URL is required.");
  process.exit(1);
}

if (!model) {
  console.error("EVE_MODEL_ID is required.");
  process.exit(1);
}

const endpoint = `${baseURL.replace(/\/+$/, "")}/chat/completions`;
const stream = process.argv.includes("--stream");
const includeUsage = process.argv.includes("--include-usage");

console.log(`Testing OpenAI-compatible chat endpoint: ${endpoint}`);
console.log(`Model: ${model}`);
console.log(`Stream: ${stream}`);
console.log(`Include usage: ${includeUsage}`);

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
  },
  body: JSON.stringify({
    model,
    messages: [{ role: "user", content: "Say OK." }],
    stream,
    ...(stream && includeUsage ? { stream_options: { include_usage: true } } : {}),
    max_tokens: 8,
  }),
});

console.log(`HTTP ${response.status} ${response.statusText}`);

if (stream && response.body) {
  let totalBytes = 0;
  let preview = "";
  let sawDone = false;
  let finishReason;
  let usage;

  for await (const chunk of response.body) {
    const text = Buffer.from(chunk).toString("utf8");
    totalBytes += chunk.length;
    if (preview.length < 2000) {
      preview += text;
    }

    for (const line of text.split(/\r?\n/)) {
      if (!line.startsWith("data:")) {
        continue;
      }

      const data = line.slice("data:".length).trim();
      if (data === "[DONE]") {
        sawDone = true;
        continue;
      }

      try {
        const event = JSON.parse(data);
        const choice = event.choices?.[0];
        if (choice?.finish_reason) {
          finishReason = choice.finish_reason;
        }
        if (event.usage) {
          usage = event.usage;
        }
      } catch {
        // Keep the raw preview useful even when a gateway emits non-JSON events.
      }
    }
  }

  console.log(`Stream bytes: ${totalBytes}`);
  console.log(`Saw [DONE]: ${sawDone}`);
  console.log(`Finish reason: ${finishReason ?? "(missing)"}`);
  console.log(`Usage: ${usage ? JSON.stringify(usage) : "(missing)"}`);
  console.log(preview.slice(0, 2000));
} else {
  const text = await response.text();
  console.log(text.slice(0, 2000));
}

if (!response.ok) {
  process.exit(1);
}
