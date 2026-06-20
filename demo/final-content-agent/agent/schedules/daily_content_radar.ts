import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 1 * * 1-5",
  markdown:
    "Generate today's SpringForAll content radar: use live or available source discovery for Java, Spring, and AI signals, score the top 5 article candidates with source anchors and uncertainty, and prepare one recommended draft brief. Do not publish anything.",
});
