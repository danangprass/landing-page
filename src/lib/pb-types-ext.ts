import type { ProductsRecord, CategoriesRecord } from './pb-types';

export type ExpandedProduct = ProductsRecord & {
  expand?: {
    category?: CategoriesRecord;
  };
  rating?: number;
  reviewCount?: number;
};
