---
title: "聊天记录不等于内容资产：给 Eve Agent 建一个任务工作区"
account: "程序猿DD"
channel: "微信公众号"
column: "深度原创"
status: "draft"
language: "zh-CN"
created_at: "2026-06-19"
series: "用 Vercel Eve 搭建一支 AI 内容运营团队"
series_order: 2
series_repo: "https://github.com/dyc87112/vercel-eve-content-team-tutorial"
example_path: "examples/02-task-workspace"
source_urls:
  - "https://github.com/vercel/eve/blob/main/docs/sandbox.mdx"
  - "https://github.com/vercel/eve/blob/main/docs/concepts/security-model.md"
  - "https://github.com/vercel/eve/blob/main/docs/reference/project-layout.md"
---

# 聊天记录不等于内容资产：给 Eve Agent 建一个任务工作区

上一篇，我们用 Eve 创建了 SpringForAll 的第一位 AI 内容负责人。

它已经能在网页中理解任务、判断资料缺口，并给出执行计划。这个阶段很适合验证 Agent 的角色边界，但如果真的把它用于内容运营，很快会遇到一个问题：

> 只靠聊天记录，内容任务很难沉淀。

一次内容任务通常不只是一问一答。运营同学会给账号定位、选题 brief、参考资料、版本信息、示例代码，Agent 也会陆续产出任务分析、研究笔记、大纲、草稿、审校意见和发布清单。

如果这些东西都散落在对话里，下一步工作就很难复用。人类也不容易检查：这份结论到底基于哪些资料？哪个文件是最终版本？下一位 Agent 要接着看什么？

所以第二篇不急着增加 Tools、Skills 或多 Agent。我们先做一件更基础的事：

> 给内容任务建立一个可以读写文件的工作区。

这一篇完成后，内容负责人可以读取项目里随附的 SpringForAll 账号档案和内容 brief，并把任务分析保存成一个 Markdown 文件。

## 先看本篇要完成的结果

第二章配套代码在：

```text
examples/02-task-workspace
```

启动项目后，在页面中发送：

```text
请读取 /workspace/knowledge/springforall-profile.md 和 /workspace/inbox/spring-ai-intro/brief.md。

请基于这两份资料生成任务分析，并保存到：
/workspace/outputs/spring-ai-intro/task-analysis.md

输出文件只需要包含：任务摘要、目标读者、已有资料、缺失资料、执行计划、下一步需要确认的问题。
每部分不超过 3 条。

现在只做任务分析和执行计划，不撰写文章正文、大纲、研究简报或发布包。
保存文件后，请只用一句话告诉我保存路径。
```

内容负责人完成后，会在 Sandbox 的 `/workspace/outputs/spring-ai-intro/task-analysis.md` 写入类似这样的内容：

```md
# Spring AI 入门教程任务分析

## 任务摘要

为 SpringForAll 准备一篇面向 Java / Spring Boot 开发者的 Spring AI 入门教程。

## 目标读者

- 已使用过 Spring Boot；
- 尚未系统接触 Spring AI；
- 希望通过最小可运行示例快速开始。

## 已有资料

- SpringForAll 社区档案；
- 本次 Spring AI 入门教程 brief。

## 缺失资料

- Spring AI 官方文档链接；
- Spring Boot、Spring AI、JDK 和构建工具版本；
- 最小示例代码与运行验证结果。

## 执行计划

1. 先补齐版本和官方资料；
2. 确定最小示例场景；
3. 验证依赖、配置和代码；
4. 再进入大纲和正文写作。
```

具体措辞可能会因为模型输出略有不同，但本篇的验收重点不是文案是否一字不差，而是三件事：

1. Agent 确实读取了本地资料；
2. Agent 没有在资料不足时编造技术细节；
3. 任务分析被保存成了可以继续流转的文件。

## 为什么这里要引入 Sandbox

Eve 的 Agent 默认拥有一个隔离的执行环境，也就是 Sandbox。

可以先把它理解成 Agent 的工作桌面：模型可以通过内置工具在这个环境里运行命令、搜索文件、读取文件和写入文件。这个环境的根目录是 `/workspace`。

