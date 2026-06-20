import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 1 * * 1-5",
  markdown:
    "Generate today's SpringForAll content radar: collect Java, Spring, and AI topic signals, score the top 5 article candidates, and prepare one recommended draft brief. Do not publish anything.",
});
