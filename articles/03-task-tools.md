---
title: "别把业务判断都塞进 Prompt：用 Eve Tools 评估内容任务是否能开写"
account: "程序猿DD"
channel: "微信公众号"
column: "深度原创"
status: "draft"
language: "zh-CN"
created_at: "2026-06-19"
series: "用 Vercel Eve 搭建一支 AI 内容运营团队"
series_order: 3
series_repo: "https://github.com/dyc87112/vercel-eve-content-team-tutorial"
example_path: "examples/03-task-tools"
source_urls:
  - "https://github.com/vercel/eve/blob/main/docs/tools/overview.mdx"
  - "https://github.com/vercel/eve/blob/main/docs/concepts/default-harness.md"
  - "https://github.com/vercel/eve/blob/main/docs/reference/typescript-api.md"
---

# 别把业务判断都塞进 Prompt：用 Eve Tools 评估内容任务是否能开写

上一篇，我们给内容负责人准备了一个任务工作区。

它已经可以读取 SpringForAll 的账号档案和内容 brief，也可以把任务分析保存成 Markdown 文件。到这里，系统终于不只是一个聊天框了：任务输入、阶段成果和后续流转材料都有了明确位置。

但第二章还留下了一个问题：

> 哪些判断应该交给模型自由发挥，哪些判断应该沉淀成代码？

比如这次 Spring AI 入门教程，brief 已经明确说了：

- 没有官方文档链接；
- 没有指定 Spring Boot、Spring AI、JDK 和构建工具版本；
- 没有提供可运行示例代码；
- 但文章希望包含一个最小可运行示例。

人类运营者看到这些信息，基本会做出一个稳定判断：这篇文章暂时不能进入正文写作。原因不是模型写不出来，而是资料边界不够，继续写很容易编造版本、依赖、配置和运行结果。

这个判断如果只写进 Prompt，当然也能工作。但 Prompt 有几个天然问题：

- 表述越长，越容易和其他指令互相干扰；
- 模型可能每次给出不同的判断口径；
- 后续做页面、审批、评测时，很难稳定读取“当前是否能开写”；
- 规则变更时，不容易测试。

所以第 3 篇不再重复包装 Eve 原生的 `read_file` / `write_file`。这些通用文件能力很好，继续保留给 Agent 使用。

这一篇要新增的是一个真正有业务价值的 Tool：

> `evaluate_content_readiness`：判断内容任务是否具备进入写作阶段的条件。

换句话说，Eve 原生工具负责“读取和保存资料”，我们自己的业务 Tool 负责“用确定性规则做内容生产判断”。

## 先看本篇要完成的结果

第三章配套代码在：

```text
examples/03-task-tools
```

启动项目后，在页面中发送：

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

这次 Agent 应该做三件事：

1. 用 Eve 原生文件工具读取账号档案和 brief；
2. 调用 `evaluate_content_readiness` 得到结构化判断；
3. 把评估结果保存成 `/workspace/outputs/spring-ai-intro/readiness-report.md`。

最终结果会类似：

```md
# Spring AI 入门教程资料完整度评估

## 评估结果

- readiness: blocked
- score: 25

## 主要风险

- 缺少官方来源，容易编造 API、配置项或版本结论。
- 缺少版本信息，示例依赖和配置无法可靠复现。
- 任务要求最小示例，但当前没有可运行代码和验证结果。

## 开写前必须补齐

- 补充官方文档或权威来源链接。
- 确认 JDK、Spring Boot、Spring AI 和构建工具版本。
- 提供并验证最小可运行示例代码。
```

这个输出比第二章的任务分析更适合进入后续流程。它可以变成任务状态，可以被页面展示，可以触发“等待补资料”，也可以在后续 Evals 中做断言。

## Tool 应该解决什么问题

很多人第一次接触 Agent Tools，容易把它理解成“让模型多一个函数可以调用”。这样理解没错，但还不够。

在业务系统里，Tool 更重要的价值是：

> 把需要稳定、可测试、可复用的动作或判断，从自然语言里拿出来，交给代码执行。

通用文件读写不一定要重写。Eve 已经提供了 `read_file`、`write_file`、`glob`、`grep` 和 `bash` 等内置工具。第二章读取 Markdown、保存 Markdown，用原生工具就很合适。

但“资料是否足够进入写作”是业务判断。它包含明确的规则：

- 如果没有官方资料，就不能编造技术结论；
- 如果没有版本信息，就不能写依赖和配置；
- 如果任务要求最小可运行示例，就必须有示例代码和验证结果；
- 缺失项越多，任务越应该被阻断。

