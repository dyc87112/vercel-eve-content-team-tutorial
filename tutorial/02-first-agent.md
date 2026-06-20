# 第一个 Agent：全套 Vercel 方案与基础 CLI Chat

> 状态：草稿

## 目标

带读者创建最小 Eve Agent，使用 Vercel AI Gateway 配置模型，并在本地 CLI 中完成第一次对话。

## 建议结构

1. 初始化项目目录。
2. 安装依赖。
3. 编写 `agent/agent.ts`。
4. 编写 `agent/instructions.md`。
5. 配置 Vercel AI Gateway 和默认模型。
6. 运行 `npm run dev`。
7. 做第一次 CLI chat。
8. 小结 Eve 最小项目由哪些文件组成。

## 最小文件

```text
example/01-first-agent/
  package.json
  tsconfig.json
  .env.example
  agent/
    agent.ts
    instructions.md
```

## 验收

- 能启动 Eve dev；
- 能和 Agent 对话；
- Agent 已经知道自己是 SpringForAll 内容运营助手；
- 暂不引入自定义 Provider、skills、subagents、sandbox、tools、schedules。
