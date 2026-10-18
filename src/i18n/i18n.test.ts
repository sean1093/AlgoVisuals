import { describe, expect, it } from 'vitest';
import en from './en';
import zhTW from './zh-TW';
import ja from './ja';
import ko from './ko';

const TRANSLATIONS = { 'zh-TW': zhTW, ja, ko } as Record<string, unknown>;

type Issue = string;

/**
 * Walk the English dictionary and check the translation has the same shape:
 * same keys, same array lengths, functions with the same arity that return text.
 */
function compare(source: unknown, target: unknown, path: string, issues: Issue[], same: string[], total: { n: number }) {
  if (typeof source === 'function') {
    if (typeof target !== 'function') return issues.push(`${path}: expected a function`);
    if (target.length !== source.length) issues.push(`${path}: takes ${target.length} args, English takes ${source.length}`);
    const args = Array.from({ length: source.length }, () => 2);
    const out = (target as (...a: unknown[]) => unknown)(...args);
    if (typeof out !== 'string' || !out.trim() || /undefined|NaN|\[object/.test(out)) issues.push(`${path}: returned ${JSON.stringify(out)}`);
    return;
  }
  if (Array.isArray(source)) {
    if (!Array.isArray(target)) return issues.push(`${path}: expected an array`);
    if (target.length !== source.length) issues.push(`${path}: ${target.length} items, English has ${source.length}`);
    source.forEach((item, i) => compare(item, target[i], `${path}[${i}]`, issues, same, total));
    return;
  }
  if (source && typeof source === 'object') {
    if (!target || typeof target !== 'object') return issues.push(`${path}: expected an object`);
    for (const key of Object.keys(source)) {
      if (!(key in target)) issues.push(`${path}.${key}: missing`);
      else compare((source as Record<string, unknown>)[key], (target as Record<string, unknown>)[key], `${path}.${key}`, issues, same, total);
    }
    for (const key of Object.keys(target)) if (!(key in source)) issues.push(`${path}.${key}: not in English`);
    return;
  }
  if (typeof source === 'string') {
    if (typeof target !== 'string' || !target.trim()) return issues.push(`${path}: expected text`);
    // Count long prose left in English (short labels like "O(n log n)" or "QuadTree" are fine)
    if (source.length > 24 && /[a-z]{4} [a-z]{3}/.test(source)) {
      total.n++;
      if (target === source) same.push(path);
    }
    // Keep **bold** markers balanced
    if ((target.match(/\*\*/g) ?? []).length % 2) issues.push(`${path}: unbalanced ** markers`);
  }
}

describe('translations', () => {
  for (const [lang, dict] of Object.entries(TRANSLATIONS)) {
    it(`${lang} matches the English dictionary`, () => {
      const issues: Issue[] = [];
      const same: string[] = [];
      const total = { n: 0 };
      compare(en, dict, lang, issues, same, total);
      expect(issues).toEqual([]);
      // Nearly every sentence should actually be translated
      expect(same.length, `untranslated: ${same.slice(0, 10).join(', ')}`).toBeLessThanOrEqual(Math.ceil(total.n * 0.02));
    });
  }
});
