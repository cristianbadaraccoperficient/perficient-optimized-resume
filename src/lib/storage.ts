import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.env.DATA_DIR || './data');

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readJSON<T = unknown>(filename: string): Promise<T | null> {
  await ensureDir();
  try {
    const content = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function writeJSON(filename: string, data: unknown): Promise<void> {
  await ensureDir();
  await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
}

export async function readMarkdown(filename: string): Promise<string | null> {
  await ensureDir();
  try {
    return await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
  } catch {
    return null;
  }
}

export async function writeMarkdown(filename: string, content: string): Promise<void> {
  await ensureDir();
  await fs.writeFile(path.join(DATA_DIR, filename), content, 'utf-8');
}
