import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description: "The agent can plan SpringForAll topics with source-aware recommendations.",
  async test(t) {
    await t.send("为 SpringForAll 社区推荐 3 个 Java / Spring / AI 方向选题。");
    t.completed();
    t.check(t.reply, includes("SpringForAll"));
    t.check(t.reply, includes("来源"));
  },
});
