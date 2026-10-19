import { ComponentType } from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Accent palette for an algorithm: CSS colour values (theme variables), usable in CSS and SVG
 */
export interface AlgorithmTheme {
  accent: string;
  soft: string;
}

/** The two top-level sections of the site */
export type ShelfId = 'structures' | 'algorithms';

export type CategoryId =
  | 'lists'
  | 'trees'
  | 'indexes'
  | 'sorting'
  | 'searching'
  | 'paths'
  | 'graphs'
  | 'dp';

/** Names and blurbs live in the i18n dictionaries under `categories` */
export interface Category {
  id: CategoryId;
  shelf: ShelfId;
  theme: AlgorithmTheme;
}

export const SHELVES: ShelfId[] = ['structures', 'algorithms'];

/**
 * Topics in display order, grouped by shelf
 */
export const CATEGORIES: Category[] = [
  { id: 'lists', shelf: 'structures', theme: { accent: 'var(--accent-lists)', soft: 'var(--soft-lists)' } },
  { id: 'trees', shelf: 'structures', theme: { accent: 'var(--accent-trees)', soft: 'var(--soft-trees)' } },
  { id: 'indexes', shelf: 'structures', theme: { accent: 'var(--color-sage)', soft: 'var(--color-sage-soft)' } },
  { id: 'sorting', shelf: 'algorithms', theme: { accent: 'var(--accent-sorting)', soft: 'var(--soft-sorting)' } },
  { id: 'searching', shelf: 'algorithms', theme: { accent: 'var(--accent-searching)', soft: 'var(--soft-searching)' } },
  { id: 'paths', shelf: 'algorithms', theme: { accent: 'var(--accent-paths)', soft: 'var(--soft-paths)' } },
  { id: 'graphs', shelf: 'algorithms', theme: { accent: 'var(--accent-graphs)', soft: 'var(--soft-graphs)' } },
  { id: 'dp', shelf: 'algorithms', theme: { accent: 'var(--accent-dp)', soft: 'var(--soft-dp)' } },
];

export function getCategoriesByShelf(shelf: ShelfId): Category[] {
  return CATEGORIES.filter((c) => c.shelf === shelf);
}

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id)!;
}

/**
 * Algorithm metadata. All visible text (name, tagline, facts…) lives in the
 * i18n dictionaries under `algorithms[id]`.
 */
export interface AlgorithmMetadata {
  id: string;
  category: CategoryId;
  icon: LucideIcon;
  /** Defaults to the category theme */
  theme: AlgorithmTheme;
  component: ComponentType;
  /** Small decorative illustration for cards */
  preview: ComponentType<{ className?: string }>;
}

export type AlgorithmInput = Omit<AlgorithmMetadata, 'theme'> & { theme?: AlgorithmTheme };

/**
 * Algorithm registry
 * All algorithms must be registered here
 */
const algorithmRegistry: Record<string, AlgorithmMetadata> = {};

/**
 * Register an algorithm
 */
export function registerAlgorithm(input: AlgorithmInput): void {
  algorithmRegistry[input.id] = { ...input, theme: input.theme ?? getCategory(input.category).theme };
}

/**
 * Get a single algorithm by ID
 */
export function getAlgorithm(id: string): AlgorithmMetadata | undefined {
  return algorithmRegistry[id];
}

/**
 * Get all registered algorithms, grouped in category order
 */
export function getAllAlgorithms(): AlgorithmMetadata[] {
  const all = Object.values(algorithmRegistry);
  return CATEGORIES.flatMap((c) => all.filter((a) => a.category === c.id));
}

/**
 * Algorithms in one category, in registration order
 */
export function getAlgorithmsByCategory(id: CategoryId): AlgorithmMetadata[] {
  return Object.values(algorithmRegistry).filter((a) => a.category === id);
}

/**
 * Check if an algorithm is registered
 */
export function hasAlgorithm(id: string): boolean {
  return id in algorithmRegistry;
}
