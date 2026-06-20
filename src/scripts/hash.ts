import { hashAll } from "~/lib/hash";
import { bindThemeToggle, copyToClipboard, debounce, showToast } from "~/scripts/ui";

export function initHash() {
  const root = document.querySelector<HTMLElement>("[data-hash-app]");
  if (!root) return;
  const input = root.querySelector<HTMLTextAreaElement>("[data-input]")!;
  const outputs = {
    "SHA-1": root.querySelector<HTMLInputElement>("[data-out='SHA-1']")!,
    "SHA-256": root.querySelector<HTMLInputElement>("[data-out='SHA-256']")!,
    "SHA-512": root.querySelector<HTMLInputElement>("[data-out='SHA-512']")!,
  } as const;
  const clearBtn = root.querySelector<HTMLButtonElement>('[data-action="clear"]')!;

  async function process() {
    const text = input.value;
    if (!text) {
      outputs["SHA-1"].value = "";
      outputs["SHA-256"].value = "";
      outputs["SHA-512"].value = "";
      return;
    }
    try {
      const all = await hashAll(text);
      outputs["SHA-1"].value = all["SHA-1"];
      outputs["SHA-256"].value = all["SHA-256"];
      outputs["SHA-512"].value = all["SHA-512"];
    } catch {
      // Web Crypto rarely fails on these primitives; ignore.
    }
  }

  const debouncedProcess = debounce(() => void process(), 200);

  input.addEventListener("input", debouncedProcess);
  clearBtn.addEventListener("click", () => {
    input.value = "";
    void process();
    input.focus();
  });

  for (const btn of root.querySelectorAll<HTMLButtonElement>(
    "[data-copy-for]",
  )) {
    btn.addEventListener("click", async () => {
      const target = root.querySelector<HTMLInputElement>(
        `[data-out='${btn.dataset.copyFor}']`,
      );
      if (!target?.value) return;
      if (await copyToClipboard(target.value)) {
        showToast(`Copied ${btn.dataset.copyFor}`);
      }
    });
  }

  bindThemeToggle();
}
