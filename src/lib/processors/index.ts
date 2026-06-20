import type { ToolId } from "./types";

export type Processor = (input: string) => Promise<string>;

export async function loadProcessor(id: ToolId): Promise<Processor> {
  switch (id) {
    case "minify-js":
      return (await import("./minify-js")).minifyJs;
    case "minify-css":
      return (await import("./minify-css")).minifyCss;
    case "format-json":
      return (await import("./format-json")).formatJson;
    case "format-html":
      return (await import("./format-html")).formatHtml;
    case "format-css":
      return (await import("./format-css")).formatCss;
    case "count-text":
    case "base64":
    case "jwt-decoder":
    case "url-codec":
    case "hash-generator":
    case "uuid-generator":
      throw new Error(`${id} has no processor (handled by its own component)`);
  }
}

export { TOOLS, getTool } from "./types";
export type { ToolId, ToolMeta } from "./types";