这些规则放在 Tool 里，比塞进一大段 Prompt 更稳定。

## 新增业务 Tool

在 `agent/tools/` 下新增文件：

```text
agent/tools/evaluate_content_readiness.ts
```

Eve 的约定很直接：文件名就是模型看到的工具名。因此这个文件会暴露为：

```text
evaluate_content_readiness
```

代码如下：

```ts
import { defineTool } from "eve/tools";
import { z } from "zod";

const nonEmptyList = z.array(z.string().min(1)).default([]);

export default defineTool({
  description:
    "Evaluate whether a SpringForAll content task has enough materials to enter article drafting. Use this after reading the profile and brief.",
  inputSchema: z.object({
    taskId: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case, for example spring-ai-intro.")
      .describe("The content task id."),
    topic: z.string().min(1).describe("The content topic."),
    targetReader: z.string().min(1).describe("The target reader."),
    requestedDeliverables: nonEmptyList.describe("Deliverables requested by the brief."),
    knownMaterials: nonEmptyList.describe("Materials already available in the workspace."),
    missingMaterials: nonEmptyList.describe("Materials explicitly missing or required before writing."),
    requiresRunnableExample: z.boolean().describe("Whether the content expects a runnable code example."),
    hasOfficialSources: z.boolean().describe("Whether official source links or authoritative references are available."),
    hasVersionInfo: z.boolean().describe("Whether key versions such as JDK, Spring Boot, Spring AI, or build tool are specified."),
    hasRunnableExample: z.boolean().describe("Whether runnable example code and verification result are available."),
  }),
  outputSchema: z.object({
    taskId: z.string(),
    readiness: z.enum(["blocked", "needs-more-info", "ready-for-outline"]),
    score: z.number().int().min(0).max(100),
    risks: z.array(z.string()),
    requiredBeforeDraft: z.array(z.string()),
    recommendedNextAction: z.string(),
  }),
  execute(input) {
    const requiredBeforeDraft = new Set<string>();
    const risks = new Set<string>();

    for (const item of input.missingMaterials) {
      requiredBeforeDraft.add(item);
    }

    if (!input.hasOfficialSources) {
      requiredBeforeDraft.add("补充官方文档或权威来源链接");
      risks.add("缺少官方来源，容易编造 API、配置项或版本结论");
    }

    if (!input.hasVersionInfo) {
      requiredBeforeDraft.add("确认 JDK、Spring Boot、Spring AI 和构建工具版本");
      risks.add("缺少版本信息，示例依赖和配置无法可靠复现");
    }

    if (input.requiresRunnableExample && !input.hasRunnableExample) {
      requiredBeforeDraft.add("提供并验证最小可运行示例代码");
      risks.add("任务要求最小示例，但当前没有可运行代码和验证结果");
    }

    const requiredCount = requiredBeforeDraft.size;
    const score = Math.max(0, 100 - requiredCount * 25);
    const readiness =
      requiredCount >= 3 ? "blocked" : requiredCount > 0 ? "needs-more-info" : "ready-for-outline";

    return {
      taskId: input.taskId,
      readiness,
      score,
      risks: [...risks],
      requiredBeforeDraft: [...requiredBeforeDraft],
      recommendedNextAction:
        readiness === "ready-for-outline"
          ? "资料已足够进入大纲设计，但仍需人工确认选题角度。"
          : "先补齐缺失资料，再进入大纲或正文写作。",
    };
  },
});
```

这个 Tool 有几个值得注意的点。

第一，输入是结构化的。模型不能只说“资料大概不够”，而要明确传入：

- 有没有官方来源；
- 有没有版本信息；
- 是否要求可运行示例；
- 是否已经有可运行示例。

第二，输出也是结构化的。后续页面、工作流和评测都可以读取：

- `readiness`
- `score`
- `risks`
- `requiredBeforeDraft`
- `recommendedNextAction`

第三，判断规则在代码里。只要输入相同，输出就稳定；如果以后想调整评分逻辑，改 Tool 即可。

## 为什么不重写 Eve 原生读写工具

第 2 篇里，Agent 使用 Eve 原生文件工具读取资料、写入 Markdown。这本身没有问题。

如果第 3 篇只是把 `read_file` 包装成 `read_content_task`，把 `write_file` 包装成 `save_task_card`，看起来好像更“业务化”，但实际价值有限。读者反而会困惑：Eve 原生工具不好用吗？为什么刚学会又要绕开？

