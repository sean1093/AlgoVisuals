import { ComponentType } from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Accent palette for an algorithm (hex values, used both in CSS and SVG)
 */
export interface AlgorithmTheme {
  accent: string;
  soft: string;
}

export type CategoryId = 'sorting' | 'searching' | 'graphs' | 'structures' | 'spatial';

/** Names and blurbs live in the i18n dictionaries under `categories` */
export interface Category {
  id: CategoryId;
  theme: AlgorithmTheme;
}

/**
 * Categories in display order
 */
export const CATEGORIES: Category[] = [
  {
    id: 'sorting',
    theme: { accent: '#4a5a9c', soft: '#e3e6f3' },
  },
  {
    id: 'searching',
    theme: { accent: '#a8741a', soft: '#f5ead2' },
  },
  {
    id: 'graphs',
    theme: { accent: '#7a4f86', soft: '#ece1ee' },
  },
  {
    id: 'structures',
    theme: { accent: '#2f6f86', soft: '#dceaef' },
  },
  {
    id: 'spatial',
    theme: { accent: '#3f6b5c', soft: '#e2ebe4' },
  },
];

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
