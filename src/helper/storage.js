'use server';

import { Storage } from "@google-cloud/storage";

export async function getStorage() {
  if (!process.env.GCLOUD_SERVICE_ACCOUNT_KEY) {
    throw new Error('Missing GCLOUD_SERVICE_ACCOUNT_KEY');
  }

  // Parse ONLY at runtime (not during build)
  const credentials = JSON.parse(process.env.GCLOUD_SERVICE_ACCOUNT_KEY);
  
  return new Storage({
    projectId: credentials.project_id,
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key
    }
  });
}

const bucketName = "sienna-naturals-files-upload";

export async function uploadFile(fileBuffer, fileName, contentType) {
    try {
      const storage = await getStorage();
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