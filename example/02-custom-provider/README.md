# 02 Custom Provider

本目录是《接入自定义 AI Provider：Gateway、Coding Plan 与 Token Plan》的最小样例工程。

这一篇在第一个 Agent 的基础上只做一件事：保留 Vercel AI Gateway 默认路径，同时允许切换到自己的 OpenAI-Compatible Provider。

## What You Get

- 一个主 Agent；
- 一份 always-on instructions；
- 默认通过 Vercel AI Gateway 调用模型；
- 可通过环境变量切换到自定义 OpenAI-Compatible Provider；
- 一个独立的 gateway 检查脚本；
- 在本地 `eve dev` TUI 中继续完成 CLI chat。

这一版暂不包含 skills、subagents、sandbox、tools、schedules 和 evals。

## Files

```text
example/02-custom-provider/
  package.json
  tsconfig.json
  .env.example
  scripts/
    check-custom-gateway.mjs
  agent/
    agent.ts
    instructions.md
    channels/
      eve.ts
```

- `agent/agent.ts`: 配置 Vercel AI Gateway 和自定义 Provider 两条模型路径。
- `agent/instructions.md`: 沿用第一个 Agent 的角色、职责、边界和输出风格。
- `scripts/check-custom-gateway.mjs`: 在启动 Eve 之前检查自定义 gateway 是否兼容 `/chat/completions`。

## Requirements

- Node.js 24+
- Vercel AI Gateway API Key，或一个 OpenAI-Compatible Provider

## Setup

```bash
npm install
cp .env.example .env.local
```

默认使用 Vercel AI Gateway：

```bash
EVE_GATEWAY_MODEL_ID=minimax/minimax-m3
AI_GATEWAY_API_KEY=你的_Vercel_AI_Gateway_Key
```

如果要切换到自定义 OpenAI-Compatible Provider，设置：

```bash
EVE_MODEL_BASE_URL=https://api.example.com/v1
EVE_MODEL_API_KEY=your-api-key
EVE_MODEL_ID=your-model-id
EVE_MODEL_CONTEXT_WINDOW_TOKENS=128000
```

只要 `EVE_MODEL_BASE_URL` 非空，Agent 就会使用自定义 Provider。否则继续使用 Vercel AI Gateway。

`EVE_MODEL_CONTEXT_WINDOW_TOKENS` 是当前模型的上下文窗口预算。自定义或新接入的模型不一定能被 Eve 自动识别上下文窗口，所以这里显式配置一个保守值。请按你实际使用的模型调整它。

## Check the Custom Gateway

在启动 Eve 之前，可以先检查自定义 gateway：

```bash
npm run check:gateway
```

脚本会读取 `.env.local`，请求：

```text
${EVE_MODEL_BASE_URL}/chat/completions
```

并发送一个最小请求：

```text
Say OK.
```

如果要检查流式输出：

```bash
npm run check:gateway -- --stream
```

如果 gateway 支持流式 usage：

```bash
npm run check:gateway -- --stream --include-usage
```

这个检查脚本不会替代 Eve 本身的验证，但它能提前发现 base URL、模型 ID、鉴权、流式返回和 usage 兼容性问题。

## Run

先检查 Eve 是否能发现 Agent：

```bash
npm exec -- eve info
```

再运行构建：

```bash
npm run build
```

最后启动本地 CLI chat：

```bash
npm run dev
```

启动后，在 Eve CLI 中发送：

```text
你是谁？你现在使用的是哪种模型配置方式？
```

预期结果：

- Agent 用中文回答；
- Agent 知道自己是 SpringForAll 内容运营助手；
- Agent 不会声称自己已经具备搜索、自动发布或完整内容团队能力；
- 模型调用路径由当前环境变量决定。

## Useful Commands

```bash
npm exec -- eve info
npm run build
npm run check:gateway
```

如果你的本机默认 Node 版本低于 24，可以临时把 Node 24 放到 `PATH` 前面：

```bash
PATH=/Users/zhaiyongchao/.nvm/versions/node/v24.11.1/bin:$PATH npm run build
```
