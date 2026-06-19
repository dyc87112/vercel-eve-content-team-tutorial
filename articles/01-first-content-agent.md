---
title: "一个目录就是一名员工：用 Eve 创建 SpringForAll 的第一位 AI 内容负责人"
account: "程序猿DD"
channel: "微信公众号"
column: "深度原创"
status: "draft"
language: "zh-CN"
created_at: "2026-06-19"
series: "用 Vercel Eve 搭建一支 AI 内容运营团队"
series_order: 1
series_repo: "https://github.com/dyc87112/vercel-eve-content-team-tutorial"
example_path: "examples/01-first-agent"
source_urls:
  - "https://github.com/vercel/eve/blob/main/docs/getting-started.mdx"
  - "https://github.com/vercel/eve/blob/main/docs/instructions.mdx"
  - "https://github.com/vercel/eve/blob/main/docs/guides/frontend/overview.mdx"
---

# 一个目录就是一名员工：用 Eve 创建 SpringForAll 的第一位 AI 内容负责人

> 上一篇我们介绍了 Vercel 新发布的 Agent 框架 Eve。接下来不再停留在功能列表，而是用它解决一个真实问题：为没时间维护的 SpringForAll 社区，搭建一支能够策划、写作、审校和交付内容的 AI 运营团队。

这支团队当然不会一开始就有六个 Agent。

我们先招聘第一位员工：**内容负责人 Coordinator**。

这一篇完成后，你将得到一个可以在浏览器中对话的 Eve Agent。它能理解内容任务，判断资料是否充分，并给出一份结构化的执行计划。

最终系统还会拥有选题策划、Java 技术研究、技术写作、内容审校等岗位。但在继续加人之前，我们要先让这位负责人知道三件事：

1. 自己是谁；
2. SpringForAll 是什么；
3. 收到任务以后应该怎么回应。

## 先看本篇要完成的结果

项目启动后，我们会在页面中提交这样一条任务：

```text
我们希望为 SpringForAll 写一篇 Spring AI 入门教程。

目标读者是使用过 Spring Boot、但还没有接触过 Spring AI 的 Java 开发者，
文章希望包含一个最小可运行示例。

请先分析任务，给出执行计划和开始写作前需要确认的信息，暂时不要撰写正文。
```

内容负责人应该返回类似下面的结果：

```text
任务类型：Spring Boot 实战教程
目标读者：了解 Spring Boot、尚未使用过 Spring AI 的 Java 开发者

建议流程：
1. 确认 Spring Boot、Spring AI 和 JDK 版本
2. 整理最小可运行示例
3. 设计文章大纲
4. 撰写配置与代码步骤
5. 检查依赖和代码一致性
6. 生成发布稿与检查清单

当前缺少：
- Spring AI 版本和官方资料
- 示例要解决的具体问题
- 是否需要提供完整源码

状态：等待补充资料，尚未开始写作
```

这一阶段的内容负责人还不会直接完成文章，也没有其他 Agent 可以委派。我们先验证它能否正确理解角色和工作边界，再逐步增加能力。否则一开始就引入多个 Agent，出现问题时很难判断是角色定义、任务拆分，还是上下文传递出了偏差。

## 准备环境

按照 Eve 当前官方文档，开发环境需要：

- Node.js 24 或更高版本；
- npm；
- 一个可用的模型凭据。

Eve 脚手架的默认模型通过 Vercel AI Gateway 调用，需要配置 `AI_GATEWAY_API_KEY`；也可以使用 `vercel link` 获取 `VERCEL_OIDC_TOKEN`。如果改用模型厂商的直连方式，则需要安装对应的 AI SDK Provider，并设置相应 API Key。

本文使用 Vercel AI Gateway。先确认 Node.js 版本：

```bash
node --version
```

如果输出低于 24，需要先升级，并确认执行 `npx`、`npm` 时使用的也是 Node.js 24。电脑中同时安装多个 Node.js 版本时，当前终端的 `PATH` 仍可能指向旧版本。

模型凭据可以稍后写入项目的 `.env.local`。这里先准备好 AI Gateway API Key；如果已经将项目连接到 Vercel，也可以使用 OIDC 凭据。

Eve 目前仍处于 beta，API 和项目结构可能继续调整。本文验证日期为 2026 年 6 月 19 日，实际操作时建议同时查看项目安装后自带的 `node_modules/eve/docs/`。

## 创建带 Web 页面的 Eve 项目

运行下面的命令：

