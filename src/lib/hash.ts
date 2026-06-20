export type HashAlgo = "SHA-1" | "SHA-256" | "SHA-512";

export async function hash(text: string, algo: HashAlgo): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algo, bytes);
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

export async function hashAll(text: string): Promise<Record<HashAlgo, string>> {
  const [s1, s256, s512] = await Promise.all([
    hash(text, "SHA-1"),
    hash(text, "SHA-256"),
    hash(text, "SHA-512"),
  ]);
  return { "SHA-1": s1, "SHA-256": s256, "SHA-512": s512 };
}
