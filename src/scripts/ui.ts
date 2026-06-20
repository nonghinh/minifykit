export type ToastVariant = "success" | "info" | "error";

const TOAST_DURATION_MS = 2500;
const TOAST_ICONS: Record<ToastVariant, string> = {
  success:
    '<svg class="h-5 w-5 text-emerald-400 dark:text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  info: '<svg class="h-5 w-5 text-sky-400 dark:text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
  error:
    '<svg class="h-5 w-5 text-red-400 dark:text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
};
const TOAST_CLASS =
  "pointer-events-auto flex items-center gap-2.5 rounded-lg border border-white/10 bg-slate-900/90 px-4 py-2.5 text-sm font-medium text-slate-50 shadow-xl ring-1 ring-black/10 backdrop-blur-md transition-all duration-200 ease-out dark:border-slate-900/10 dark:bg-slate-50/95 dark:text-slate-900 dark:ring-white/10";

export function showToast(message: string, variant: ToastVariant = "success") {
  const region = document.querySelector<HTMLElement>("[data-toast-region]");
  if (!region) return;
  const toast = document.createElement("div");
  toast.setAttribute("role", "status");
  toast.className = `${TOAST_CLASS} translate-y-2 opacity-0`;
  toast.innerHTML = `${TOAST_ICONS[variant]}<span></span>`;
  const span = toast.querySelector("span");
  if (span) span.textContent = message;
  region.appendChild(toast);
  requestAnimationFrame(() =>
    toast.classList.remove("translate-y-2", "opacity-0"),
  );
  window.setTimeout(() => {
    toast.classList.add("translate-y-2", "opacity-0");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
    window.setTimeout(() => toast.remove(), 500);
  }, TOAST_DURATION_MS);
}

export function bindThemeToggle() {
  document
    .querySelector<HTMLButtonElement>("[data-theme-toggle]")
    ?.addEventListener("click", () => {
      const isDark = document.documentElement.classList.toggle("dark");
      try {
        localStorage.setItem("mk-theme", isDark ? "dark" : "light");
      } catch {}
    });
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  ms: number,
): T {
  let timer: number | null = null;
  return ((...args: never[]) => {
    if (timer !== null) window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), ms);
  }) as T;
}
