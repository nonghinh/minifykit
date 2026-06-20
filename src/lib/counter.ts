export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  bytes: number;
}

export function countText(text: string): TextStats {
  // Use Array.from for proper Unicode counting (emojis = 1 character, not 2).
  const characters = Array.from(text).length;
  const charactersNoSpaces = Array.from(text.replace(/\s/g, "")).length;
  const trimmed = text.trim();
  const words = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  const lines = text === "" ? 0 : text.split(/\r\n|\r|\n/).length;
  const paragraphs =
    trimmed === ""
      ? 0
      : text
          .split(/\n\s*\n/)
          .filter((p) => p.trim() !== "").length;
  const bytes = new TextEncoder().encode(text).length;
  return {
    characters,
    charactersNoSpaces,
    words,
    lines,
    paragraphs,
    bytes,
  };
}