所以这一篇保留原生读写工具。

真正新增的是一个通用工具做不了的能力：内容任务资料完整度评估。

这条边界更清楚：

```text
Eve 原生工具：读写文件、搜索资料、运行命令
业务 Tool：执行可复用的业务动作或业务判断
```

到这里，Tool 不再是“换个名字读写文件”，而是内容运营流程里的一个闸门。

## 更新岗位说明

打开 `agent/instructions.md`，在工作区规则中加入：

```md
- Use Eve's native file tools for Markdown reading and writing.
- Use `evaluate_content_readiness` for deterministic readiness judgment before drafting.
- Save readiness reports under `/workspace/outputs/<task-id>/readiness-report.md`.
```

然后把本地资料任务规则改成：

```md
# When local task materials are provided

Read the requested Markdown materials with native file tools, then call `evaluate_content_readiness`.

Create a concise readiness report with:

1. task summary;
2. readiness result;
3. score;
4. risks;
5. materials required before drafting;
6. recommended next action.

Keep each section within 3 bullet points. Do not create an outline, research brief, draft, review report, or final package unless the user explicitly asks for that stage.

After writing the requested artifact, reply with one short sentence that includes the saved file path.
```

这段说明有意保留了 Eve 原生文件工具。第 3 篇要表达的不是“文件读写必须业务封装”，而是“业务判断应该工具化”。

## 启动并测试

进入第三章示例目录：

```bash
cd examples/03-task-tools
npm install
cp .env.example .env.local
```

编辑 `.env.local`，填入模型凭据：

```dotenv
AI_GATEWAY_API_KEY="你的 API Key"
```

启动开发服务：

```bash
npm run dev
```

打开终端输出的本地地址，在页面中发送：

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

这次页面上应该能看到一次 `evaluate_content_readiness` 工具调用。完成后，它会保存 readiness report。

如果要确认文件内容，可以继续发送：

```text
请读取 /workspace/outputs/spring-ai-intro/readiness-report.md，并用 5 条 bullet 总结。
```

## 这章如何衔接后续

这个 readiness Tool 不是一次性演示。

它会成为后续内容生产流程的第一个业务闸门：

- 第 4 篇引入 Skills 时，只有资料不再 `blocked`，才进入选题或大纲方法；
- 第 5 篇引入长任务恢复时，如果 readiness 是 `blocked`，任务会暂停等待用户补资料；
- 第 6 篇引入 Subagents 时，内容负责人先评估资料，再决定是否委派给研究员和作者；
- 第 7 篇加入人工审批时，readiness report 可以成为“是否允许开写”的审批依据；
- 第 8 篇做运营台时，页面可以展示 readiness、score、缺失项和风险；
- 第 11 篇做 Evals 时，可以断言缺少官方资料和可运行示例时，系统必须阻止正文写作。

这就是业务 Tool 的意义：它不是让模型“多一个函数”，而是让系统拥有可复用的业务规则。

## 本篇完成了什么

现在，SpringForAll AI 内容负责人已经具备了第一个业务判断能力：

- 它继续使用 Eve 原生工具读取和保存 Markdown；
- 它通过 `evaluate_content_readiness` 判断资料是否足够；
- 它能生成结构化 readiness report；
- 它不会在资料不足时贸然进入正文写作。

下一篇，我们再引入 Skills。

到那时，问题不再是“能不能开写”，而是：

> 当资料足够进入下一阶段时，怎样把选题和大纲方法沉淀成可复用的内容 SOP？

---

## 本篇检查清单

- [ ] 已启动 `examples/03-task-tools`
- [ ] 已配置可用模型凭据
- [ ] 已新增 `agent/tools/evaluate_content_readiness.ts`
- [ ] Agent 能读取账号档案和任务 brief
- [ ] Agent 会调用 `evaluate_content_readiness`
- [ ] Agent 能写入 `/workspace/outputs/spring-ai-intro/readiness-report.md`
- [ ] 输出报告包含 readiness、score、risks 和 requiredBeforeDraft
- [ ] Agent 没有直接生成文章正文

## 参考资料

- [Eve：Tools](https://github.com/vercel/eve/blob/main/docs/tools/overview.mdx)
- [Eve：Default Harness](https://github.com/vercel/eve/blob/main/docs/concepts/default-harness.md)
- [Eve：TypeScript API](https://github.com/vercel/eve/blob/main/docs/reference/typescript-api.md)
