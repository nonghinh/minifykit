export function byteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function reductionPercent(before: number, after: number): number {
  if (before <= 0) return 0;
  return Math.max(0, Math.round(((before - after) / before) * 1000) / 10);
}
