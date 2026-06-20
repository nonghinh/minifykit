import { minify } from "csso";

export async function minifyCss(input: string): Promise<string> {
  const { css } = minify(input, { restructure: true });
  return css;
}
