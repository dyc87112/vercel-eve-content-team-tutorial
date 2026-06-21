# 01 First Agent

本目录是《第一个 Agent：全套 Vercel 方案与基础 CLI Chat》的最小样例工程。

这一篇只完成一件事：创建一个能在本地 Eve CLI 中对话的 SpringForAll 内容运营助手。

## What You Get

- 一个主 Agent；
- 一份 always-on instructions；
- 通过 Vercel AI Gateway 调用模型；
- 在本地 `eve dev` 中完成 CLI chat。

这一版暂不包含自定义 Provider、skills、subagents、sandbox、tools、schedules 和 evals。

## Files

```text
example/01-first-agent/
  package.json
  tsconfig.json
  .env.example
  agent/
    agent.ts
    instructions.md
```

- `agent/agent.ts`: 配置 Agent 使用的模型。
- `agent/instructions.md`: 定义 Agent 的角色、职责、边界和输出风格。

## Requirements

- Node.js 24+
- Vercel AI Gateway API Key

## Setup

```bash
npm install
cp .env.example .env
```

编辑 `.env`，填入自己的 Vercel AI Gateway Key：

```bash
EVE_GATEWAY_MODEL_ID=minimax/minimax-m3
AI_GATEWAY_API_KEY=你的_Vercel_AI_Gateway_Key
```

`EVE_GATEWAY_MODEL_ID` 可以换成你在 Vercel AI Gateway 中可用的模型 ID。

## Run

```bash
npm run dev
```

启动后，在 Eve CLI 中发送：

```text
你是谁？你能帮 SpringForAll 做什么？
```

预期结果：

- Agent 用中文回答；
- Agent 知道自己是 SpringForAll 内容运营助手；
- Agent 能说明它可以辅助选题、内容方向整理、初稿建议等工作；
- Agent 不会声称自己可以自动发布内容。

## Useful Commands

```bash
npm run info
npm run build
```

`npm run info` 用于查看 Eve 发现的 Agent 文件和编译产物。`npm run build` 用于检查工程是否能完成 Eve 构建。

如果命令提示 Node 版本不满足要求，请先切换到 Node.js 24 或更高版本。
