import { ComponentType } from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Accent palette for an algorithm (hex values, used both in CSS and SVG)
 */
export interface AlgorithmTheme {
  accent: string;
  soft: string;
}

/**
 * Algorithm metadata interface
 */
export interface AlgorithmMetadata {
  id: string;
  name: string;
  /** One friendly sentence: what it does, in plain language */
  tagline: string;
  description: string;
  /** Short list of everyday places you meet this algorithm */
  usedIn: string[];
  icon: LucideIcon;
  theme: AlgorithmTheme;
  component: ComponentType;
  /** Small decorative illustration for cards */
  preview: ComponentType<{ className?: string }>;
}

/**
 * Algorithm registry
 * All algorithms must be registered here
 */
const algorithmRegistry: Record<string, AlgorithmMetadata> = {};

/**
 * Register an algorithm
 */
export function registerAlgorithm(metadata: AlgorithmMetadata): void {
  algorithmRegistry[metadata.id] = metadata;
}

/**
 * Get a single algorithm by ID
 */
export function getAlgorithm(id: string): AlgorithmMetadata | undefined {
  return algorithmRegistry[id];
}

/**
 * Get all registered algorithms
 */
export function getAllAlgorithms(): AlgorithmMetadata[] {
  return Object.values(algorithmRegistry);
}

/**
 * Check if an algorithm is registered
 */
export function hasAlgorithm(id: string): boolean {
  return id in algorithmRegistry;
}
