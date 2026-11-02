# Usage

One row per agent session. In Gemini CLI, type `/stats` before you quit and copy the input and output tokens. Copilot shows credits instead of tokens: write those in the credits column. The free tier charges nothing, so record what the session **would cost at the provider's published list price**, and note once below the table which price list you used. Leave the cost empty for rows that only show credits.

| Date | Tool | Input tokens | Output tokens | Credits (if no tokens) | List-price cost |
|---|---|---|---|---|---|
| 2026-11-02 | Gemini CLI (gemini-3.8-flash, gemini-3.5-flash-lite) | 14 544 | 68 | | $0.010 |
| 2026-11-01 to 2026-11-02 | Claude (separate chat assistant, not part of the course tooling) | not shown | not shown | | not computed |

Price list used: Google Gemini API list prices (https://ai.google.dev/gemini-api/docs/pricing), checked on 2026-11-02: gemini-3.8-flash $0.75 in / $3.75 out per 1M tokens (promotional price until 2026-12-31), gemini-3.5-flash-lite $0.30 in / $2.50 out per 1M tokens. 10 309 cache reads on gemini-3.8-flash were not counted. The first Gemini session of 2026-11-02 (one question about AGENTS.md) was not recorded with /stats.

