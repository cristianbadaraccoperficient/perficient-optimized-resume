const EXPECTED_SECTIONS = ['strengths', 'gaps', 'transferable_skills'] as const;
export type SectionKey = (typeof EXPECTED_SECTIONS)[number];

export interface CompletedSection {
  key: SectionKey;
  raw: string;
}

export class SseJsonParser {
  private buffer = '';
  private emittedSections = new Set<SectionKey>();
  private pendingSectionIndex = 0;

  append(chunk: string): CompletedSection[] {
    this.buffer += chunk;
    const completed: CompletedSection[] = [];

    while (this.pendingSectionIndex < EXPECTED_SECTIONS.length) {
      const key = EXPECTED_SECTIONS[this.pendingSectionIndex];
      const section = this.tryExtractSection(key);
      if (!section) break;
      this.emittedSections.add(key);
      completed.push({ key, raw: section });
      this.pendingSectionIndex++;
    }

    return completed;
  }

  getFullText(): string {
    return this.buffer;
  }

  private tryExtractSection(key: SectionKey): string | null {
    const keyPattern = `"${key}"`;
    const keyIdx = this.buffer.indexOf(keyPattern);
    if (keyIdx === -1) return null;

    let i = keyIdx + keyPattern.length;
    while (i < this.buffer.length && this.buffer[i] !== '[') {
      if (this.buffer[i] !== ':' && this.buffer[i] !== ' ' && this.buffer[i] !== '\n' && this.buffer[i] !== '\r' && this.buffer[i] !== '\t') {
        return null;
      }
      i++;
    }
    if (i >= this.buffer.length) return null;

    const arrayStart = i;
    let depth = 0;
    let inString = false;
    let escapeNext = false;

    for (let j = arrayStart; j < this.buffer.length; j++) {
      const ch = this.buffer[j];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (ch === '\\' && inString) {
        escapeNext = true;
        continue;
      }

      if (ch === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (ch === '[' || ch === '{') {
        depth++;
      } else if (ch === ']' || ch === '}') {
        depth--;
        if (depth === 0) {
          return this.buffer.slice(arrayStart, j + 1);
        }
      }
    }

    return null;
  }
}
