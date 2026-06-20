import type { ToolId } from "~/lib/processors";

export interface MountedEditor {
  setValue(value: string): void;
  destroy(): void;
}

export type EditorLang = "json" | "html" | "css";

const LANG_BY_TOOL: Partial<Record<ToolId, EditorLang>> = {
  "format-json": "json",
  "format-html": "html",
  "format-css": "css",
};

export function langForTool(toolId: ToolId): EditorLang | null {
  return LANG_BY_TOOL[toolId] ?? null;
}

async function loadLangExtension(lang: EditorLang) {
  switch (lang) {
    case "json":
      return (await import("@codemirror/lang-json")).json();
    case "html":
      return (await import("@codemirror/lang-html")).html();
    case "css":
      return (await import("@codemirror/lang-css")).css();
  }
}

interface MountOptions {
  readOnly?: boolean;
  frameClass: string;
}

export async function mountEditor(
  textarea: HTMLTextAreaElement,
  lang: EditorLang,
  options: MountOptions,
): Promise<MountedEditor> {
  const [
    { EditorView, basicSetup },
    { Compartment, EditorState },
    { oneDark },
    langExtension,
  ] = await Promise.all([
    import("codemirror"),
    import("@codemirror/state"),
    import("@codemirror/theme-one-dark"),
    loadLangExtension(lang),
  ]);

  const isDark = () => document.documentElement.classList.contains("dark");

  const baseTheme = EditorView.theme({
    "&": {
      height: "100%",
      fontSize: "13px",
      backgroundColor: "transparent",
    },
    ".cm-scroller": {
      fontFamily:
        'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
      lineHeight: "1.5",
    },
    ".cm-content": { padding: "12px 0" },
    ".cm-gutters": {
      backgroundColor: "transparent",
      borderRight: "1px solid var(--border)",
      color: "var(--fg-muted)",
    },
    ".cm-activeLineGutter, .cm-activeLine": {
      backgroundColor: "transparent",
    },
    ".cm-focused": { outline: "none" },
  });

  const container = document.createElement("div");
  container.className = options.frameClass;
  container.setAttribute("data-cm-host", "");
  textarea.style.display = "none";
  textarea.insertAdjacentElement("beforebegin", container);

  const themeComp = new Compartment();

  const extensions = [
    basicSetup,
    langExtension,
    baseTheme,
    themeComp.of(isDark() ? oneDark : []),
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (!update.docChanged) return;
      const value = update.state.doc.toString();
      if (textarea.value !== value) {
        textarea.value = value;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }),
  ];

  if (options.readOnly) {
    extensions.push(EditorState.readOnly.of(true));
    extensions.push(EditorView.editable.of(false));
  }

  const view = new EditorView({
    doc: textarea.value,
    parent: container,
    extensions,
  });

  const themeObserver = new MutationObserver(() => {
    view.dispatch({
      effects: themeComp.reconfigure(isDark() ? oneDark : []),
    });
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return {
    setValue(value) {
      const current = view.state.doc.toString();
      if (current === value) return;
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
      textarea.value = value;
    },
    destroy() {
      themeObserver.disconnect();
      view.destroy();
      container.remove();
      textarea.style.display = "";
    },
  };
}
