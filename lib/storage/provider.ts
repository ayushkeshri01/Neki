export interface UploadResult {
  url: string;
  key: string;
}

export interface StorageProvider {
  upload(file: Buffer, fileName: string, contentType: string): Promise<UploadResult>;
  delete(urlOrPath: string): Promise<boolean>;
  getUrl(key: string): string;
}
