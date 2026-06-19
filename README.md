# 用 Vercel Eve 搭建一支 AI 内容运营团队

这是程序猿 DD 的 Vercel Eve 渐进式实战系列。我们会从一位能在网页中对话的内容负责人开始，逐步构建一套可操作、可审查、可部署的 SpringForAll AI 内容运营系统。

仓库同时保存系列文章和每一阶段的完整示例。每个 `examples/<章节>/` 都可以独立安装和运行，不要求先执行前一章代码。

## 系列目录

| 章节 | 文章 | 示例 | 核心增量 | 状态 |
|---|---|---|---|---|
| 00 | [认识 Eve](articles/00-introduction.md) | — | 框架定位与系列目标 | 草稿完成 |
| 01 | [创建第一位内容负责人](articles/01-first-content-agent.md) | [01-first-agent](examples/01-first-agent/) | Agent、instructions 与 Web 对话 | 可运行 |
| 02 | 内容任务工作区 | `examples/02-task-workspace/` | Sandbox 工作区 | 待开发 |
| 03 | 管理内容任务 | `examples/03-task-tools/` | 类型安全 Tools | 待开发 |
| 04 | 固化选题方法 | `examples/04-topic-skill/` | Skills | 待开发 |
| 05 | 内容任务断点续跑 | `examples/05-durable-task/` | Durable workflow | 待开发 |
| 06 | 组建内容团队 | `examples/06-content-team/` | Subagents | 待开发 |
| 07 | 审批与退回修改 | `examples/07-approvals/` | Human-in-the-loop | 待开发 |
| 08 | 内容运营台 | `examples/08-operations-console/` | 业务界面 | 待开发 |
| 09 | Vercel 部署 | `examples/09-vercel-deployment/` | 线上运行 | 待开发 |
| 10 | 运行观测 | `examples/10-observability/` | Tracing | 待开发 |
| 11 | 发布质量门禁 | `examples/11-production/` | Evals 与 CI | 待开发 |

完整设计与每篇边界见[系列规划](articles/series-plan.md)。

## 运行第一阶段

环境要求：Node.js 24、npm，以及可用的模型凭据。

```bash
cd examples/01-first-agent
npm install
cp .env.example .env.local
# 编辑 .env.local，填写 AI_GATEWAY_API_KEY
npm run dev
```

打开终端输出的本地地址，按照该目录 README 中的测试任务进行验证。

## 目录约定

```text
articles/                 系列文章与总规划
examples/                 各章节完整、独立的代码快照
  01-first-agent/         第一阶段：纯对话内容负责人
  02-task-workspace/      第二阶段：内容任务工作区（后续加入）
  ...
```

每个已发布阶段都必须满足：能启动、能操作、能产生当篇可观察结果。真实密钥只写入本地 `.env.local`，不会提交到仓库。

## 当前技术基线

- Eve `0.11.6`
- Node.js `24.x`
- Next.js `16.2.6`
- Vercel AI Gateway
- 测试模型 `minimax/minimax-m3`

Eve 仍处于 Public Preview。每篇发布前都会重新验证版本、命令和配套示例。
