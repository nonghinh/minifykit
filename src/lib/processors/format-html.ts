import beautify from "js-beautify";

export async function formatHtml(input: string): Promise<string> {
  return beautify.html(input, {
    indent_size: 2,
    wrap_line_length: 0,
    preserve_newlines: true,
    max_preserve_newlines: 1,
    end_with_newline: true,
    indent_inner_html: false,
    extra_liners: [],
  });
}
