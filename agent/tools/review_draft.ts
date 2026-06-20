import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description:
    "Review a SpringForAll article draft for audience fit, source safety, engineering usefulness, and publication readiness.",
  inputSchema: z.object({
    title: z.string(),
    draft: z.string(),
    sourceCount: z.number().int().min(0).default(0),
  }),
  outputSchema: z.object({
    readiness: z.enum(["blocked", "needs_revision", "ready_for_human_review"]),
    score: z.number(),
    strengths: z.array(z.string()),
    risks: z.array(z.string()),
    requiredFixes: z.array(z.string()),
  }),
  async execute({ title, draft, sourceCount }) {
    const hasCodeHint = /代码|Controller|Service|Maven|Gradle|application\.yml/.test(draft);
    const hasChecklist = /审校|核验|来源/.test(draft);
    const score = Math.min(100, 45 + sourceCount * 12 + (hasCodeHint ? 18 : 0) + (hasChecklist ? 12 : 0));

    return {
      readiness: score >= 75 ? "ready_for_human_review" : "needs_revision",
      score,
      strengths: [
        `主题"${title}"符合 SpringForAll 的 Java/Spring 技术读者画像。`,
        hasCodeHint ? "草稿已经预留工程实现部分，适合扩展成实战教程。" : "主题方向明确。",
      ],
      risks: [
        sourceCount === 0 ? "缺少来源，不能发布。" : "来源需要人工打开核验是否为最新版本。",
        "当前原型不会真实运行示例代码，发布前必须补充可运行工程验证。",
      ],
      requiredFixes: [
        "补充真实代码和依赖版本。",
        "逐条核验来源链接与技术结论。",
        "确认标题不过度承诺，避免 AI/Agent 概念泛化。",
      ],
    };
  },
});
