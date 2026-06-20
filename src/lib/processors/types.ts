export type ToolId =
  | "minify-js"
  | "minify-css"
  | "format-json"
  | "format-html"
  | "format-css"
  | "count-text";

export interface ToolMeta {
  id: ToolId;
  slug: string;
  label: string;
  shortLabel: string;
  kind: "minify" | "format" | "count";
  placeholder: string;
  title: string;
  description: string;
  intro: string;
}

export const TOOLS: ToolMeta[] = [
  {
    id: "minify-js",
    slug: "/minify-js",
    label: "Minify JS",
    shortLabel: "JS",
    kind: "minify",
    placeholder: "// Paste JavaScript here…",
    title: "Minify JavaScript Online — MinifyKit",
    description:
      "Free in-browser JavaScript minifier powered by terser. Compress JS to reduce bundle size. No upload, no signup.",
    intro:
      "Paste JavaScript below to compress it with terser — mangling identifiers, dropping whitespace and dead code. Runs locally; your code never leaves the browser.",
  },
  {
    id: "minify-css",
    slug: "/minify-css",
    label: "Minify CSS",
    shortLabel: "CSS",
    kind: "minify",
    placeholder: "/* Paste CSS here… */",
    title: "Minify CSS Online — MinifyKit",
    description:
      "Free in-browser CSS minifier powered by csso. Shrinks stylesheets for faster page loads. No upload, no signup.",
    intro:
      "Paste CSS below to minify it with csso — restructures and removes redundant rules. Everything happens on your machine; nothing is sent to a server.",
  },
  {
    id: "format-json",
    slug: "/format-json",
    label: "Format JSON",
    shortLabel: "JSON",
    kind: "format",
    placeholder: '{ "paste": "JSON here" }',
    title: "Format & Beautify JSON Online — MinifyKit",
    description:
      "Free in-browser JSON beautifier and validator. Pretty-print JSON with 2-space indentation. No upload, no signup.",
    intro:
      "Paste JSON to beautify it with the standard 2-space indentation. Invalid JSON is flagged inline as you paste, so you can fix it before processing.",
  },
  {
    id: "format-html",
    slug: "/format-html",
    label: "Format HTML",
    shortLabel: "HTML",
    kind: "format",
    placeholder: "<!-- Paste HTML here -->",
    title: "Format & Beautify HTML Online — MinifyKit",
    description:
      "Free in-browser HTML beautifier powered by js-beautify. Indent and clean up HTML markup. No upload, no signup.",
    intro:
      "Paste HTML below to beautify it with js-beautify. The output uses 2-space indentation and preserves up to one blank line between elements.",
  },
  {
    id: "format-css",
    slug: "/format-css",
    label: "Format CSS",
    shortLabel: "CSS",
    kind: "format",
    placeholder: "/* Paste CSS here… */",
    title: "Format & Beautify CSS Online — MinifyKit",
    description:
      "Free in-browser CSS beautifier powered by js-beautify. Pretty-print and reformat stylesheets. No upload, no signup.",
    intro:
      "Paste CSS below to beautify it with js-beautify. Rules are indented with 2 spaces and a blank line is inserted between rule blocks for readability.",
  },
  {
    id: "count-text",
    slug: "/character-counter",
    label: "Count Text",
    shortLabel: "Count",
    kind: "count",
    placeholder: "Paste or type text here…",
    title: "Character Counter — Count Characters, Words & Lines Online",
    description:
      "Free in-browser character counter. Count characters, words, lines, paragraphs, and bytes instantly. Useful for tweets, SMS, meta descriptions.",
    intro:
      "Paste or type text below to see character, word, line, and byte counts update as you type. Useful for Twitter limits, SMS character counts, meta descriptions, and writing exercises.",
  },
];

export function getTool(id: ToolId): ToolMeta {
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`Unknown tool: ${id}`);
  return tool;
}
