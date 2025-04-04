'use server';

import { Storage } from "@google-cloud/storage";

const storageConfig = process.env.GCLOUD_SERVICE_ACCOUNT_KEY;

const storage = new Storage({
  credentials: storageConfig
});

const bucketName = "sienna-naturals-files-upload";

export async function uploadFile(fileBuffer, fileName, contentType) {
    try {
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(`uploads/${fileName}`);
      
      // Upload with public read access
      await file.save(fileBuffer, {
        metadata: {
          contentType,
          cacheControl: 'public, max-age=31536000',
        },
        predefinedAcl: 'publicRead' // This is the key change
      });
  
      return `https://storage.googleapis.com/${bucketName}/uploads/${fileName}`;
    } catch (error) {
      console.error('GCP Upload Error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

export async function deleteFile(fileUrl) {
  try {
    const fileName = fileUrl.replace(`https://storage.googleapis.com/${bucketName}/`, '');
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    
    await file.delete();
    return true;
  } catch (error) {
    console.error('Delete failed:', error);
    throw new Error('File deletion failed');
  }
}