import {IStorageProvider, PresignedUpload} from "../../src/pkg/storage/storage.interface";

export class StorageStub implements IStorageProvider {
    uploads: Array<{key: string; contentType: string; expiresInSeconds?: number}> = [];
    deleted: string[] = [];

    async getPresignedUploadUrl(key: string, contentType: string, expiresInSeconds = 300): Promise<PresignedUpload> {
        this.uploads.push({key, contentType, expiresInSeconds});
        return {
            uploadUrl: `https://test-bucket.s3.eu-north-1.amazonaws.com/${key}?signature=dummy`,
            publicUrl: this.getPublicUrl(key),
            key,
        };
    }

    getPublicUrl(key: string): string {
        return `https://test-bucket.s3.eu-north-1.amazonaws.com/${key}`;
    }

    async deleteObject(key: string): Promise<void> {
        this.deleted.push(key);
    }

    reset(): void {
        this.uploads = [];
        this.deleted = [];
    }
}

export const storageStub = new StorageStub();
