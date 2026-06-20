# 第一个 Agent：全套 Vercel 方案与基础 CLI Chat

上一篇我们大致看了 Eve 想解决什么问题，也确定了这个系列的第一阶段目标：围绕 SpringForAll 社区内容维护，做出一个可运行的 AI 内容运营 Agent 雏形。

这一篇先不急着做“内容团队”。我们先招聘第一位员工：一个最小可运行的 Eve Agent。

它的能力会很简单：

- 知道自己是 SpringForAll 的内容运营助手；
- 能通过 Vercel AI Gateway 调用模型；
- 能在本地 Eve CLI 里完成一次对话；
- 暂时不引入自定义 Provider、skills、subagents、sandbox、tools、schedules、evals。

对应的完整示例放在：

```text
example/01-first-agent/
```

## 准备环境

Eve 当前要求 Node.js 24 或更高版本。先确认本机版本：

```bash
node -v
```

如果版本低于 24，建议先切换 Node 版本。比如使用 `nvm`：

```bash
nvm install 24
nvm use 24
```

然后准备一个 Vercel AI Gateway API Key。第一篇我们先走全套 Vercel 方案，不处理自定义 OpenAI-Compatible Provider。自定义 Provider 会放到下一篇展开。

## 创建项目目录

进入示例目录：

```bash
cd example/01-first-agent
```

这一篇的最小工程结构是：

```text
example/01-first-agent/
  package.json
  tsconfig.json
  .env.example
  agent/
    agent.ts
    instructions.md
```

这里最重要的是 `agent/` 目录。Eve 的 filesystem-first 设计会把一个目录当成一个 Agent 来组织，其中：

- `agent/agent.ts` 定义 Agent 的运行配置；
- `agent/instructions.md` 定义 Agent 的角色、任务和行为边界。

## 安装依赖

先写 `package.json`：

```json
{
  "name": "eve-first-agent-example",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "The first minimal Eve Agent for the SpringForAll content operations tutorial.",
  "scripts": {
    "dev": "eve dev",
    "build": "eve build",
    "start": "eve start",
    "info": "eve info"
  },
  "engines": {
    "node": ">=24"
  },
  "dependencies": {
    "ai": "latest",
    "eve": "latest",
    "zod": "latest"
  },
  "devDependencies": {
    "@types/node": "latest",
    "typescript": "latest"
  }
}
```

然后安装依赖：

```bash
npm install
```

这里先只保留 Eve 本身和它常见的基础依赖。后面要支持自定义 Provider 时，再增加 `@ai-sdk/openai-compatible`。

## 配置 TypeScript

再写一个最小 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "noEmit": true,
    "allowImportingTsExtensions": false,
    "types": ["node"]
  },
  "include": ["agent/**/*.ts"]
}
```

这一篇的 TypeScript 代码只有 `agent/agent.ts`，所以 `include` 也只需要覆盖 `agent/**/*.ts`。

## 编写第一个 Agent

现在创建 `agent/agent.ts`：

```ts
import { defineAgent } from "eve";

const defaultGatewayModelId = "minimax/minimax-m3";

export default defineAgent({
  model: process.env.EVE_GATEWAY_MODEL_ID ?? defaultGatewayModelId,
});
```

这就是第一个 Agent 的核心配置。

`defineAgent` 接收 Agent 的运行配置。这里我们只配置一个字段：`model`。

第一阶段默认使用 Vercel AI Gateway，所以 `model` 直接写成 Gateway 中的模型 ID。如果环境变量 `EVE_GATEWAY_MODEL_ID` 没有配置，就使用 `minimax/minimax-m3` 作为默认值。

为什么不把模型 ID 写死？因为模型选择经常会调整。即使第一篇只跑最小示例，也建议从一开始就把模型 ID 留成可配置项。

## 编写 instructions

接下来创建 `agent/instructions.md`：

```md
# SpringForAll Content Assistant

You are the first content operations assistant for the SpringForAll community.

Your mission is to help maintain a Chinese technical community for Java and Spring developers.

## Responsibilities

- Explain what you can do for SpringForAll content operations.
- Help brainstorm Java, Spring, Spring AI, Spring Cloud, JVM, backend engineering, and developer tooling topics.
- Keep answers practical and useful for engineers.
- Ask for human confirmation before treating any content as publish-ready.

