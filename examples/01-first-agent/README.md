# 阶段 01：SpringForAll AI 内容负责人

这是《用 Vercel Eve 搭建一支 AI 内容运营团队》第 1 篇的完整、独立示例。

对应文章：[一个目录就是一名员工：用 Eve 创建 SpringForAll 的第一位 AI 内容负责人](../../articles/01-first-content-agent.md)

当前阶段只有一位内容负责人 Agent。它会理解用户提交的内容需求，判断任务类型、规划工作，并在技术资料不足时停止写作。

测试阶段默认通过 Vercel AI Gateway 使用 `minimax/minimax-m3`，以降低多轮 Agent 调试成本。

## 环境要求

- Node.js 24
- npm
- `AI_GATEWAY_API_KEY`，或 Eve 支持的其他模型凭据

## 启动

```bash
npm install
cp .env.example .env.local
# 编辑 .env.local，填写 AI_GATEWAY_API_KEY
npm run dev
```

推荐打开终端输出的 `http://localhost:<端口>`。项目同时允许通过 `127.0.0.1` 访问，避免 Next.js 开发模式阻止客户端脚本接管表单。

如果页面提示 `AI Gateway received no credentials`，说明 `.env.local` 中还没有有效凭据。也可以不填写 Gateway Key，改用 Eve 的项目连接：

```bash
npm exec -- eve link
```

真实 `.env.local` 已被 `.gitignore` 排除，只有不包含密钥的 `.env.example` 会进入版本控制。

打开终端显示的本地地址，发送：

```text
我们希望为 SpringForAll 写一篇 Spring AI 入门教程。

目标读者是使用过 Spring Boot、但还没有接触过 Spring AI 的 Java 开发者，
文章希望包含一个最小可运行示例。

请先分析任务，给出执行计划和开始写作前需要确认的信息，暂时不要撰写正文。
```

## 当前验收目标

- 正确识别 SpringForAll 的读者
- 将任务判断为实战教程
- 不直接生成文章正文
- 明确指出版本、官方资料和示例代码缺失

## 项目阶段

- [x] Eve + Next.js Web Chat 脚手架
- [x] 内容负责人 instructions
- [x] 第一个可重复验证的对话任务
- [ ] 本地资料与内容任务工作区
- [ ] 内容任务 Tools 与 Skills
- [ ] 选题、研究、写作和审校 Subagents
- [ ] 人工审批与退回闭环
- [ ] 内容运营看板
- [ ] Evals 与 Vercel 部署
