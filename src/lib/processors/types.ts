export type ToolId =
  | "minify-js"
  | "minify-css"
  | "format-json"
  | "format-html"
  | "format-css"
  | "count-text"
  | "base64"
  | "jwt-decoder"
  | "url-codec"
  | "hash-generator"
  | "uuid-generator";

export interface ToolMeta {
  id: ToolId;
  slug: string;
  label: string;
  shortLabel: string;
  kind:
    | "minify"
    | "format"
    | "count"
    | "encode"
    | "decode"
    | "hash"
    | "generate";
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
  {
    id: "base64",
    slug: "/base64-encoder",
    label: "Base64",
    shortLabel: "Base64",
    kind: "encode",
    placeholder: "Paste text to encode or a Base64 string to decode…",
    title: "Base64 Encoder & Decoder Online — Free, No Upload",
    description:
      "Free Base64 encoder and decoder that runs in your browser. UTF-8 safe, handles emojis. Encode text to Base64 or decode Base64 to plain text instantly.",
    intro:
      "Encode any text to Base64 or decode a Base64 string back to plain text. UTF-8 safe — emojis and non-ASCII characters round-trip correctly. Everything happens locally in your browser.",
  },
  {
    id: "jwt-decoder",
    slug: "/jwt-decoder",
    label: "JWT Decoder",
    shortLabel: "JWT",
    kind: "decode",
    placeholder: "Paste a JWT (eyJhbGciOi…)",
    title: "JWT Decoder Online — Inspect JSON Web Tokens, Free & Private",
    description:
      "Free JWT decoder that runs in your browser. Inspect header, payload, and signature of any JSON Web Token without sending it to a server.",
    intro:
      "Paste a JSON Web Token to see its decoded header, payload, and signature. The token never leaves your browser — safe to paste production tokens for inspection. This tool does not verify signatures.",
  },
  {
    id: "url-codec",
    slug: "/url-encoder",
    label: "URL Encoder",
    shortLabel: "URL",
    kind: "encode",
    placeholder: "Paste text or a URL…",
    title: "URL Encoder & Decoder Online — Percent Encoding, Free",
    description:
      "Free URL encoder and decoder. Convert text to percent-encoded form for query strings or decode encoded URLs. Switch between component and full URI modes.",
    intro:
      "Encode text to percent-encoded form for query strings and form data, or decode percent-encoded URLs back to readable text. Choose component mode (encodes /, ?, &, etc.) or full URI mode for whole URLs.",
  },
  {
    id: "hash-generator",
    slug: "/hash-generator",
    label: "Hash Generator",
    shortLabel: "Hash",
    kind: "hash",
    placeholder: "Type or paste text to hash…",
    title: "SHA-1, SHA-256, SHA-512 Hash Generator Online — Free",
    description:
      "Free SHA-1, SHA-256, and SHA-512 hash generator powered by the Web Crypto API. Compute all three hashes from the same input in your browser.",
    intro:
      "Type or paste text below to compute its SHA-1, SHA-256, and SHA-512 hashes simultaneously. All hashing happens locally using the browser's built-in Web Crypto API.",
  },
  {
    id: "uuid-generator",
    slug: "/uuid-generator",
    label: "UUID Generator",
    shortLabel: "UUID",
    kind: "generate",
    placeholder: "",
    title: "UUID v4 & v7 Generator Online — Free & Bulk",
    description:
      "Free in-browser UUID generator. Generate UUID v4 (random) or UUID v7 (timestamp-sortable) in bulk. No upload, no signup, no rate limits.",
    intro:
      "Generate UUID v4 (random) or UUID v7 (timestamp-prefixed, sortable) in bulk. Choose how many you need, pick a version, and copy the entire list. Uses crypto.getRandomValues for cryptographically strong randomness.",
  },
];

export function getTool(id: ToolId): ToolMeta {
  const tool = TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`Unknown tool: ${id}`);
  return tool;
}