本篇只使用它最简单的一面：放几份 Markdown 资料，让 Agent 读取，再生成一份 Markdown 输出。

更复杂的问题先不展开，比如：

- Docker、microsandbox、Vercel Sandbox 应该怎么选；
- Sandbox 网络策略怎么配置；
- 线上部署后 Sandbox 生命周期如何变化；
- 什么时候应该把文件操作收敛成自定义 Tool。

这些都会在后续章节展开。现在只需要建立一个直觉：**聊天负责交互，工作区负责沉淀资产。**

## 建立任务目录

从第一章项目复制出第二章快照后，新增下面的目录：

```text
agent/
└── sandbox/
    ├── sandbox.ts
    └── workspace/
        ├── README.md
        ├── knowledge/
        │   └── springforall-profile.md
        ├── inbox/
        │   └── spring-ai-intro/
        │       └── brief.md
        ├── workspace/
        │   └── spring-ai-intro/
        └── outputs/
            └── spring-ai-intro/
```

这里有一个容易混淆的小细节：项目里的 `agent/sandbox/workspace/` 会被 Eve 映射到 Sandbox 内部的 `/workspace`。

也就是说，项目中的：

```text
agent/sandbox/workspace/knowledge/springforall-profile.md
```

进入 Agent 的工作环境后，会变成：

```text
/workspace/knowledge/springforall-profile.md
```

为了让内容任务逐渐变得可管理，我们先约定四类目录：

```text
/workspace
├── knowledge/   长期资料，例如账号档案、栏目定位、写作规则
├── inbox/       用户提交的原始任务和素材
├── workspace/   任务执行过程中的阶段性草稿
└── outputs/     可以被人类查看、复用或进入下一阶段的成果
```

现在这个约定还只是目录规范。下一篇引入 Tools 之后，我们会把这些目录规则变成受控的业务动作，避免 Agent 随便读写路径。

## 放入 SpringForAll 账号档案

在 `agent/sandbox/workspace/knowledge/springforall-profile.md` 中写入：

```md
# SpringForAll 社区档案

SpringForAll 是面向 Java 与 Spring 技术栈开发者的中文技术社区。

## 核心读者

- 使用 Java 进行后端开发的工程师；
- 熟悉或正在学习 Spring Boot、Spring Cloud、Spring Security 等 Spring 生态技术；
- 关注工程实践、版本升级、架构演进和 AI 应用落地；
- 偏好可运行示例、清晰步骤和真实踩坑经验。

## 内容风格

- 少讲空泛概念，多给可执行步骤；
- 对新技术保持兴趣，但不夸大效果；
- 技术结论必须有来源或明确的验证边界；
- 示例代码需要说明环境、版本、依赖和运行方式；
- 如果资料不足，应先列出缺口，不直接编造实现细节。
```

这份文件相当于内容团队的长期记忆之一。它不属于某一次具体任务，而是所有 SpringForAll 内容任务都可能用到的基础信息。

第一章里，我们把类似规则写进了 `instructions.md`。第二章开始，长期规则和业务资料要逐渐分开：

- `instructions.md` 放 Agent 的岗位职责和长期行为边界；
- `knowledge/` 放可以被更新、替换和审查的账号资料。

这样后续维护账号定位时，不需要改 Agent 的核心岗位说明。

## 放入第一份内容 Brief

在 `agent/sandbox/workspace/inbox/spring-ai-intro/brief.md` 中写入：

```md
# 内容任务 Brief：Spring AI 入门教程

## 任务目标

为 SpringForAll 准备一篇 Spring AI 入门教程，帮助 Java 开发者理解 Spring AI 的定位，并完成一个最小可运行示例。

## 目标读者

- 已经使用过 Spring Boot；
- 没有系统接触过 Spring AI；
- 希望快速知道 Spring AI 能解决什么问题，以及如何开始第一个 Demo。

## 希望产出

- 任务分析；
- 写作执行计划；
- 开始写正文前需要补充的资料清单。

## 当前已知限制

- 本任务暂未提供 Spring AI 官方文档链接；
- 暂未指定 Spring Boot、Spring AI、JDK 和构建工具版本；
- 暂未提供可运行示例代码；
- 暂不要求撰写正文。
```

