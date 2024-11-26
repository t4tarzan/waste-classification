export type WasteType = 'dry' | 'wet' | 'plastic' | 'hazardous' | 'unknown';

export interface ClassificationResult {
  wasteType: WasteType;
  confidence: number;
  timestamp: Date;
  imageUrl: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  tags: string[];
  imageUrl: string;
}

export interface CameraConfig {
  width: number;
  height: number;
  facingMode: 'user' | 'environment';
}
