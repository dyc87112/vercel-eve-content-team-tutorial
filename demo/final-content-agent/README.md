# SpringForAll Content Agent Final Demo

This is the finished demo prototype for the article series:

> Build a durable content creation agent with Vercel Eve.

The agent helps the SpringForAll community resume technical publishing around Java, Spring, and practical AI engineering.

Run commands in this directory:

```bash
cd demo/final-content-agent
```

## Run locally

```bash
npm install
npm run dev
```

## Model configuration

By default this prototype uses Vercel AI Gateway:

```bash
export EVE_GATEWAY_MODEL_ID=minimax/minimax-m3
export AI_GATEWAY_API_KEY=...
```

If `EVE_GATEWAY_MODEL_ID` is omitted, the app uses `minimax/minimax-m3`.

To use your own OpenAI-compatible gateway instead:

```bash
export EVE_MODEL_BASE_URL=https://api.example.com/v1
export EVE_MODEL_API_KEY=...
export EVE_MODEL_ID=your-model-id
export EVE_MODEL_CONTEXT_WINDOW_TOKENS=128000
```

When `EVE_MODEL_BASE_URL` is set, the root agent and all subagents use `@ai-sdk/openai-compatible`.

`EVE_MODEL_CONTEXT_WINDOW_TOKENS` defaults to `128000`. Set it explicitly when using custom or unlisted models because Eve cannot always read their context window from the Vercel AI Gateway model catalog.

Important: `EVE_MODEL_BASE_URL` must be the OpenAI-compatible API prefix. The AI SDK appends `/chat/completions` automatically. For example:

```bash
# Good
export EVE_MODEL_BASE_URL=https://api.example.com/v1

# Bad
export EVE_MODEL_BASE_URL=https://api.example.com/v1/chat/completions
```

You can test the custom gateway directly before running Eve:

```bash
npm run check:gateway
```

## Try it

Ask:

```text
帮我为 SpringForAll 社区生成本周 5 个 Java / Spring / AI 方向选题，并挑一个写成公众号初稿。
```

## Demo without a model

```bash
npm run demo
```
