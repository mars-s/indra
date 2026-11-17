import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export interface Instruction {
  slug: string;
  title: string;
  scope: string;
  body: string;
  tokens: number;
}

const DIR = path.join(process.cwd(), "instructions");

// Each file is Markdown with a tiny header:
// ---
// title: Default
// scope: every machine starts with it
// ---
export async function getInstructions(): Promise<Instruction[]> {
  let files: string[];
  try {
    files = (await readdir(DIR)).filter((f) => f.endsWith(".md")).sort();
  } catch {
    return [];
  }
  return Promise.all(
    files.map(async (file) => {
      const text = await readFile(path.join(DIR, file), "utf8");
      const match = /^---\n([\s\S]*?)\n---\n?/.exec(text);
      const header = Object.fromEntries(
        (match?.[1] ?? "").split("\n").map((line) => {
          const i = line.indexOf(":");
          return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
        }),
      );
      const body = text.slice(match?.[0].length ?? 0).trim();
      return {
        slug: file.replace(/\.md$/, ""),
        title: header.title ?? file,
        scope: header.scope ?? "",
        body,
        // Rough estimate: about four characters per token.
        tokens: Math.round(body.length / 4),
      };
    }),
  );
}
