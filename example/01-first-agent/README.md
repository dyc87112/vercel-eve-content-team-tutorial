# 01 First Agent

本目录是《第一个 Agent：全套 Vercel 方案与基础 CLI Chat》的最小样例工程。

它只包含一个 Eve Agent 所需的最小文件：

- `package.json`
- `tsconfig.json`
- `.env.example`
- `agent/agent.ts`
- `agent/instructions.md`

## Requirements

- Node.js 24+
- Vercel AI Gateway API Key

## Run

```bash
npm install
cp .env.example .env
```

编辑 `.env`，填入：

```bash
AI_GATEWAY_API_KEY=...
EVE_GATEWAY_MODEL_ID=minimax/minimax-m3
```

然后启动：

```bash
npm run dev
```

启动后，在 Eve CLI 中发送：

```text
你是谁？你能帮 SpringForAll 做什么？
```
