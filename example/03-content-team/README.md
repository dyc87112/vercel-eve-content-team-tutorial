# 03 Content Team

本目录是《使用 Sub Agent + Skill 构建 AI 内容团队》的最小样例工程。

这一篇从 `eve init` 生成的新项目开始，使用 `eve@^0.13.3`，在第 02 篇自定义 gateway 配置的基础上，增加 SpringForAll 内容团队所需的 skills 和 subagents。

## What You Get

- 一个内容主编 root Agent；
- 默认 Vercel AI Gateway 和可选 OpenAI-Compatible Provider；
- 三个 skills：选题、写作、审核；
- 三个 subagents：researcher、writer、reviewer；
- 一个自定义 gateway 检查脚本；
- 一组用于验证选题、写作、审核全流程的 CLI chat prompts。

这一版暂不包含 sandbox、custom tools、schedules 和 evals。

## Files

```text
example/03-content-team/
  package.json
  tsconfig.json
  .env.example
  scripts/
    check-custom-gateway.mjs
  agent/
    agent.ts
    instructions.md
    lib/
      model.ts
    skills/
      topic_planning.md
      article_writing.md
      review_checklist.md
    subagents/
      researcher/
        agent.ts
        instructions.md
        skills/
          topic_planning.md
      writer/
        agent.ts
        instructions.md
        skills/
          article_writing.md
      reviewer/
        agent.ts
        instructions.md
        skills/
          review_checklist.md
    channels/
      eve.ts
```

- `agent/lib/model.ts`: 复用第 02 篇的模型入口配置，支持 Vercel AI Gateway 和自定义 OpenAI-Compatible Provider。
- `agent/instructions.md`: 把 root Agent 定义为 SpringForAll 内容主编，负责加载 skill 并调度 subagent。
- `agent/skills/*.md`: root Agent 可加载的选题、写作、审核工作流，用来理解整体编排。
- `agent/subagents/*`: researcher、writer、reviewer 三个职责更窄的子 Agent，每个子 Agent 都有自己的 skill 副本和 Markdown 交付格式。

注意：Eve 的 declared subagent 不会继承 root Agent 的 skills。也就是说，root 加载了 `topic_planning`，并不代表 `researcher` 自动拥有这个 skill。所以这个 example 会在对应 subagent 目录下复制一份相关 skill，让每个 specialist 都能独立完成自己的工作。

这个 example 不在 subagent `agent.ts` 中配置 `outputSchema`。Eve 支持给 subagent 使用结构化输出，但在自定义 OpenAI-Compatible gateway、较弱模型或不稳定 JSON schema 支持下，容易出现 `could not produce a result matching the requested schema`。教程样例优先保证完整流程能跑通，所以这里用明确的 Markdown 标题约束交付格式。

root Agent 的 instructions 也明确要求：调用 `researcher`、`writer`、`reviewer` 时只传 `message`，不要传可选的 `outputSchema` 参数。如果某一步失败，应报告失败并询问是否缩小任务重试，而不是主 Agent 悄悄把子 Agent 的工作做完。

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

只要 `EVE_MODEL_BASE_URL` 非空，root Agent 和三个 subagents 都会使用自定义 Provider。否则继续使用 Vercel AI Gateway。

## Check the Custom Gateway

```bash
npm run check:gateway
```

检查流式输出：

```bash
npm run check:gateway -- --stream
```

检查流式 usage：

```bash
npm run check:gateway -- --stream --include-usage
```

## Verify Discovery

先确认 Eve 能发现 root skills 和 subagents：

```bash
npm exec -- eve info
```

预期结果：

- Skills 显示 3 skills；
- Instructions 指向 `agent/instructions.md`。

再运行构建：

```bash
npm run build
```

如果要确认 subagents 也被编译进去，可以检查 compiled manifest：

```bash
rg "subagents/(researcher|writer|reviewer)|skills/(topic_planning|article_writing|review_checklist)" .eve/compile/compiled-agent-manifest.json
```

预期可以看到：

- `researcher`、`writer`、`reviewer` 三个 subagent 节点；
- 每个 subagent 自己的 skill。

## Run the Full Content Flow

启动本地 CLI chat：

```bash
npm run dev
```

发送下面的测试请求：

```text
请用完整内容团队流程，为 SpringForAll 策划、写作并审核一篇文章。

方向：Spring AI 在企业 Java 应用里的落地边界。
要求：
1. 先用 topic_planning 做 3 个候选选题，并请 researcher 给出来源计划和风险。
2. 选择最适合 SpringForAll 读者的一个选题，请 writer 写出标题、摘要、大纲和文章草稿。
3. 请 reviewer 按 review_checklist 审核草稿，给出 pass/revise/block 结论和必须人工核验的事实点。
4. 最后由你整合成一份包含选题 brief、草稿、审核结论的中文结果。
```

预期结果：

- root Agent 会以内容主编身份组织流程；
- 会使用或明确遵循 `topic_planning`、`article_writing`、`review_checklist`；
- 会调用 researcher、writer、reviewer 三个 subagents；
- 输出包含选题 brief、文章草稿和审核结论；
- 不会声称已经自动发布，也不会把未核验内容说成 publish-ready。

## Useful Commands

```bash
npm exec -- eve info
npm run build
npm run typecheck
npm run check:gateway
```

如果你的本机默认 Node 版本低于 24，可以临时把 Node 24 放到 `PATH` 前面：

```bash
PATH=/Users/zhaiyongchao/.nvm/versions/node/v24.11.1/bin:$PATH npm run build
```
