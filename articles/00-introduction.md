---
title: "Vercel 又想复制 Next.js？这次它盯上了 AI Agent"
account: "程序猿DD"
channel: "微信公众号"
column: "深度原创"
status: "draft"
language: "zh-CN"
created_at: "2026-06-19"
series: "用 Vercel Eve 搭建一支 AI 内容运营团队"
series_order: 0
series_repo: "https://github.com/dyc87112/vercel-eve-content-team-tutorial"
source_urls:
  - "https://vercel.com/blog/introducing-eve"
  - "https://vercel.com/eve"
  - "https://github.com/vercel/eve"
  - "https://beta.eve.dev/docs"
---

# Vercel 又想复制 Next.js？这次它盯上了 AI Agent

> 2026 年 6 月 17 日，Vercel 发布了开源 Agent 框架 Eve。官方给它的定位很直接：像 Next.js 之于 Web 应用一样，Eve 想给 Agent 提供一套约定明确、可直接进入生产环境的框架。但它真正想解决的，并不是「怎么再写一个 Agent Loop」，而是 Agent 跑起来之后那一大堆没人愿意重复造的基础设施。

先说我的判断：

**Eve 值得关注，但不是因为它又提供了一种调用大模型和 Tool Calling 的写法。**

它真正有意思的地方，是把 Durable Workflow、Sandbox、人工审批、子 Agent、渠道接入、Tracing 和 Evals 这些过去需要开发者自己拼装的能力，收进了一个文件系统优先的框架里。

换句话说，Eve 想解决的不是：

> 怎么让模型多思考几轮？

而是：

> 怎么把一个已经能工作的 Agent，变成可以部署、可以暂停恢复、可以控制权限、可以观察和评测的生产系统？

这两个问题，看起来很像，工程量却完全不在一个级别。

## Agent Demo 很多，真正能上线的却不多

现在做一个 Agent Demo 已经不难了。

写一个系统提示词，准备几个工具，调用模型，让它在「思考—调用工具—读取结果—继续思考」之间循环，一个能查数据、搜网页或者操作文件的 Agent 很快就能跑起来。

但只要准备把它放进真实业务，问题马上就来了：

- 一个任务跑了半小时，中途进程重启怎么办？
- Agent 等用户批准时，连接要一直挂着吗？
- 模型生成的脚本，敢不敢直接在应用服务器上执行？
- 查询日志可以自动做，回滚生产版本是不是也能自动做？
- 同一个 Agent 要接 Web、Slack 和 API，是不是每个入口都要重写一套？
- Agent 做错以后，怎么知道它当时看到了什么、调用了什么工具？
- 改了一句 instructions，怎么确认旧能力没有悄悄退化？

这些问题没有一个能靠「再优化一下 Prompt」解决。

过去大家通常要自己把模型 SDK、工作流引擎、任务队列、状态存储、沙箱、OAuth、审批页面、日志系统和评测框架拼起来。Demo 的代码可能只有几百行，包住它的生产基础设施却很容易膨胀成另一个项目。

这正是 Eve 选择切入的位置。

