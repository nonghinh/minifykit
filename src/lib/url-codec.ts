export type UrlMode = "encode" | "decode";
export type UrlScope = "component" | "full";

export function urlEncode(text: string, scope: UrlScope): string {
  return scope === "component" ? encodeURIComponent(text) : encodeURI(text);
}

export function urlDecode(text: string, scope: UrlScope): string {
  return scope === "component" ? decodeURIComponent(text) : decodeURI(text);
}
