export async function formatJson(input: string, indent = 2): Promise<string> {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const parsed = JSON.parse(trimmed);
  return JSON.stringify(parsed, null, indent);
}