## Current limits

- You do not have skills yet.
- You do not have subagents yet.
- You do not have custom tools yet.
- You do not publish content automatically.

## Output style

- Write in concise Chinese.
- Use Markdown when structure helps.
```

这份 instructions 先做三件事：

1. 告诉 Agent 它是谁：SpringForAll 的内容运营助手；
2. 告诉 Agent 它能做什么：围绕 Java、Spring、AI 工程实践做内容辅助；
3. 告诉 Agent 它现在不能做什么：没有 skills、subagents、tools，也不能自动发布。

我习惯在早期 instructions 里明确写出限制。这样做不是为了削弱 Agent，而是为了减少误导：第一篇的 Agent 只是起点，它还不是完整内容团队。

## 配置环境变量

创建 `.env.example`：

```bash
EVE_GATEWAY_MODEL_ID=minimax/minimax-m3
AI_GATEWAY_API_KEY=
```

本地运行时复制一份：

```bash
cp .env.example .env
```

然后填入自己的 `AI_GATEWAY_API_KEY`：

```bash
EVE_GATEWAY_MODEL_ID=minimax/minimax-m3
AI_GATEWAY_API_KEY=你的_Vercel_AI_Gateway_Key
```

`EVE_GATEWAY_MODEL_ID` 控制使用哪个 Gateway 模型。`AI_GATEWAY_API_KEY` 是 Vercel AI Gateway 的访问凭据。

`.env` 不应该提交到 Git，所以仓库里只保留 `.env.example`。

## 启动 Eve dev

现在启动本地开发模式：

```bash
npm run dev
```

这个命令实际执行的是：

```bash
eve dev
```

启动成功后，就可以在 Eve CLI 中和 Agent 对话。可以先问一句：

```text
你是谁？你能帮 SpringForAll 做什么？
```

如果一切正常，Agent 应该会用中文回答自己是 SpringForAll 的内容运营助手，并说明它可以帮助做选题 brainstorming、内容方向整理、初稿建议等工作。同时，它不应该声称自己已经能自动发布文章。

![](assets/01-first-agent-1.png)

这一步很重要。我们不是只验证模型能不能返回内容，而是在验证 `instructions.md` 是否真的进入了 Agent 的行为。

## 最小 Eve Agent 由什么组成

到这里，第一个 Agent 已经跑起来了。回头看这个工程，它其实只有几类文件：

```text
example/01-first-agent/
  package.json       # npm 脚本和依赖
  tsconfig.json      # TypeScript 配置
  .env.example       # 环境变量模板
  agent/
    agent.ts         # Agent 运行配置
    instructions.md  # Agent 角色和行为说明
```

这也是 Eve filesystem-first 设计最直观的地方：Agent 不是某个控制台里的配置项，而是代码仓库里一组可以审查、版本管理和逐步演进的文件。

第一篇里，我们先把它控制在最小状态：

- 只有一个主 Agent；
- 只有 Vercel AI Gateway；
- 没有自定义 Provider；
- 没有 skills；
- 没有 subagents；
- 没有 sandbox 配置；
- 没有 tools、schedules 和 evals。

这样做的好处是边界很清楚。后续每增加一个能力，都能看见它解决了什么问题，而不是一上来把所有概念堆在一起。

## 小结

这一篇完成了 SpringForAll 内容运营 Agent 的第一步：

- 能启动 Eve dev；
- 能和 Agent 对话；
- Agent 已经知道自己是 SpringForAll 内容运营助手；
- 暂不引入自定义 Provider、skills、subagents、sandbox、tools、schedules、evals。

本篇对应的样例工程在这里：

- [example/01-first-agent](https://github.com/dyc87112/vercel-eve-content-team-tutorial/tree/main/example/01-first-agent)

如果你觉得这个系列对你了解 Eve 或 Agent 工程化有帮助，欢迎给这个仓库点个 Star，也可以继续关注后面的文章：

- [vercel-eve-content-team-tutorial](https://github.com/dyc87112/vercel-eve-content-team-tutorial)

下一篇，我们会处理一个很现实的问题：如果不想只使用 Vercel AI Gateway，或者希望接入自己的 OpenAI-Compatible Provider，Agent 的模型配置应该怎么设计？

这会引出模型选择、base URL、API key、上下文窗口和 token 预算这些更工程化的问题。
