import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description: "The agent can plan SpringForAll topics using the topic scoring tool.",
  async test(t) {
    await t.send("为 SpringForAll 社区推荐 3 个 Java / Spring / AI 方向选题。");
    t.completed();
    t.calledTool("score_topics");
    t.check(t.reply, includes("SpringForAll"));
  },
});
