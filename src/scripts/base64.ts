import { base64Encode, base64Decode } from "~/lib/base64";
import { bindThemeToggle, copyToClipboard, debounce, showToast } from "~/scripts/ui";

type Mode = "encode" | "decode";

export function initBase64() {
  const root = document.querySelector<HTMLElement>("[data-base64-app]");
  if (!root) return;
  const input = root.querySelector<HTMLTextAreaElement>("[data-input]")!;
  const output = root.querySelector<HTMLTextAreaElement>("[data-output]")!;
  const modeBtns = root.querySelectorAll<HTMLButtonElement>("[data-mode]");
  const clearBtn = root.querySelector<HTMLButtonElement>('[data-action="clear"]')!;
  const copyBtn = root.querySelector<HTMLButtonElement>('[data-action="copy"]')!;
  const errorBox = root.querySelector<HTMLElement>("[data-error]")!;

  let mode: Mode = "encode";

  function showError(msg: string) {
    errorBox.textContent = msg;
    errorBox.hidden = false;
  }
  function hideError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }

  function process() {
    const text = input.value;
    if (!text) {
      output.value = "";
      hideError();
      return;
    }
    try {
      output.value =
        mode === "encode" ? base64Encode(text) : base64Decode(text);
      hideError();
    } catch (err) {
      output.value = "";
      showError(
        err instanceof Error
          ? `Invalid Base64 input: ${err.message}`
          : "Invalid Base64 input.",
      );
    }
  }

  const debouncedProcess = debounce(process, 150);

  function setMode(next: Mode) {
    mode = next;
    for (const btn of modeBtns) {
      const active = btn.dataset.mode === next;
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.classList.toggle("bg-slate-900", active);
      btn.classList.toggle("text-slate-50", active);
      btn.classList.toggle("dark:bg-slate-100", active);
      btn.classList.toggle("dark:text-slate-900", active);
      btn.classList.toggle("text-slate-600", !active);
      btn.classList.toggle("dark:text-slate-400", !active);
    }
    input.placeholder =
      next === "encode"
        ? "Paste text to encode to Base64…"
        : "Paste Base64 string to decode…";
    process();
  }

  for (const btn of modeBtns) {
    btn.addEventListener("click", () =>
      setMode(btn.dataset.mode as Mode),
    );
  }

  input.addEventListener("input", debouncedProcess);

  clearBtn.addEventListener("click", () => {
    input.value = "";
    output.value = "";
    hideError();
    input.focus();
  });

  copyBtn.addEventListener("click", async () => {
    if (await copyToClipboard(output.value)) {
      showToast("Copied to clipboard");
    } else if (output.value) {
      output.select();
      showToast("Copy failed — selected for manual copy", "info");
    }
  });

  bindThemeToggle();
  setMode("encode");
}
