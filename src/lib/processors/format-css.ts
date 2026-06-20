import beautify from "js-beautify";

export async function formatCss(input: string): Promise<string> {
  return beautify.css(input, {
    indent_size: 2,
    end_with_newline: true,
    preserve_newlines: true,
    max_preserve_newlines: 1,
    newline_between_rules: true,
  });
}
