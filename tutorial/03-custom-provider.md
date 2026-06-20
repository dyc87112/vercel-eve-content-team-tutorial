# 接入自定义 AI Provider：Gateway、Coding Plan 与 Token Plan

> 状态：草稿

## 目标

在 Vercel AI Gateway 之外支持自有 OpenAI-Compatible Provider，并把模型、API 地址、API key、上下文窗口和 token 预算设计成可配置项。

## 建议结构

1. 为什么不能把模型配置写死。
2. 默认 Vercel AI Gateway 配置。
3. 自定义 OpenAI-Compatible Provider 配置。
4. `EVE_MODEL_BASE_URL` 应该指向 API prefix，而不是 `/chat/completions`。
5. `modelContextWindowTokens` 的作用。
6. provider 检查脚本。
7. 内容团队场景下的 coding plan / token plan。

## 验收

- 默认 gateway 可用；
- 自定义 gateway 可切换；
- 配置错误有清晰提示；
- README 能解释上下文窗口和 token 预算。

