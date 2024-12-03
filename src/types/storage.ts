export interface StorageFile {
  name: string;
  path: string;
  fullPath: string;
  downloadUrl: string;
  contentType: string;
  size: number;
  timeCreated: string;
  updated: string;
  type: string;
  url: string;
  lastModified: Date;
  metadata?: {
    [key: string]: string;
  };
}
