// This file is deprecated - use productService.ts and storeService.ts instead
// All hardcoded data has been moved to the database

// Re-export types from the main services
export type { Product } from './productService';
export type { Brand, Category, HeroSection, Collection } from './storeService';
