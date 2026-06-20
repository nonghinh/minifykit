import { generate, type UuidVersion } from "~/lib/uuid";
import { bindThemeToggle, copyToClipboard, showToast } from "~/scripts/ui";

export function initUuid() {
  const root = document.querySelector<HTMLElement>("[data-uuid-app]");
  if (!root) return;
  const output = root.querySelector<HTMLTextAreaElement>("[data-output]")!;
  const countInput = root.querySelector<HTMLInputElement>("[data-count]")!;
  const versionBtns = root.querySelectorAll<HTMLButtonElement>("[data-version]");
  const generateBtn = root.querySelector<HTMLButtonElement>('[data-action="generate"]')!;
  const copyBtn = root.querySelector<HTMLButtonElement>('[data-action="copy"]')!;
  const clearBtn = root.querySelector<HTMLButtonElement>('[data-action="clear"]')!;

  let version: UuidVersion = "v4";

  function setVersion(next: UuidVersion) {
    version = next;
    for (const btn of versionBtns) {
      const active = btn.dataset.version === next;
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.classList.toggle("bg-slate-900", active);
      btn.classList.toggle("text-slate-50", active);
      btn.classList.toggle("dark:bg-slate-100", active);
      btn.classList.toggle("dark:text-slate-900", active);
      btn.classList.toggle("text-slate-600", !active);
      btn.classList.toggle("dark:text-slate-400", !active);
    }
  }

  function clampCount(): number {
    const n = Math.floor(Number(countInput.value));
    if (!Number.isFinite(n) || n < 1) return 1;
    if (n > 1000) return 1000;
    return n;
  }

  function doGenerate() {
    const count = clampCount();
    countInput.value = String(count);
    const list = generate(version, count);
    output.value = list.join("\n");
  }

  for (const btn of versionBtns) {
    btn.addEventListener("click", () =>
      setVersion(btn.dataset.version as UuidVersion),
    );
  }
  generateBtn.addEventListener("click", doGenerate);
  countInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      doGenerate();
    }
  });
  clearBtn.addEventListener("click", () => {
    output.value = "";
  });
  copyBtn.addEventListener("click", async () => {
    if (await copyToClipboard(output.value)) {
      const n = output.value.split("\n").filter(Boolean).length;
      showToast(`Copied ${n} UUID${n === 1 ? "" : "s"}`);
    } else if (output.value) {
      output.select();
      showToast("Copy failed — selected for manual copy", "info");
    }
  });

  bindThemeToggle();
  setVersion("v4");
  doGenerate();
}
