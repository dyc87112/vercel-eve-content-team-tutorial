# 用 Vercel Eve 搭建一支 AI 内容运营团队

这个仓库用于规划和编写《用 Vercel Eve 搭建一支 AI 内容运营团队》系列教程。这个案例主要用于学习和试验 Eve 这个新框架，目标是用 SpringForAll 内容运营场景完成一些日常任务，而不是证明这是一套最优业务解决方案。

Eve 仍然很新，API、文档和推荐实践都可能快速变化。因此这里的 demo 更像一次带记录的学习试验：用一个足够真实的任务理解 Eve 的模型配置、skills、subagents、sandbox 等能力，同时保留对业务效果和工程边界的判断。

## Directory

- `tutorial/`: 系列文章正文、提纲和发布计划。
- `example/`: 每篇文章对应的最小样例工程。
- `demo/`: 较完整的阶段性试验结果。当前 demo 在 `demo/final-content-agent/`。

## Current Plan

当前路线先完成 `00` 到 `04` 这 5 篇：前言、第一个 Agent、自定义 AI Provider、Sub Agent + Skill 内容团队、Sandbox 隔离。

后续先保留 4 个规划方向：Tools、Schedules、Evals、部署到 Vercel。

详细规划见 `tutorial/series-plan.md`。

## Repository Boundary

仓库只管理教程、样例工程和 Agent 定义代码。Agent 运行过程中产生的草稿、研究笔记、执行记录、构建产物和缓存不进入 git。
