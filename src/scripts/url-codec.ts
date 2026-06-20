import { urlEncode, urlDecode, type UrlMode, type UrlScope } from "~/lib/url-codec";
import { bindThemeToggle, copyToClipboard, debounce, showToast } from "~/scripts/ui";

export function initUrlCodec() {
  const root = document.querySelector<HTMLElement>("[data-url-app]");
  if (!root) return;
  const input = root.querySelector<HTMLTextAreaElement>("[data-input]")!;
  const output = root.querySelector<HTMLTextAreaElement>("[data-output]")!;
  const errorBox = root.querySelector<HTMLElement>("[data-error]")!;
  const modeBtns = root.querySelectorAll<HTMLButtonElement>("[data-mode]");
  const scopeBtns = root.querySelectorAll<HTMLButtonElement>("[data-scope]");
  const clearBtn = root.querySelector<HTMLButtonElement>('[data-action="clear"]')!;
  const copyBtn = root.querySelector<HTMLButtonElement>('[data-action="copy"]')!;

  let mode: UrlMode = "encode";
  let scope: UrlScope = "component";

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
        mode === "encode" ? urlEncode(text, scope) : urlDecode(text, scope);
      hideError();
    } catch (err) {
      output.value = "";
      showError(
        err instanceof Error
          ? `Invalid percent-encoded input: ${err.message}`
          : "Invalid input.",
      );
    }
  }

  const debouncedProcess = debounce(process, 150);

  function paintGroup(
    btns: NodeListOf<HTMLButtonElement>,
    attr: string,
    active: string,
  ) {
    for (const btn of btns) {
      const isActive = btn.dataset[attr] === active;
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      btn.classList.toggle("bg-slate-900", isActive);
      btn.classList.toggle("text-slate-50", isActive);
      btn.classList.toggle("dark:bg-slate-100", isActive);
      btn.classList.toggle("dark:text-slate-900", isActive);
      btn.classList.toggle("text-slate-600", !isActive);
      btn.classList.toggle("dark:text-slate-400", !isActive);
    }
  }

  for (const btn of modeBtns) {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode as UrlMode;
      paintGroup(modeBtns, "mode", mode);
      process();
    });
  }
  for (const btn of scopeBtns) {
    btn.addEventListener("click", () => {
      scope = btn.dataset.scope as UrlScope;
      paintGroup(scopeBtns, "scope", scope);
      process();
    });
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
  paintGroup(modeBtns, "mode", mode);
  paintGroup(scopeBtns, "scope", scope);
}