```bash
npx eve@latest init springforall-content-team --channel-web-nextjs
```

这里额外增加了 `--channel-web-nextjs`，因为我们的最终目标不是做一个只能在终端运行的工作流，而是一个可操作的内容运营台。

本文基于 Eve `0.11.6`。`init` 会完成以下工作：

- 创建项目目录；
- 安装依赖；
- 在不属于现有仓库时初始化 Git；如果目标目录已经位于 Git 工作区内则跳过；
- 创建基础 Agent；
- 加入内置 HTTP channel；
- 创建 Next.js Web Chat。

初始化完成后进入项目：

```bash
cd springforall-content-team
```

如果脚手架自动进入了开发界面，先按 `Ctrl+C` 停止服务，再继续修改文件。

此时项目里最重要的是 `agent/`：

```text
springforall-content-team/
├── agent/
│   ├── agent.ts
│   ├── instructions.md
│   └── channels/
├── app/
├── package.json
└── next.config.ts
```

在 Eve 中，Agent 的核心能力都围绕这个目录组织。现在我们只有一位内容负责人，所以只有一个 Agent 根目录。后续新增其他岗位时，它们会进入 `agent/subagents/`。

## 补齐环境变量

在项目根目录创建 `.env.example`：

```dotenv
AI_GATEWAY_API_KEY=
```

再复制一份本地配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入真实凭据：

```dotenv
AI_GATEWAY_API_KEY="你的 API Key"
```

同时确认 `.gitignore` 中包含：

```gitignore
.env*
!.env.example
```

这样既能提交不含密钥的配置模板，又不会把 `.env.local` 带进 Git。另一种方式是运行 `npm exec -- eve link`，让 Eve 从已连接的 Vercel 项目中读取 OIDC 凭据。

## 处理本地开发地址

Next.js 开发服务器通常显示 `http://localhost:3000`。如果改用 `127.0.0.1` 访问，开发模式可能阻止客户端资源接管页面，表单提交后地址栏只出现 `?message=...`，却没有创建 Eve session。

为了同时支持两种本地地址，在 `next.config.ts` 中加入 `allowedDevOrigins`：

```ts
import type { NextConfig } from "next";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
};

export default withEve(nextConfig);
```

完成配置后，`localhost` 和 `127.0.0.1` 都可以正常提交消息。如果页面提示 `AI Gateway received no credentials`，说明前端与 Eve 路由已经接通，但 `.env.local` 中还没有有效凭据。

还有一个可选调整：Web Chat 模板通过 `next/font` 加载 Google Fonts，受限网络可能导致 `next build` 失败。希望构建过程完全不依赖在线字体时，可以移除 `next/font/google`，并在 `globals.css` 中改用系统字体。这个改动不影响 Eve 功能，配套项目已经采用这种方式。

## 配置模型

打开 `agent/agent.ts`。它负责定义 Agent 使用的模型和运行配置：

```ts
import { defineAgent } from "eve";

export default defineAgent({
  model: "minimax/minimax-m3",
});
```

这里选择价格相对较低的 `minimax/minimax-m3`，方便后续反复调试多 Agent 工作流。字符串形式的模型 ID 会通过 Vercel AI Gateway 路由，因此继续使用前面配置的 `AI_GATEWAY_API_KEY` 即可。实际项目可以根据质量、成本和数据合规要求替换模型。

这里值得注意的是，模型配置和角色指令是分开的：

- `agent.ts` 决定使用哪个模型；
- `instructions.md` 决定这名 Agent 是谁、长期遵守什么规则。

以后更换模型，不需要重写岗位说明；调整岗位职责，也不需要碰模型接入代码。

## 写下第一份岗位说明

接下来修改 `agent/instructions.md`：

```md
# Role

You are the content operations coordinator for SpringForAll, a community for
Spring and Java developers.

You receive content requests, clarify the goal, plan the work, coordinate
specialist agents when they are available, and deliver the final result.

# Standing rules

- Serve Spring and Java developers. Prefer practical tutorials, integration
  guides, and useful engineering explanations.
- Never invent versions, APIs, configuration keys, benchmark numbers, source
  links, or runnable results.
- Treat information provided by the user as the factual boundary of the task.
- If the materials are insufficient, state exactly what is missing and stop
  before drafting technical claims.
- Do not write a full article when the user asks for planning or analysis.
- Do not produce an article outline unless the user explicitly asks for one.
- Keep intermediate artifacts separate: topic proposal, research brief,
  outline, draft, review report, and final package.
- Content is never considered published. A human must approve the final result.
- Reply in Chinese unless the user requests another language.

# First response to a new content task

Keep the response concise and return only:

1. task type;
2. target reader;
3. expected deliverables;
4. proposed workflow;
5. missing information;
6. current status.
```

