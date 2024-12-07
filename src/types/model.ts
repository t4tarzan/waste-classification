import { WasteType } from './waste';

export interface ModelResult {
  category: WasteType;
  confidence: number;
  metadata: {
    material: string;
    recyclable: boolean;
    subcategories: string[];
    error?: string;
  };
}

export type ModelType = 'wastenet' | 'trashnet' | 'taco';

export interface ModelResponse {
  [key: string]: number;
}