这份 brief 是一次具体内容任务的输入，因此放在 `inbox/spring-ai-intro/`。

读者可以把 `spring-ai-intro` 理解成当前任务的 ID。后续任务多起来以后，每个任务都会拥有自己的输入、过程和输出目录。

## 配置本地轻量 Sandbox

Eve 默认会根据环境选择可用的 Sandbox 后端。为了让本篇在没有 Docker 的电脑上也能跑通，我们显式选择 `justbash()`：

```ts
import { defineSandbox } from "eve/sandbox";
import { justbash } from "eve/sandbox/just-bash";

export default defineSandbox({
  backend: justbash(),
});
```

这个文件放在：

```text
agent/sandbox/sandbox.ts
```

`justbash()` 不需要 Docker daemon 或虚拟机，很适合本篇这种 Markdown 读写任务。它的限制也很明显：没有真实系统命令，不能当作完整 Linux 环境来用。

这正好符合第二章的目标。我们只想让读者稳定看到：

- `/workspace` 是什么；
- seeded files 如何进入 Sandbox；
- Agent 如何读取资料并写入结果。

后面讲到运行脚本、验证代码、线上部署和网络隔离时，再切换到更合适的 Sandbox 后端。

为了避免开发时临时自动安装依赖，示例项目把 `just-bash` 显式加入 `package.json`：

```json
{
  "devDependencies": {
    "just-bash": "^3.0.0"
  }
}
```

## 更新内容负责人的岗位说明

第一章的内容负责人只需要对话。第二章开始，它还需要知道工作区的目录约定。

在 `agent/instructions.md` 中保留原有角色规则，并新增：

```md
# Workspace rules

- Use `/workspace/knowledge` for long-lived account and community knowledge.
- Use `/workspace/inbox` for user-submitted briefs and source materials.
- Use `/workspace/workspace` for intermediate working notes.
- Use `/workspace/outputs` for artifacts that humans should review or reuse.
- Before analyzing a task that references local materials, read the relevant files first.
- When asked to save an artifact, write Markdown files under `/workspace/outputs/<task-id>/`.
- Do not overwrite an existing output unless the user explicitly asks you to regenerate it.
```

再补一段本地资料任务的输出要求：

```md
# When local task materials are provided

Use `read_file` and `write_file` for Markdown materials. Do not use `bash` unless the user explicitly asks you to run a shell command.

Read the requested files, then create a concise Markdown task analysis with:

1. task summary;
2. target reader;
3. available materials;
4. missing materials;
5. execution plan;
6. suggested next question for the human operator.

Keep each section within 3 bullet points. Do not create an outline, research brief, draft, review report, or final package unless the user explicitly asks for that stage.

After writing the requested artifact, reply with one short sentence that includes the saved file path.
```

这里额外限制了文件读写方式、输出长度和完成后的确认语。它不是 Eve 的硬性要求，而是为了让第二章的验收更稳定：本篇只验证“读取资料并保存分析文件”，不让模型顺手生成后续章节才会展开的大纲、研究简报或发布包。

到这里，仍然没有自定义 Tool。Agent 使用的是 Eve 默认提供的文件读写能力。

这是一条很重要的分界线：第二章先让读者理解“Agent 可以拥有工作区”，第三章再解释“为什么生产系统不能让 Agent 直接随意读写文件”。

## 启动并测试

进入第二章示例目录：

```bash
cd examples/02-task-workspace
npm install
cp .env.example .env.local
```

编辑 `.env.local`，填入模型凭据：

```dotenv
AI_GATEWAY_API_KEY="你的 API Key"
```

如果已经通过 Vercel 连接项目，也可以使用：

```bash
npm exec -- eve link
```

启动开发服务：

```bash
npm run dev
```

打开终端输出的本地地址，在页面中发送：

```text
请读取 /workspace/knowledge/springforall-profile.md 和 /workspace/inbox/spring-ai-intro/brief.md。

请基于这两份资料生成任务分析，并保存到：
/workspace/outputs/spring-ai-intro/task-analysis.md

输出文件只需要包含：任务摘要、目标读者、已有资料、缺失资料、执行计划、下一步需要确认的问题。
每部分不超过 3 条。

现在只做任务分析和执行计划，不撰写文章正文、大纲、研究简报或发布包。
保存文件后，请只用一句话告诉我保存路径。
```

