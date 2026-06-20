import { minify } from "terser";

export async function minifyJs(input: string): Promise<string> {
  const result = await minify(input, {
    compress: true,
    mangle: true,
    format: { comments: false },
  });
  if (!result.code) {
    throw new Error("Terser returned no output");
  }
  return result.code;
}
