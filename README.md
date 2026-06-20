# SpringForAll Content Agent

This is a finished prototype for the article series:

> Build a durable content creation agent with Vercel Eve.

The agent helps the SpringForAll community resume technical publishing around Java, Spring, and practical AI engineering.

## Run locally

```bash
npm install
npm run dev
```

## Model configuration

This prototype uses Vercel AI Gateway. Configure the model id and Gateway credential:

```bash
export EVE_GATEWAY_MODEL_ID=minimax/minimax-m3
export AI_GATEWAY_API_KEY=...
```

If `EVE_GATEWAY_MODEL_ID` is omitted, the app uses `minimax/minimax-m3`.

## Try it

Ask:

```text
帮我为 SpringForAll 社区生成本周 5 个 Java / Spring / AI 方向选题，并挑一个写成公众号初稿。
```

## Demo without a model

```bash
npm run demo
```
