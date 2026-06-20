# 用 Vercel Eve 搭建一支 AI 内容运营团队：系列规划

## 系列名称

用 Vercel Eve 搭建一支 AI 内容运营团队

## 系列目标

用一个真实但可控的案例，带读者从零试验 Eve 这个新框架，并构建一个 SpringForAll 内容运营 Agent。这个 Agent 的目标不是证明这是内容运营的最优业务方案，也不是自动发布文章，而是借助一个日常任务场景学习 Eve 的模型配置、skills、subagents、sandbox 等核心能力。

Eve 还处在快速变化阶段，所以这个系列会把当前实现当作学习样例，而不是标准答案。文章会尽量说明每一步为什么这样试、解决了什么问题、还留下哪些边界。

目标读者：

- 想了解 Eve / Vercel Agent 开发方式的开发者；
- 熟悉 Node.js / TypeScript，想评估 Agent 工程组织方式的后端开发者；
- 关注内容运营、技术写作自动化、Agent 工程化落地的技术团队。

写作原则：

- 每篇文章都交付一个清晰的阶段性试验结果；
- 先讲为什么需要某个 Eve 概念，再引入 API 和目录结构；
- 不把 Agent 写成纯 prompt demo，也不宣称 demo 是业务最优解，而是持续强调模型配置、上下文规划、运行产物隔离、人工审批和可验证性；
- 示例工程保持小，当前阶段性尝试放在 `demo/final-content-agent/`。
- 每篇文章末尾给出对应样例工程地址，并引导读者 Star 支持仓库。

## 目录约定

- `tutorial/`: 系列文章正文、提纲和规划。
- `example/`: 每篇文章对应的最小样例工程。
- `demo/final-content-agent/`: 当前阶段性尝试，作为 `00` 到 `04` 篇完成后的学习目标。

## 当前路线

### 00. 开篇：为什么要用 Eve 搭建 AI 内容运营团队

目标：

- 介绍 Eve 是什么；
- 说明为什么选择“SpringForAll 内容团队”作为案例；
- 展示当前要试验的 Agent 轮廓；
- 交代系列边界：辅助运营，不自动发布。

核心问题：

- Eve 适合表达哪些 Agent 工程概念；
- 内容运营 Agent 为什么不只是一个聊天机器人；
- SpringForAll 内容团队 Agent 先尝试帮助人完成什么工作；
- 系列教程会如何从第一个 Agent 逐步演进到内容团队雏形。

配套样例：

- 无独立样例，引用 `demo/final-content-agent/` 作为当前试验目标预览。

### 01. 第一个 Agent：全套 Vercel 方案与基础 Chat Agent

目标：

- 使用 Eve 创建第一个可运行 Agent；
- 使用 Vercel AI Gateway 和默认模型；
- 完成基础 CLI chat；
- 建立最小项目结构。

核心问题：

- Eve 项目的最小目录是什么；
- `agent/agent.ts` 和 `agent/instructions.md` 分别负责什么；
- 如何配置 `AI_GATEWAY_API_KEY` 和 `EVE_GATEWAY_MODEL_ID`；
- 如何在本地启动并与 Agent 对话。

配套样例：

- `example/01-first-agent/`

验收结果：

- 能启动 Eve dev；
- 能在 CLI 中对话；
- Agent 已经知道自己是 SpringForAll 内容运营助手；
- 暂不引入自定义 Provider、skills、subagents、sandbox、tools、schedules、evals。

### 02. 接入自定义 AI Provider：Gateway、Coding Plan 与 Token Plan

目标：

- 在 Vercel AI Gateway 之外支持自己的 OpenAI-Compatible Provider；
- 让模型、base URL、API key、上下文窗口可配置；
- 引入 coding plan / token plan 的工程意识：模型选型、上下文预算、成本和失败边界。

核心问题：

- 为什么试验中也需要保留可切换 AI Provider 的空间；
- `EVE_MODEL_BASE_URL`、`EVE_MODEL_API_KEY`、`EVE_MODEL_ID` 应该如何设计；
- 为什么自定义或未收录模型需要显式 `modelContextWindowTokens`；
- 如何写一个 provider 检查脚本，先验证 gateway 再启动 Agent；
- 内容团队场景下如何规划 coding plan、token plan、上下文窗口和成本。

配套样例：

- `example/02-custom-provider/`

验收结果：

- Agent 可以使用 Vercel AI Gateway；
- 也可以切换到自有 OpenAI-Compatible gateway；
- 配置错误时有清晰提示；
- README 中说明上下文窗口和 token 预算的取舍。

### 03. 使用 Sub Agent + Skill 构建 AI 内容团队

目标：

- 用 skill 沉淀内容团队工作流程；
- 用 subagents 拆分 researcher、writer、reviewer；
- 让主 Agent 像“内容主编”一样调度不同角色。

核心问题：

- skill 和 instruction 的边界是什么；
- topic planning、article writing、review checklist 适合如何拆成 skill；
- researcher、writer、reviewer 的职责边界是什么；
- Topic Planning Skill 如何声明要搜索和读取哪些真实来源；
- researcher 如何按 skill 返回来源、判断和不确定性。

配套样例：

- `example/03-content-team/`

验收结果：

- Agent 具备内容主编角色；
- 有选题、写作、审稿三个 skills；
- 有 researcher、writer、reviewer 三个 subagents；
- 选题不依赖静态内置列表，而是由 skill 约束动态研究流程。

### 04. 使用 Sandbox：隔离运行产物和 Agent 定义代码

目标：

- 明确 Agent 源码和 Agent 运行产物的边界；
- 使用 Eve sandbox 的 `/workspace` 承载研究笔记、草稿、审校产物；
- 避免运行过程污染教程仓库或 Agent 定义代码。

核心问题：

- 为什么草稿、研究笔记、执行记录不应该写进源码目录；
- Eve sandbox 的 `/workspace` 是什么；
- 如何显式配置 `agent/sandbox/sandbox.ts`；
- 如何限制或规划 sandbox 网络访问；
- 哪些内容应该留在 sandbox，哪些内容经过人工确认后再导出。

配套样例：

- `example/04-sandbox/`

验收结果：

- Agent 指令明确要求产物写入 sandbox `/workspace`；
- demo 中有显式 sandbox 配置；
- 仓库目录只保留教程、样例和 Agent 定义代码；
- 运行缓存、依赖、构建产物被 `.gitignore` 排除。

## 后续规划，先不展开

### 06. Tools：自定义更丰富的工具来支撑目标

待确定：

- 是否需要 URL/RSS 抓取工具；
- 是否需要历史文章库查询工具；
- 是否需要将 brief 保存到外部内容系统；
- 是否需要更结构化的 review/report tool。

### 07. Schedules：每天自动生成内容雷达

待展开：

- 工作日定时任务；
- 每日内容雷达输出格式；
- 定时任务和人工审批的边界。

### 08. Evals：给 Agent 工作流加最低限度质量门槛

待展开：

- 检查是否包含来源；
- 检查是否明确人工核验项；
- 检查是否避免声称已经发布；
- 检查是否符合 SpringForAll 读者画像。

### 09. 部署到 Vercel

待展开：

- Vercel 环境变量；
- AI Gateway / 自定义 Provider 的部署配置；
- sandbox 后端选择；
- 运行日志、定时任务和安全边界。

## 暂不纳入当前阶段

- 自动发布到公众号；
- 复杂 CMS 集成；
- 多账号内容矩阵；
- 阅读数据自动复盘；
- 私有知识库 RAG；
- 团队权限和审计后台。
