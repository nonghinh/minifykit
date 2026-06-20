import { getTool, loadProcessor, type ToolId, type Processor } from "~/lib/processors";
import { validate } from "~/lib/validators";
import { byteLength, formatBytes, reductionPercent } from "~/lib/utils/bytes";
import type { MountedEditor } from "~/scripts/editor";

interface Refs {
  root: HTMLElement;
  input: HTMLTextAreaElement;
  output: HTMLTextAreaElement;
  processBtn: HTMLButtonElement;
  processLabel: HTMLElement;
  copyBtn: HTMLButtonElement;
  copyLabel: HTMLElement;
  clearBtn: HTMLButtonElement;
  themeBtn: HTMLButtonElement | null;
  errorBox: HTMLElement;
  stats: HTMLElement;
  statBefore: HTMLElement;
  statAfter: HTMLElement;
  statReduction: HTMLElement;
  inputSize: HTMLElement;
  outputSize: HTMLElement;
  toastRegion: HTMLElement;
  toolId: ToolId;
  inputEditor: MountedEditor | null;
  outputEditor: MountedEditor | null;
}

type ToastVariant = "success" | "info";

const TOAST_DURATION_MS = 2500;
const TOAST_ICONS: Record<ToastVariant, string> = {
  success:
    '<svg class="h-5 w-5 text-emerald-400 dark:text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  info: '<svg class="h-5 w-5 text-sky-400 dark:text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
};

const TOAST_CLASS =
  "pointer-events-auto flex items-center gap-2.5 rounded-lg border border-white/10 bg-slate-900/90 px-4 py-2.5 text-sm font-medium text-slate-50 shadow-xl ring-1 ring-black/10 backdrop-blur-md transition-all duration-200 ease-out dark:border-slate-900/10 dark:bg-slate-50/95 dark:text-slate-900 dark:ring-white/10";

const ERROR_CLASSES = {
  error: [
    "border-red-200",
    "bg-red-50",
    "text-red-700",
    "dark:border-red-900/60",
    "dark:bg-red-950/40",
    "dark:text-red-300",
  ],
  warning: [
    "border-amber-200",
    "bg-amber-50",
    "text-amber-800",
    "dark:border-amber-900/60",
    "dark:bg-amber-950/40",
    "dark:text-amber-300",
  ],
};

let processorCache: Processor | null = null;

function $<T extends Element = HTMLElement>(
  root: ParentNode,
  selector: string,
): T {
  const el = root.querySelector(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el as T;
}

function collectRefs(root: HTMLElement): Refs {
  const toolId = root.dataset.toolId as ToolId | undefined;
  if (!toolId) throw new Error("data-tool-id missing on root");
  return {
    root,
    input: $<HTMLTextAreaElement>(root, "[data-input]"),
    output: $<HTMLTextAreaElement>(root, "[data-output]"),
    processBtn: $<HTMLButtonElement>(root, '[data-action="process"]'),
    processLabel: $<HTMLElement>(root, "[data-process-label]"),
    copyBtn: $<HTMLButtonElement>(root, '[data-action="copy"]'),
    copyLabel: $<HTMLElement>(root, "[data-copy-label]"),
    clearBtn: $<HTMLButtonElement>(root, '[data-action="clear"]'),
    themeBtn: document.querySelector<HTMLButtonElement>("[data-theme-toggle]"),
    errorBox: $<HTMLElement>(root, "[data-error]"),
    stats: $<HTMLElement>(root, "[data-stats]"),
    statBefore: $<HTMLElement>(root, "[data-stat-before]"),
    statAfter: $<HTMLElement>(root, "[data-stat-after]"),
    statReduction: $<HTMLElement>(root, "[data-stat-reduction]"),
    inputSize: $<HTMLElement>(root, "[data-input-size]"),
    outputSize: $<HTMLElement>(root, "[data-output-size]"),
    toastRegion: $<HTMLElement>(root, "[data-toast-region]"),
    toolId,
    inputEditor: null,
    outputEditor: null,
  };
}

function showToast(refs: Refs, message: string, variant: ToastVariant = "success") {
  const toast = document.createElement("div");
  toast.setAttribute("role", "status");
  toast.className = `${TOAST_CLASS} translate-y-2 opacity-0`;
  toast.innerHTML = `${TOAST_ICONS[variant]}<span></span>`;
  const span = toast.querySelector("span");
  if (span) span.textContent = message;
  refs.toastRegion.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-2", "opacity-0");
  });

  window.setTimeout(() => {
    toast.classList.add("translate-y-2", "opacity-0");
    toast.addEventListener(
      "transitionend",
      () => toast.remove(),
      { once: true },
    );
    window.setTimeout(() => toast.remove(), 500);
  }, TOAST_DURATION_MS);
}

function showError(
  refs: Refs,
  message: string,
  severity: "error" | "warning" = "error",
) {
  refs.errorBox.classList.remove(...ERROR_CLASSES.error, ...ERROR_CLASSES.warning);
  refs.errorBox.classList.add(...ERROR_CLASSES[severity]);
  refs.errorBox.textContent = message;
  refs.errorBox.hidden = false;
}

function hideError(refs: Refs) {
  refs.errorBox.hidden = true;
  refs.errorBox.textContent = "";
}

let validateTimer: number | null = null;
function scheduleValidation(refs: Refs) {
  if (validateTimer !== null) window.clearTimeout(validateTimer);
  validateTimer = window.setTimeout(() => runValidation(refs), 400);
}

