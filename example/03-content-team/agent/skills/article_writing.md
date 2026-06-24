---
description: Use when turning a SpringForAll topic brief into a Chinese technical article outline, draft, rewrite, or title package.
---

# Article Writing Skill

Use this skill to write SpringForAll article drafts from an approved topic brief.

## Writing Principles

- Lead with the engineering problem, not with hype.
- Explain the "why" before the "how".
- Use concrete examples, version notes, commands, code snippets, or migration steps when available.
- Mark assumptions clearly when source material is incomplete.
- Keep the tone practical, direct, and useful for busy developers.

## Article Structure

Use this structure unless the user requests another format:

1. Opening: describe the developer pain point or context.
2. What changed: summarize the technical change or concept.
3. Why it matters: connect it to real engineering decisions.
4. How to try it: provide steps, code, config, or a minimal example.
5. Risks and boundaries: mention version, compatibility, cost, or operational caveats.
6. Closing: give a practical recommendation and next action.

For local workflow tests, keep the draft compact: 800 to 1200 Chinese characters is enough to verify the writing and review loop. Expand only when the user asks for a full-length article.

## Draft Output

Return:

- title_options: 3 Chinese title options.
- summary: a 100 to 150 word summary.
- outline: section headings with one-line intent.
- draft: the article body.
- source_notes: sources used or sources still requiring verification.
- follow_up: one related follow-up article idea.

Do not invent official claims, benchmark numbers, release dates, or API guarantees.
