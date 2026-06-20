export interface DecodedJwt {
  header: unknown;
  payload: unknown;
  signature: string;
}

function base64UrlDecode(input: string): string {
  const cleaned = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = cleaned + "===".slice(0, (4 - (cleaned.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export function decodeJwt(token: string): DecodedJwt {
  const trimmed = token.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    throw new Error(
      `A JWT must have 3 parts separated by "." — got ${parts.length}.`,
    );
  }
  let header: unknown;
  let payload: unknown;
  try {
    header = JSON.parse(base64UrlDecode(parts[0]));
  } catch (e) {
    throw new Error(
      `Header is not valid Base64URL-encoded JSON: ${
        e instanceof Error ? e.message : "unknown error"
      }`,
    );
  }
  try {
    payload = JSON.parse(base64UrlDecode(parts[1]));
  } catch (e) {
    throw new Error(
      `Payload is not valid Base64URL-encoded JSON: ${
        e instanceof Error ? e.message : "unknown error"
      }`,
    );
  }
  return { header, payload, signature: parts[2] };
}
