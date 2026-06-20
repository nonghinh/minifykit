import { countText } from "~/lib/counter";
import { formatBytes } from "~/lib/utils/bytes";

function setText(root: HTMLElement, key: string, value: string) {
  const el = root.querySelector<HTMLElement>(`[data-stat="${key}"]`);
  if (el) el.textContent = value;
}

function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.classList.toggle("dark");
  try {
    localStorage.setItem("mk-theme", isDark ? "dark" : "light");
  } catch {}
}

export function initCounter() {
  const root = document.querySelector<HTMLElement>("[data-counter-app]");
  if (!root) return;
  const input = root.querySelector<HTMLTextAreaElement>("[data-input]");
  const clearBtn = root.querySelector<HTMLButtonElement>(
    '[data-action="clear"]',
  );
  if (!input || !clearBtn) return;

  const fmt = (n: number) => n.toLocaleString();

  function update() {
    const stats = countText(input!.value);
    setText(root!, "characters", fmt(stats.characters));
    setText(root!, "chars-no-spaces", fmt(stats.charactersNoSpaces));
    setText(root!, "words", fmt(stats.words));
    setText(root!, "lines", fmt(stats.lines));
    setText(root!, "paragraphs", fmt(stats.paragraphs));
    setText(root!, "bytes", formatBytes(stats.bytes));
  }

  input.addEventListener("input", update);
  clearBtn.addEventListener("click", () => {
    input.value = "";
    input.focus();
    update();
  });

  document
    .querySelector<HTMLButtonElement>("[data-theme-toggle]")
    ?.addEventListener("click", toggleTheme);

  update();
}