function runValidation(refs: Refs) {
  const result = validate(refs.toolId, refs.input.value);
  if (result.ok) {
    hideError(refs);
  } else {
    showError(refs, result.message, "warning");
  }
}

function hideStats(refs: Refs) {
  refs.stats.hidden = true;
}

function showStats(refs: Refs, before: number, after: number) {
  refs.statBefore.textContent = formatBytes(before);
  refs.statAfter.textContent = formatBytes(after);
  const pct = reductionPercent(before, after);
  refs.statReduction.textContent = `−${pct}%`;
  refs.stats.hidden = false;
}

function updateInputSize(refs: Refs) {
  refs.inputSize.textContent = formatBytes(byteLength(refs.input.value));
}

function updateOutputSize(refs: Refs) {
  refs.outputSize.textContent = formatBytes(byteLength(refs.output.value));
}

async function getProcessor(toolId: ToolId): Promise<Processor> {
  if (!processorCache) processorCache = await loadProcessor(toolId);
  return processorCache;
}

const INPUT_FRAME_CLASS =
  "h-[60vh] min-h-[300px] w-full overflow-hidden rounded-md border border-slate-200 bg-slate-50 transition-colors focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-300 focus-within:ring-offset-1 dark:border-slate-800 dark:bg-slate-900 dark:focus-within:border-slate-600 dark:focus-within:ring-slate-700";
const OUTPUT_FRAME_CLASS =
  "h-[60vh] min-h-[300px] w-full overflow-hidden rounded-md border border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-950";

async function upgradeToEditors(refs: Refs) {
  const { langForTool, mountEditor } = await import("~/scripts/editor");
  const lang = langForTool(refs.toolId);
  if (!lang) return;

  try {
    const [input, output] = await Promise.all([
      mountEditor(refs.input, lang, { frameClass: INPUT_FRAME_CLASS }),
      mountEditor(refs.output, lang, {
        frameClass: OUTPUT_FRAME_CLASS,
        readOnly: true,
      }),
    ]);
    refs.inputEditor = input;
    refs.outputEditor = output;
  } catch (err) {
    console.warn("Editor upgrade failed; staying on textarea.", err);
  }
}

function scheduleEditorUpgrade(refs: Refs) {
  const start = () => void upgradeToEditors(refs);
  if ("requestIdleCallback" in window) {
    (window as typeof window & {
      requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void;
    }).requestIdleCallback(start, { timeout: 1500 });
  } else {
    window.setTimeout(start, 600);
  }
}

function writeOutput(refs: Refs, value: string) {
  refs.output.value = value;
  refs.outputEditor?.setValue(value);
}

function writeInput(refs: Refs, value: string) {
  refs.input.value = value;
  refs.inputEditor?.setValue(value);
}

async function process(refs: Refs) {
  const raw = refs.input.value;
  if (!raw.trim()) {
    showError(refs, "Input is empty.");
    writeOutput(refs, "");
    updateOutputSize(refs);
    hideStats(refs);
    return;
  }

  hideError(refs);
  refs.processBtn.disabled = true;
  const originalLabel = refs.processLabel.textContent;
  refs.processLabel.textContent = "Processing…";

  try {
    const processor = await getProcessor(refs.toolId);
    const output = await processor(raw);
    writeOutput(refs, output);
    updateOutputSize(refs);

    const meta = getTool(refs.toolId);
    if (meta.kind === "minify") {
      const before = byteLength(raw);
      const after = byteLength(output);
      showStats(refs, before, after);
      const pct = reductionPercent(before, after);
      showToast(refs, `Minified — ${pct}% smaller`);
    } else {
      hideStats(refs);
      showToast(refs, "Formatted successfully");
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to process input.";
    showError(refs, message);
    writeOutput(refs, "");
    updateOutputSize(refs);
    hideStats(refs);
  } finally {
    refs.processBtn.disabled = false;
    refs.processLabel.textContent = originalLabel;
  }
}

async function copyOutput(refs: Refs) {
  const text = refs.output.value;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast(refs, "Copied to clipboard");
  } catch {
    refs.output.select();
    const ok = document.execCommand?.("copy");
    showToast(
      refs,
      ok ? "Copied to clipboard" : "Copy failed — selected for manual copy",
      ok ? "success" : "info",
    );
  }
}

function clearAll(refs: Refs) {
  writeInput(refs, "");
  writeOutput(refs, "");
  updateInputSize(refs);
  updateOutputSize(refs);
  hideError(refs);
  hideStats(refs);
  refs.input.focus();
}

function toggleTheme() {
  const root = document.documentElement;
  const isDark = root.classList.toggle("dark");
  try {
    localStorage.setItem("mk-theme", isDark ? "dark" : "light");
  } catch {}
}

export function initToolApp() {
  const root = document.querySelector<HTMLElement>("[data-tool-app]");
  if (!root) return;
  const refs = collectRefs(root);

  refs.processBtn.addEventListener("click", () => void process(refs));
  refs.copyBtn.addEventListener("click", () => void copyOutput(refs));
  refs.clearBtn.addEventListener("click", () => clearAll(refs));
  refs.themeBtn?.addEventListener("click", toggleTheme);

  refs.input.addEventListener("input", () => {
    updateInputSize(refs);
    scheduleValidation(refs);
  });

  refs.input.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      void process(refs);
    }
  });

  updateInputSize(refs);
  updateOutputSize(refs);

  scheduleEditorUpgrade(refs);
}
