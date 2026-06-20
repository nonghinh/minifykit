import { decodeJwt } from "~/lib/jwt";
import { bindThemeToggle, copyToClipboard, debounce, showToast } from "~/scripts/ui";

function formatTimestamp(value: unknown): string | null {
  if (typeof value !== "number") return null;
  const ms = value > 1e12 ? value : value * 1000;
  const date = new Date(ms);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().replace(".000Z", "Z");
}

function annotatePayload(payload: unknown): string {
  const json = JSON.stringify(payload, null, 2);
  if (!payload || typeof payload !== "object") return json;
  const obj = payload as Record<string, unknown>;
  const lines: string[] = [];
  const keys: ["exp" | "iat" | "nbf", string][] = [
    ["iat", "issued at"],
    ["nbf", "not before"],
    ["exp", "expires"],
  ];
  for (const [k, label] of keys) {
    const t = formatTimestamp(obj[k]);
    if (t) lines.push(`// ${k} (${label}): ${t}`);
  }
  return lines.length > 0 ? `${lines.join("\n")}\n${json}` : json;
}

export function initJwt() {
  const root = document.querySelector<HTMLElement>("[data-jwt-app]");
  if (!root) return;
  const input = root.querySelector<HTMLTextAreaElement>("[data-input]")!;
  const header = root.querySelector<HTMLTextAreaElement>("[data-header]")!;
  const payload = root.querySelector<HTMLTextAreaElement>("[data-payload]")!;
  const signature = root.querySelector<HTMLTextAreaElement>("[data-signature]")!;
  const errorBox = root.querySelector<HTMLElement>("[data-error]")!;
  const clearBtn = root.querySelector<HTMLButtonElement>('[data-action="clear"]')!;

  function showError(msg: string) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }
  function hideError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }

  function process() {
    const token = input.value.trim();
    if (!token) {
      header.value = "";
      payload.value = "";
      signature.value = "";
      hideError();
      return;
    }
    try {
      const decoded = decodeJwt(token);
      header.value = JSON.stringify(decoded.header, null, 2);
      payload.value = annotatePayload(decoded.payload);
      signature.value = decoded.signature;
      hideError();
    } catch (err) {
      header.value = "";
      payload.value = "";
      signature.value = "";
      showError(err instanceof Error ? err.message : "Invalid JWT.");
    }
  }

  const debouncedProcess = debounce(process, 200);

  input.addEventListener("input", debouncedProcess);
  clearBtn.addEventListener("click", () => {
    input.value = "";
    header.value = "";
    payload.value = "";
    signature.value = "";
    hideError();
    input.focus();
  });

  for (const btn of root.querySelectorAll<HTMLButtonElement>(
    "[data-copy-target]",
  )) {
    btn.addEventListener("click", async () => {
      const targetSel = btn.dataset.copyTarget!;
      const target = root.querySelector<HTMLTextAreaElement>(targetSel);
      if (!target) return;
      if (await copyToClipboard(target.value)) {
        showToast("Copied to clipboard");
      } else if (target.value) {
        target.select();
        showToast("Copy failed — selected for manual copy", "info");
      }
    });
  }

  bindThemeToggle();
}
