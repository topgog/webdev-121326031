# Agent log

One entry per agent session, newest at the bottom. Be honest: what went wrong is the useful part.

<!-- Copy this block for each session:

## YYYY-MM-DD · <short title>
- Goal: connect the agent to my MCP server and see whether it chooses a tool by its description
- Delegated: - Delegated: explanations of each step, a second tool idea (search_lectures), and the complete file for each step; I typed some of it and pasted the rest into server.js; the assistant had no access to my repository
- Checkpoints:
- Went wrong: "Usage limit reached for gemini-3.8-flash" stopped the agent twice; the experiment with a vague description was not run
- Changed by hand:

-->

## 2026-11-01  server.js, steps 2 to 8
- Goal: understand the MCP protocol and build mcp-server/server.js step by step
- Delegated: explanations of each step, a second tool idea (search_lectures), and the complete file for each step; the assistant had no access to my repository and I applied its code to server.js myself
- Checkpoints: node mcp-server/check.mjs after every step (3/8, 8/12, 9/12, 12/12), an echo test for each message, one recorded session in README.md
- Went wrong: after step 4 the check still said 3/8, because I had put the tools/list block inside the if for notifications/initialized, so it never ran; the assistant pointed at the nesting
- Changed by hand: README.md (session transcript, start command, experiment), AGENT_LOG.md, USAGE.md and package.json

## 2026-11-02 · Gemini CLI: first check
- Goal: check that the agent starts and can read the repository
- Delegated: one question only (what AGENTS.md is for); the agent changed no file
- Checkpoints: compared the answer with AGENTS.md
- Went wrong: the first answer took about a minute and later questions took several minutes or hung
- Changed by hand: nothing

## 2026-11-02 · Gemini CLI: connect to my server and description experiment
- Goal: connect the agent to my MCP server and see whether it chooses a tool by its description
- Delegated: question and answer; Gemini called find_lecture on its own after I allowed it once; the agent changed no file
- Checkpoints: /mcp to check the connection, "Allow once" for the tool call, /stats for the tokens
- Went wrong: "Usage limit reached for gemini-3.8-flash" stopped the agent twice; the experiment with a vague description was not run
- Changed by hand: nothing in this session