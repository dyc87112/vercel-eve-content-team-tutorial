# 使用 Sub Agent + Skill 构建 AI 内容团队

> 状态：草稿

## 目标

把单一聊天 Agent 演进成内容团队：主 Agent 作为内容主编，skills 定义工作流程，subagents 承担 researcher、writer、reviewer 角色。

## 建议结构

1. 为什么内容团队不应该只靠一个长 prompt。
2. Skill 适合沉淀什么。
3. Subagent 适合拆分什么。
4. Topic Planning Skill：定义来源探索、候选生成和评分规则。
5. Article Writing Skill：定义文章结构和写作边界。
6. Review Checklist Skill：定义审稿标准和发布风险。
7. researcher / writer / reviewer 的职责边界。

## 验收

- 有 3 个 skills；
- 有 3 个 subagents；
- 主 Agent 指令能明确何时委派；
- 选题研究依赖真实来源探索规则，而不是静态候选列表。

