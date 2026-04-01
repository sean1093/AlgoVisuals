import { ComponentType } from 'react';
import { LucideIcon } from 'lucide-react';

/**
 * Algorithm metadata interface
 */
export interface AlgorithmMetadata {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  component: ComponentType;
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
