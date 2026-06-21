# 01 First Agent

本目录是《第一个 Agent：全套 Vercel 方案与基础 CLI Chat》的最小样例工程。

这一篇只完成一件事：使用 `eve init` 创建一个能在本地 Eve CLI 中对话的 SpringForAll 内容运营助手。

## What You Get

- 一个主 Agent；
- 一份 always-on instructions；
- 通过 Vercel AI Gateway 调用模型；
- 内置 Eve HTTP channel：`agent/channels/eve.ts`；
- 在本地 `eve dev` TUI 中完成 CLI chat。

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
    channels/
      eve.ts
```

- `agent/agent.ts`: 配置 Agent 使用的模型和上下文窗口。
- `agent/instructions.md`: 定义 Agent 的角色、职责、边界和输出风格。
- `agent/channels/eve.ts`: `eve init` 生成的内置 HTTP / CLI channel。

## Requirements

- Node.js 24+
- Vercel AI Gateway API Key

## Setup

本工程由下面的命令创建：

```bash
npx eve@latest init 01-first-agent
```

如果从仓库中直接运行样例：

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

`agent/agent.ts` 里显式配置了 `modelContextWindowTokens: 200_000`，用于避免 Eve beta 版本暂时无法识别某些 Gateway 模型上下文窗口元数据时构建失败。实际项目中请按所选模型的官方上下文窗口调整。

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
- Agent 能说明它可以辅助选题、文章角度整理、提纲建议等工作；
- Agent 不会声称自己可以自动发布内容。

## Useful Commands

```bash
npm exec -- eve info
npm run build
```

`eve info` 用于查看 Eve 发现的 Agent 文件和编译产物。`npm run build` 用于检查工程是否能完成 Eve 构建。
