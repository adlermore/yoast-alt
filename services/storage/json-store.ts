/**
 * Generic JSON file storage — the application's persistence layer.
 *
 * There is no database anywhere in this product. Reports, history, and settings
 * are plain JSON files under `data/`. Every operation is total and safe: reads
 * fall back to a default, writes create directories on demand, and deletes
 * ignore missing files.
 */

import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_ROOT = path.join(process.cwd(), "data");

/** Build an absolute path inside the `data/` directory. */
export function dataPath(...segments: string[]): string {
  return path.join(DATA_ROOT, ...segments);
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/** Read and parse a JSON file, returning `fallback` if missing or corrupt. */
export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Serialize and write a JSON file, creating parent directories as needed. */
export async function writeJsonFile(
  filePath: string,
  value: unknown,
): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch {
    /* already absent — nothing to do */
  }
}

/** List absolute paths of files with the given extension in a directory. */
export async function listFiles(dir: string, ext = ".json"): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir);
    return entries
      .filter((entry) => entry.endsWith(ext))
      .map((entry) => path.join(dir, entry));
  } catch {
    return [];
  }
}
