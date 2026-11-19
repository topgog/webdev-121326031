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

## 2026-11-19 · Slice 1 (sign-in and list of labs), built by Claude
- Goal: build slice 1 from SPEC.md (AC-9, AC-10, AC-11), because Gemini CLI kept failing
- Delegated: the plan and all the code (migration, layers, screens, tests), written by Claude (a chat assistant, not Gemini CLI); it had no access to my repository, I got the files as a zip and unpacked them; it also chose and installed express, which is on the "always ask before" list, and I allowed it by handing it the whole step; the first draft of the "Spec vs result" note is also from Claude
- Checkpoints: I approved the plan before the code; npm test (39 of 39), node checks/ex2.mjs (32/32), and I checked AC-9, AC-10 and AC-11 by hand in the browser, deleting a row from labs with sqlite3
- Went wrong: Gemini CLI failed with "fetch failed sending request" and never reached a plan; Claude's own tests caught a bug in its password check (a damaged hash would have accepted any password), fixed before I got the files
- Changed by hand: I wrote the "Spec vs result" note into SPEC.md and added a line to Constraints; nothing in the code