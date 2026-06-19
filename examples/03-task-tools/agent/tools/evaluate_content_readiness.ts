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
