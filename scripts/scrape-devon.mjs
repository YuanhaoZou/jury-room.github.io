#!/usr/bin/env node
// Pull AI-skepticism comments from HackerNews via the public Algolia search
// API, then run the corpus through Claude to extract authentic-sounding
// trigger phrases and reaction lines for Devon, the AI-skeptic senior engineer
// juror.
//
// Why HN over Reddit: HN is the canonical senior-engineer hangout, has a free
// public search API (no auth, no rate limits), and is where AI-skepticism
// discourse happens in real time. Comments scoped to post-2023 (post-ChatGPT)
// to ensure relevance.
//
// Run:
//   ANTHROPIC_API_KEY=sk-ant-... npm run scrape:devon
//
// API docs: https://hn.algolia.com/api
//
// Re-runs reuse the raw cache in scripts/raw-cache/ — delete that directory
// to force a fresh pull.

import Anthropic from "@anthropic-ai/sdk";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CACHE_DIR = path.join(__dirname, "raw-cache");
const OUTPUT_FILE = path.join(ROOT, "src/data/devon-corpus.json");

// Search queries — each one becomes a separate Algolia call. Pick terms that
// surface AI-skepticism in engineering contexts.
const QUERIES = [
  "github copilot",
  "vibe coding",
  "cursor ai",
  "claude code",
  "ai assistant code",
  "llm coding",
  "ai replace developer",
  "ai generated code",
];

const HITS_PER_QUERY = 100;
const POST_CHATGPT_UNIX = Math.floor(new Date("2023-01-01").getTime() / 1000);
const REQUEST_DELAY_MS = 250;

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchHN(query) {
  const url =
    `https://hn.algolia.com/api/v1/search?` +
    `query=${encodeURIComponent(query)}` +
    `&tags=comment` +
    `&numericFilters=created_at_i>${POST_CHATGPT_UNIX}` +
    `&hitsPerPage=${HITS_PER_QUERY}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    if (res.status === 429 || res.status >= 500) {
      const backoff = 1500 * (attempt + 1);
      console.warn(`  retry ${attempt + 1}/3 after ${backoff}ms (${res.status})`);
      await sleep(backoff);
      continue;
    }
    throw new Error(`GET ${url} -> ${res.status}`);
  }
  throw new Error(`giving up on query="${query}"`);
}

async function fetchQuery(query) {
  const safe = query.replace(/[^a-z0-9]+/gi, "-");
  const cachePath = path.join(CACHE_DIR, `hn-${safe}.json`);
  if (existsSync(cachePath)) {
    const cached = JSON.parse(await readFile(cachePath, "utf-8"));
    console.log(`[cache] "${query}" (${cached.length} comments)`);
    return cached;
  }

  console.log(`[fetch] "${query}"`);
  const data = await searchHN(query);
  const comments = (data.hits ?? [])
    .map((h) => ({
      id: h.objectID,
      query,
      createdAt: h.created_at,
      body: stripHtml(h.comment_text ?? ""),
      storyTitle: h.story_title ?? "",
      author: h.author ?? "",
      url: `https://news.ycombinator.com/item?id=${h.objectID}`,
    }))
    .filter((c) => c.body && c.body.length >= 40);

  await writeFile(cachePath, JSON.stringify(comments, null, 2));
  console.log(`  → ${comments.length} comments cached`);
  return comments;
}