如果一切正常，页面会显示 Agent 正在读取资料并生成结果。完成后，它应该告诉你已经保存了任务分析文件。

## 查看输出结果

本篇最重要的验证，不是看页面回复得漂不漂亮，而是确认输出文件存在。

在 Eve 的 Sandbox 中，结果文件路径是：

```text
/workspace/outputs/spring-ai-intro/task-analysis.md
```

如果使用本篇配置的 `justbash()`，Sandbox 文件会保存在本地 `.eve/sandbox-cache/` 下。不同 session 的具体缓存路径可能不同，所以最直接的方式是在页面里继续问：

```text
请读取 /workspace/outputs/spring-ai-intro/task-analysis.md，并用 5 条 bullet 总结文件内容。
```

它应该能读到刚刚写入的文件，并总结其中的任务摘要、目标读者、已有资料、缺失资料和执行计划。

这一步说明 `/workspace` 在同一个会话中是持续存在的。后续章节加入长任务恢复时，我们会继续利用这个特性，让内容任务跨多轮对话继续推进。

## 常见问题

### 为什么不直接用项目根目录里的文件？

因为 Agent 的文件读写发生在 Sandbox 内，而不是 Next.js 应用运行目录。

Eve 把 `agent/sandbox/workspace/` 中的文件 seed 到 Sandbox 的 `/workspace`。这样做的好处是边界清晰：应用代码、密钥和运行时环境不会直接暴露给模型控制的文件工具。

### 为什么本篇不用 Docker？

Docker 更接近真实系统环境，但也更容易让第一批读者卡在 Docker Desktop、Colima、Podman 或镜像拉取问题上。

第二章的目标只是 Markdown 读写，用 `justbash()` 更合适。等后续需要运行脚本、校验示例代码或部署到 Vercel 时，再展开更完整的 Sandbox 后端选择。

### 为什么不把目录规则做成 Tool？

这正是下一篇要解决的问题。

现在 Agent 能读取和写入 `/workspace`，但它仍然是在按自然语言理解目录规则。真实业务里，我们会希望“创建任务”“读取 brief”“保存任务分析”都是明确、可校验、可限制的业务动作。

第三篇会把这些动作收敛成类型安全的 Tools。

## 本篇完成了什么

到这里，SpringForAll AI 内容负责人已经从“只会聊天”进化到“可以处理任务资料”：

- 账号档案沉淀在 `knowledge/`；
- 用户 brief 进入 `inbox/`；
- Agent 通过 Sandbox 读取资料；
- 任务分析保存到 `outputs/`；
- 同一任务的输入和输出开始拥有稳定目录。

这一步不华丽，但很关键。

内容运营系统不是一次生成一段回答，而是让任务资料、阶段成果和人类反馈不断流转。工作区就是这条流转链路的第一块地基。

下一篇，我们会继续收紧边界：

> 不再让 Agent 凭自然语言随意读写文件，而是用 Eve Tools 把内容任务变成明确的业务动作。

---

## 本篇检查清单

- [ ] 已启动 `examples/02-task-workspace`
- [ ] 已配置可用模型凭据
- [ ] 已新增 `agent/sandbox/sandbox.ts`
- [ ] 已在 `agent/sandbox/workspace/knowledge/` 放入账号档案
- [ ] 已在 `agent/sandbox/workspace/inbox/` 放入任务 brief
- [ ] Agent 能读取两份本地资料
- [ ] Agent 能写入 `/workspace/outputs/spring-ai-intro/task-analysis.md`
- [ ] Agent 没有直接编造 Spring AI 技术正文

## 参考资料

- [Eve：Sandbox](https://github.com/vercel/eve/blob/main/docs/sandbox.mdx)
- [Eve：Security Model](https://github.com/vercel/eve/blob/main/docs/concepts/security-model.md)
- [Eve：Project Layout](https://github.com/vercel/eve/blob/main/docs/reference/project-layout.md)
