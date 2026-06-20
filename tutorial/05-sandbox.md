# 使用 Sandbox：隔离运行产物和 Agent 定义代码

> 状态：草稿

## 目标

让 Agent 的研究笔记、草稿、审校结果和临时文件写入 sandbox `/workspace`，避免污染 Agent 定义代码和教程仓库。

## 建议结构

1. 为什么运行产物不能混进源码目录。
2. Eve sandbox 的 `/workspace` 是什么。
3. `agent/sandbox/sandbox.ts` 的作用。
4. 网络策略和来源访问边界。
5. 哪些内容留在 sandbox。
6. 哪些内容人工确认后导出。
7. `.gitignore` 仍然要处理哪些宿主运行产物。

## 验收

- 有显式 sandbox 配置；
- 主 Agent 指令要求产物写入 `/workspace`；
- 仓库只管理教程、样例、Agent 定义代码；
- 运行缓存和构建产物不进入 git。