Vercel 在[发布文章](https://vercel.com/blog/introducing-eve)中把 Eve 称为一个用于构建、运行和扩展 Agent 的开源框架，并列出了 durable execution、sandboxed compute、human-in-the-loop approvals、subagents 和 evals 等内置能力。

这份能力清单透露了一个很明确的信号：Vercel 并不满足于提供一次模型调用，它想把 Agent 的整个运行环境一起定义下来。

## Eve 最显眼的设计：一个目录就是一个 Agent

Eve 的第一个特点是 filesystem-first。

一个典型项目大致长这样：

```text
my-agent/
└── agent/
    ├── agent.ts          # 模型与运行时配置
    ├── instructions.md   # 始终生效的系统指令
    ├── tools/            # Agent 可以调用的类型化工具
    ├── skills/           # 按需加载的操作手册
    ├── subagents/        # 可委派任务的子 Agent
    ├── channels/         # HTTP、Slack、Discord 等入口
    └── schedules/        # 定时任务
```

最小的 Eve Agent，甚至可以从一份 `instructions.md` 开始。

需要选择模型时，增加 `agent.ts`；需要调用业务接口时，在 `tools/` 中增加 TypeScript 文件；需要一套可复用的操作流程时，写进 `skills/`；需要接入 Slack，就增加一个 channel 文件。

这个设计看起来不花哨，却很符合工程直觉。

Agent 的角色、工具、技能和入口都落在普通文件里，意味着它们可以：

- 进入 Git 做版本管理；
- 通过 Pull Request 审查；
- 看到 instructions 修改前后的 diff；
- 对不同版本建立 Preview 环境；
- 出问题时回滚到上一个提交。

Eve 官方说「The filesystem is the authoring interface」。翻成更直白的话就是：**不要再把 Agent 藏在某个控制台的一堆配置项里，把它当成一个正常的软件项目来管理。**

这也是它和很多低代码 Agent 平台最不一样的地方。

## 它不是用来替代 AI SDK 的

看到这里，可能有人会问：Vercel 已经有 AI SDK，为什么还要再做一个 Eve？

我的理解是，两者解决的问题层次不同。

Vercel AI SDK 更像底层开发工具：帮助应用调用不同模型、处理流式输出、生成结构化数据以及完成 Tool Calling。

Eve 则站在更外面一层。它假设 Agent 不只会调用一次模型，而是一个可能运行很久、调用真实系统、等待人类输入、跨多个渠道工作的完整应用。

可以粗略地理解成：

| 层次 | 主要解决的问题 |
|---|---|
| 模型与 AI SDK | 怎么调用模型、流式输出和工具 |
| Agent Loop | 怎么观察、行动、获得反馈并继续 |
| Eve | 这个 Agent 如何持久运行、安全执行、接入业务并进入生产 |

Eve 底层本身也在使用 Vercel 的 AI Gateway、Workflow、Sandbox 和 Connect 等能力。它不是推翻现有 AI 开发栈，而是把这些原语组合成一个约定更完整的 Agent 框架。

如果借用最近比较流行的说法：

> Eve 的重点不只是 Agent Loop，更接近一套生产级 Agent Harness。

模型负责推理，但模型之外还需要状态、权限、工具、执行环境、反馈、审计和验证。Eve 想把这层 Harness 产品化。

## Durable：Agent 不应该害怕重启

普通聊天接口通常是一问一答，请求结束，任务也就结束了。

Agent 却经常不是这样。

它可能需要等待一个慢查询，可能要让用户补充材料，也可能在执行危险操作前等待审批。一次任务持续几个小时甚至几天，并不奇怪。

如果把这种任务绑在一个普通 HTTP 请求上，超时、断线和进程重启迟早会找上门。

Eve 的做法是把每段会话作为一个 durable workflow 运行。工作流步骤会被 checkpoint；任务等待消息时可以暂停，收到新消息后从原来的位置恢复。按照官方介绍，即使中间发生崩溃或重新部署，会话也可以继续推进。

这项能力没有生成式 UI 那么吸睛，却可能是 Eve 最重要的生产特性之一。

因为真实 Agent 的核心问题，从来不是能不能循环，而是这个循环能不能在失败、等待和发布过程中保持正确状态。

当然，durable 也不是免费的魔法。工具有没有副作用、恢复后会不会重复执行、操作是否幂等，仍然需要开发者设计。框架能保存执行状态，却不能替业务代码决定「这笔退款到底能不能再调用一次」。

## Sandbox：给 Agent 一台电脑，但别让它住进应用服务器

很多复杂任务无法提前准备好所有工具。

比如让 Agent 分析一份陌生日志，它可能临时写一段 Python；让它处理 CSV，它可能生成一个聚合脚本；让它检查项目，它可能执行 grep、测试命令或构建工具。

真实计算环境能明显扩大 Agent 的能力边界，也会同时扩大风险边界。

模型生成的命令和代码应该被视为不可信输入。如果直接放进应用运行时执行，一次错误的路径判断、依赖安装或者文件删除，都可能把 Agent 问题变成生产事故。

Eve 为每个 Agent 提供隔离沙箱。本地开发可以使用 Docker、microsandbox 或 just-bash 等适配器；部署到 Vercel 后，执行环境可以切换到 Vercel Sandbox，而不需要改写 Agent 的业务逻辑。

我很喜欢这个设计背后的态度：

> 不是禁止 Agent 写代码，而是默认它写出的代码不值得信任。

这是生产 Agent 应该具备的基本安全观。

## Approvals：成熟的 Agent 要知道什么时候停手

Agent 能调用工具，不代表每个工具都应该自动执行。

查询订单和取消订单不是一回事，查看部署记录和回滚生产版本也不是一回事。

Eve 内置了 human-in-the-loop approval。Agent 遇到需要人工确认的动作时，工作流可以暂停；用户批准或拒绝后，再从当前状态继续。

更重要的是，审批不只存在于某个专用后台。Eve 的 channel 可以把审批映射到实际交互界面，例如在 Slack 中显示按钮。

这会迫使开发者认真回答一个问题：

> Agent 的自动化边界究竟画在哪里？

一个实用的起点是：

- 读取与分析操作可以自动执行；
- 会修改外部系统的操作需要审批；
- 删除数据、回滚生产和大额付费等高风险操作需要更严格确认。

真正成熟的 Agent，不是什么都敢做，而是知道什么时候必须停下来等人。

## Subagents：不是为了凑一支 AI 团队

Eve 也支持子 Agent。

子 Agent 仍然是一个目录，可以有自己的 instructions、tools、skills、模型和沙箱。主 Agent 把它当作工具调用，子 Agent 在干净的上下文中完成任务，再把结果交还给主 Agent。

子 Agent 的价值并不是把一个头像变成五个头像，而是两个更实际的问题：

第一，复杂任务可以拆成边界更清楚的子任务；第二，不同任务可以使用不同上下文和最小权限工具。

例如在一次线上事故中：

- 日志分析 Agent 只读取日志与指标；
- 代码调查 Agent 只查看 GitHub 变更；
- 影响评估 Agent 只查询订单和用户数据；
- 主 Agent 负责综合证据并决定下一步。

这种隔离不仅能减少上下文污染，也能缩小每个 Agent 的权限范围。

不过，能拆不等于应该拆。子 Agent 会增加模型调用、延迟和结果汇总成本。如果一个工具调用就能完成的任务，没必要为了「多 Agent」三个字绕上一圈。

## Channels、Tracing 和 Evals：部署之后才是真正的开始

Eve 默认提供 HTTP API，也可以通过 channel adapter 接入 Slack、Discord、Teams、Telegram、GitHub、Linear 等入口。它希望同一份 Agent 逻辑能够服务多个渠道，而不是每接一个聊天工具就重写一遍业务流程。

连接外部系统时，Vercel Connect 可以处理 OAuth 授权、同意页面和 token 刷新，让模型不直接看到连接地址和凭据。

Agent 运行后，每次模型调用、工具调用以及沙箱命令都可以进入 trace。Eve 使用 OpenTelemetry，因此可以接入现有可观测平台；部署在 Vercel 上时，还可以在 Agent Runs 中查看会话执行过程。

最后是 evals。

instructions、skills 和 tools 都是代码库中的文件，一次看似无害的修改也可能改变 Agent 行为。Eve 提供评测能力，可以在本地运行，也可以接入 CI，把行为回归挡在部署之前。

这三部分共同回答了一个经常被 Demo 忽略的问题：

> Agent 上线之后，用户从哪里找到它，出错以后怎么复盘，升级之前又怎么验证？

能回答这三个问题，才算真正开始把 Agent 当软件工程来做。

## Eve 真的是 Agent 时代的 Next.js 吗？

Vercel 在产品页给出的类比很大胆：像 Next.js 之于 Web App，但这次面向 Agent。

这个类比有合理之处。

Next.js 当年并不是发明了 React，也不是发明了服务端渲染。它的价值在于把路由、构建、渲染、数据获取和部署等常见问题放进一套有明确约定的框架中。

Eve 走的是相似路线：它没有发明大模型、Tool Calling、工作流、沙箱或 OAuth，而是试图把 Agent 项目反复出现的结构固定下来。

但现在就说它已经成为「Agent 时代的 Next.js」，显然太早。

截至本文写作时，Eve 仍处于 beta。官方 README 明确提示：在正式可用之前，框架、API、文档和行为都可能发生变化。它的生态规模、跨平台能力、调试体验、成本模型以及真实业务中的稳定性，都还需要时间验证。

所以更准确的判断是：

> Eve 已经提出了一套很有 Vercel 风格的 Agent 工程答案，但这套答案能否成为事实标准，还要看开发者是否愿意把真实 Agent 放上去跑。

## 哪些团队适合现在尝试？

如果你正在做下面几类项目，Eve 值得进入技术验证名单：

- 任务会持续较长时间，需要暂停和恢复；
- Agent 需要运行脚本或处理文件；
- 需要接入 GitHub、Slack、Linear 等团队系统；
- 存在必须人工确认的高风险动作；
- 希望用 Git、Preview 和 CI 管理 Agent 变更；
- 项目本身已经使用 Vercel 技术栈。

但如果你的需求只是给现有接口增加一次简单的模型问答，直接使用 AI SDK 或模型 SDK 可能更轻。为了一个两步流程引入完整 Agent 框架，未必划算。

另外，强依赖私有化部署、已有成熟工作流平台，或者暂时无法接受 beta API 变化的团队，也不适合急着把核心业务押上去。

新框架最容易让人兴奋的地方是「它什么都有」，最容易被忽略的问题是「这些能力是否正好是你需要的」。

## 接下来，我们用 Eve 组建一支 AI 内容运营团队

只介绍功能列表，很难看出 Eve 解决的问题到底有没有价值。

所以接下来这个系列，我们会围绕一个真实需求展开：我有一个面向 Java 开发者的 SpringForAll 社区，但一直没有足够时间维护。我们将使用 Eve，从零搭建一支 **SpringForAll AI 内容运营团队**。

这里最值得利用的正是 Eve 的目录设计：

> 一个 Agent 一个目录，一个目录对应一个岗位，多个目录组成一支团队。

最终，这支团队会包含内容负责人、选题策划、Java 技术研究员、技术作者、技术审校员和发布编辑。用户只需要提交选题和本地参考资料，团队就能完成：

1. 分析 SpringForAll 的定位和历史内容；
2. 提出多个选题方向，等待用户确认；
3. 根据本地资料建立可追溯的技术事实底稿；
4. 委派不同子 Agent 完成策划、写作和审校；
5. 在审校不通过时，把任务退回对应岗位修改；
6. 生成文章、摘要、标题备选和发布检查清单；
7. 通过 eval 检查技术一致性、风格和内容完整度。

为了让教程开箱即用，基础版本不连接公众号、GitHub、数据库或其他业务系统。账号资料、历史文章和示例素材都会随项目提供，运行后直接生成 Markdown 内容包。

这也不会只是一个只能在终端里运行的工作流。系列后半程会使用 Next.js 和 `useEveAgent` 构建一个可操作的内容运营台：创建任务、查看各 Agent 进度、选择选题、批准或退回内容，并在页面中预览和下载最终文章。

下一篇，我们先招聘第一位员工：

> 用一个目录、一份 instructions 和一个 Web 页面，创建 SpringForAll 的 AI 内容负责人。

随后再逐步为它增加选题、研究、写作和审校岗位，直到这套系统真正能够完成一次从选题到交付的内容生产任务。

---

## 参考资料

- [Vercel：Introducing eve](https://vercel.com/blog/introducing-eve)
- [Eve 产品页](https://vercel.com/eve)
- [Eve GitHub 仓库](https://github.com/vercel/eve)
- [Eve 文档](https://beta.eve.dev/docs)
