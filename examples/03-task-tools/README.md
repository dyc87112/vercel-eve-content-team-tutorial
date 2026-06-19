# 阶段 03：类型安全内容任务 Tools

这是《用 Vercel Eve 搭建一支 AI 内容运营团队》第 3 篇的完整、独立示例。

对应文章：[别把业务判断都塞进 Prompt：用 Eve Tools 评估内容任务是否能开写](../../articles/03-task-tools.md)

当前阶段仍然只有一位内容负责人 Agent。它继续使用 Eve 原生文件工具读取和保存 Markdown，同时新增一个类型安全的业务 Tool，用确定性规则评估内容任务是否已经具备进入写作的条件。

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
请读取 /workspace/knowledge/springforall-profile.md 和 /workspace/inbox/spring-ai-intro/brief.md。

请调用 evaluate_content_readiness 判断这个任务是否可以进入正文写作阶段。

任务 ID 是 spring-ai-intro。

请把评估结果保存到：
/workspace/outputs/spring-ai-intro/readiness-report.md

输出文件只需要包含：任务摘要、评估结果、分数、主要风险、开写前必须补齐的资料、建议下一步。
每部分不超过 3 条。

现在只做资料完整度评估，不撰写文章正文、大纲、研究简报或发布包。
保存文件后，请只用一句话告诉我保存路径。
```

## 当前验收目标

- Agent 会使用 Eve 原生文件工具读取资料
- Agent 会调用 `evaluate_content_readiness`
- Agent 会写入 `outputs/spring-ai-intro/readiness-report.md`
- 输出文件包含 readiness、score、risks 和 requiredBeforeDraft
- Agent 不直接生成文章正文

## 项目阶段

- [x] Eve + Next.js Web Chat 脚手架
- [x] 内容负责人 instructions
- [x] 第一个可重复验证的对话任务
- [x] 本地资料与内容任务工作区
- [x] 内容任务 Tools
- [ ] Skills
- [ ] 选题、研究、写作和审校 Subagents
- [ ] 人工审批与退回闭环
- [ ] 内容运营看板
- [ ] Evals 与 Vercel 部署