这里使用英文并非 Eve 的要求，中文 instructions 同样可以工作。示例使用英文，是为了让岗位规则保持紧凑，也便于未来复用到不同语言的内容任务。

更重要的是这份 instructions 的内容边界。

它放的是长期不变的规则：身份、职责、事实要求、人工确认边界和第一次响应的结构。至于「如何策划一篇教程」「怎样做技术审校」这类更具体的操作流程，留到后续真正需要这些能力时再加入，不必让第一位员工在入职当天背下整套内容 SOP。

## 启动内容负责人

运行：

```bash
npm run dev
```

带 Next.js Web Chat 的项目会启动浏览器可访问的页面。打开终端输出中的本地地址，在输入框中发送：

```text
我们希望为 SpringForAll 写一篇 Spring AI 入门教程。

目标读者是使用过 Spring Boot、但还没有接触过 Spring AI 的 Java 开发者，
文章希望包含一个最小可运行示例。

请先分析任务，给出执行计划和开始写作前需要确认的信息，暂时不要撰写正文。
```

这段消息就是本篇的测试任务。我们暂时不让 Agent 读取本地资料或调用工具，而是先验证最基础的链路：页面能否创建 session，模型能否收到岗位说明，并按照约定返回结果。

这次验证重点关注四项行为：

1. 它有没有正确识别 SpringForAll 的读者；
2. 它有没有把任务判断为实战教程；
3. 它有没有遵守「当前只规划、不写正文」；
4. 它有没有指出版本、官方资料和示例代码缺失。

具体措辞可能随模型调用发生变化，但行为边界应该保持稳定。如果它直接生成了完整教程，应先回到 instructions 检查任务边界，而不是继续添加 Agent。先把负责人的决策行为调稳定，后续的多 Agent 协作才有可靠基础。

## 页面背后发生了什么

这个 Web 页面并不是一个和 Eve 无关的聊天壳。

Eve 的 Next.js 集成会把 Agent 的 HTTP 路由挂载到同一站点，前端通过 `useEveAgent()`：

- 创建会话；
- 发送用户消息；
- 接收流式事件；
- 在后续消息中继续对话。

因此，这个页面不是与 Eve 无关的聊天外壳。消息从浏览器发送给刚才定义的内容负责人，模型产生的结果再以流式方式显示出来。到这一篇为止，理解这条链路已经足够；页面如何继续演变成内容运营台，留到后续真正改造界面时再展开。

## 本篇完成了什么

到这里，我们只配置了模型、岗位说明和浏览器入口，但已经完成了整个系统的第一层基础结构：

- 一个能运行的 Eve 项目；
- 一个浏览器操作入口；
- 一位职责明确的内容负责人；
- 一个可以重复执行的对话任务；
- 一组可观察的行为验收条件。

这些基础工作比一次性生成文章更重要。我们的目标不是做一个写作 Prompt，而是构建一支能够稳定协作、可以被观察和评测的内容团队。

下一篇将解决两个问题：

> 内容负责人怎样读取本地资料，并把分析结果保存成可以继续流转的内容资产？

为此，我们会建立 `inbox → workspace → outputs` 的内容任务目录，让 Agent 能够读取资料并保存阶段成果。相关的运行机制和代码修改，留到下一篇结合这个场景完整展开。

---

## 本篇检查清单

- [ ] Node.js 版本不低于 24
- [ ] 已配置可用模型凭据
- [ ] 使用 `--channel-web-nextjs` 创建项目
- [ ] `agent/agent.ts` 已配置模型
- [ ] `agent/instructions.md` 已定义内容负责人
- [ ] 页面可以发起并继续 Eve session
- [ ] Agent 能按照固定结构分析测试任务
- [ ] Agent 在资料不足时没有直接编造技术正文

## 参考资料

- [Eve：Getting Started](https://github.com/vercel/eve/blob/main/docs/getting-started.mdx)
- [Eve：Instructions](https://github.com/vercel/eve/blob/main/docs/instructions.mdx)
- [Eve：Frontend Overview](https://github.com/vercel/eve/blob/main/docs/guides/frontend/overview.mdx)
