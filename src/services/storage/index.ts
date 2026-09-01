/**
 * MOCK STORAGE — swap for S3/GCS in production.
 *
 * In-memory / mock object storage service abstraction.
 * Emulates cloud object storage (AWS S3 / Google Cloud Storage) with signed URLs
 * and metadata retention for claim evidence attachments.
 */

export interface StoredFileRecord {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  storageProvider: "MOCK_IN_MEMORY" | "S3" | "GCS";
  dataUrl?: string;
}

export interface UploadFileInput {
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  content?: string | ArrayBuffer;
}

class MockStorageService {
  private files: Map<string, StoredFileRecord> = new Map();

  constructor() {
    // Pre-populate mock evidence records for seeded demo claims
    this.seedMockFiles();
  }

  private seedMockFiles() {
    const seedFiles: StoredFileRecord[] = [
      {
        id: "mock-file-1",
        url: "/mock/evidence/dell_screen_clean.jpg",
        fileName: "dell_front_bezel.jpg",
        fileType: "image/jpeg",
        fileSizeBytes: 2150000,
        uploadedAt: new Date().toISOString(),
        storageProvider: "MOCK_IN_MEMORY",
      },
      {
        id: "mock-file-2",
        url: "/mock/evidence/invoice_inv1024.pdf",
        fileName: "invoice_INV-1024_ABC_Electronics.pdf",
        fileType: "application/pdf",
        fileSizeBytes: 345000,
        uploadedAt: new Date().toISOString(),
        storageProvider: "MOCK_IN_MEMORY",
      },
      {
        id: "mock-file-3",
        url: "/mock/evidence/hp_cracked_screen.jpg",
        fileName: "hp_screen_damage.jpg",
        fileType: "image/jpeg",
        fileSizeBytes: 3200000,
        uploadedAt: new Date().toISOString(),
        storageProvider: "MOCK_IN_MEMORY",
      },
    ];

    seedFiles.forEach((file) => this.files.set(file.url, file));
  }

  /**
   * Uploads a file to mock storage.
   * In production, this generates a presigned PUT URL or directly streams to S3/GCS.
   */
  public async uploadFile(file: UploadFileInput | File): Promise<{
    url: string;
    fileName: string;
    fileType: string;
    fileSizeBytes: number;
    mock: true;
  }> {
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const fileName = file.name || "uploaded_file";
    const fileType = file.type || "application/octet-stream";
    const fileSizeBytes = file.size || 0;
    
    // In mock mode, generate a mock asset path or object URL
    let dataUrl: string | undefined;
    if ("dataUrl" in file && file.dataUrl) {
      dataUrl = file.dataUrl;
    }

    const mockUrl = `/mock/uploads/${fileId}_${fileName.replace(/\s+/g, "_")}`;

    const record: StoredFileRecord = {
      id: fileId,
      url: mockUrl,
      fileName,
      fileType,
      fileSizeBytes,
      uploadedAt: new Date().toISOString(),
      storageProvider: "MOCK_IN_MEMORY",
      dataUrl,
    };

    this.files.set(mockUrl, record);
    this.files.set(fileId, record);

    return {
      url: mockUrl,
      fileName,
      fileType,
      fileSizeBytes,
      mock: true,
    };
  }

  public async getFile(urlOrId: string): Promise<StoredFileRecord | null> {
    return this.files.get(urlOrId) || null;
  }

  public async deleteFile(urlOrId: string): Promise<boolean> {
    return this.files.delete(urlOrId);
  }

  public listFiles(): StoredFileRecord[] {
    return Array.from(this.files.values());
  }
}

export const storage = new MockStorageService();
export const uploadFile = (file: UploadFileInput | File) => storage.uploadFile(file);