async function extractWithClaude(comments) {
  const client = new Anthropic();

  // Dedupe by id, then truncate any single comment to avoid blowing the prompt.
  const seen = new Set();
  const unique = comments.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });

  const sample = unique.slice(0, 150);
  const corpus = sample
    .map(
      (c, i) =>
        `[${i + 1}] HN comment on "${c.storyTitle.slice(0, 80)}"\n${c.body.slice(0, 800)}`,
    )
    .join("\n\n---\n\n");

  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      lexicon: {
        type: "array",
        items: { type: "string" },
        description:
          "10-16 trigger phrases (2-5 words each) that AI-skeptical senior engineers actually use when complaining about AI dev tools, autonomous agents, or vibe-coding hype. Pull verbatim phrasings from the HN corpus — slang, marketing buzzwords they hate, specific tool names they distrust, common technical complaints. Lowercase.",
      },
      upsetLines: {
        type: "array",
        items: { type: "string" },
        description:
          "6-10 one-line reactions a 12-year-veteran engineer would blurt out when reading marketing copy that screams 'AI replaces your dev team'. Sound like an HN top-comment: dry, technical, dark humor, specific to AI-coding failure modes (hallucinated APIs, deleted code, untested PRs, deskilled juniors). Each under 80 chars. End with ! or ?",
      },
      calmLines: {
        type: "array",
        items: { type: "string" },
        description:
          "3-5 short reactions when copy respects engineering rigor (code review, architecture, testing, observability). Relieved but still wary. Under 80 chars each.",
      },
    },
    required: ["lexicon", "upsetLines", "calmLines"],
  };

  console.log(
    `[claude] extracting from ${sample.length} unique HN comments (Opus 4.7 + adaptive thinking)…`,
  );

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: [
      {
        type: "text",
        text:
          "You analyze online discourse to surface authentic-sounding voices for synthetic personas. " +
          "Today's persona is Devon: a senior software engineer (12 years), wary of AI dev tools, " +
          "skeptical of Copilot-generated code, allergic to 'vibe coding' and '10x developer' marketing. " +
          "Mine the HackerNews corpus for the specific words, phrases, jokes, and technical complaints " +
          "this community actually uses — not generic ML jargon, not sanitized corporate language. " +
          "Preserve voice. Stay under 80 chars per reaction line.",
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content:
          "HackerNews corpus (AI-skepticism comments from 2023+ via Algolia search):\n\n" +
          corpus +
          "\n\nExtract Devon's lexicon, upsetLines, and calmLines per the schema.",
      },
    ],
    output_config: { format: { type: "json_schema", schema } },
  });

  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("no text block in Claude response");

  const usage = response.usage;
  console.log(
    `  tokens: ${usage.input_tokens} in / ${usage.output_tokens} out` +
      ` • cache ${usage.cache_read_input_tokens ?? 0} read / ${usage.cache_creation_input_tokens ?? 0} write`,
  );

  return { extracted: JSON.parse(text), uniqueCount: unique.length, sampleCount: sample.length };
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("error: ANTHROPIC_API_KEY env var required");
    process.exit(1);
  }

  await mkdir(CACHE_DIR, { recursive: true });
  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

  const all = [];
  for (const query of QUERIES) {
    all.push(...(await fetchQuery(query)));
    await sleep(REQUEST_DELAY_MS);
  }
  console.log(`[total] ${all.length} HN comments fetched across ${QUERIES.length} queries`);

  if (all.length < 30) {
    console.warn("warning: fewer than 30 comments — extraction quality may suffer");
  }

  const { extracted, uniqueCount, sampleCount } = await extractWithClaude(all);

  const corpus = {
    generatedAt: new Date().toISOString(),
    sourceDataset: "HackerNews via hn.algolia.com",
    sourceQueries: QUERIES,
    rawCommentCount: all.length,
    uniqueCommentCount: uniqueCount,
    sampledForExtraction: sampleCount,
    sourceCommentIds: all.slice(0, 50).map((c) => c.id),
    ...extracted,
  };

  await writeFile(OUTPUT_FILE, JSON.stringify(corpus, null, 2));
  console.log(`\n✓ wrote ${path.relative(ROOT, OUTPUT_FILE)}`);
  console.log(`  ${corpus.lexicon.length} trigger phrases`);
  console.log(`  ${corpus.upsetLines.length} upset lines`);
  console.log(`  ${corpus.calmLines.length} calm lines`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
