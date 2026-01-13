const Minio = require('minio');

// Configuration MinIO
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'game-files';

// Initialiser le bucket s'il n'existe pas
async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`✅ Bucket ${BUCKET_NAME} created`);
    }
  } catch (error) {
    console.error('Error ensuring bucket:', error);
  }
}

// Initialiser au démarrage
ensureBucket();

/**
 * Upload un fichier vers MinIO
 * @param {Buffer} fileBuffer - Le contenu du fichier
 * @param {string} fileName - Le nom du fichier
 * @param {string} contentType - Le type MIME du fichier
 * @returns {Promise<string>} L'URL du fichier uploadé
 */
async function uploadFile(fileBuffer, fileName, contentType) {
  try {
    await ensureBucket();
    
    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = fileName.split('.').pop();
    const uniqueFileName = `${timestamp}-${randomStr}.${extension}`;
    const objectName = `parties/${uniqueFileName}`;
    
    // Upload vers MinIO
    await minioClient.putObject(BUCKET_NAME, objectName, fileBuffer, fileBuffer.length, {
      'Content-Type': contentType
    });
    
    // Retourner l'URL du fichier (accessible via l'API Gateway ou directement)
    const fileUrl = `/api/files/${objectName}`;
    return fileUrl;
  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Supprimer un fichier de MinIO
 * @param {string} fileUrl - L'URL du fichier à supprimer
 */
async function deleteFile(fileUrl) {
  try {
    // Extraire le nom de l'objet de l'URL
    const objectName = fileUrl.replace('/api/files/', '');
    await minioClient.removeObject(BUCKET_NAME, objectName);
  } catch (error) {
    console.error('Error deleting file from MinIO:', error);
    // Ne pas throw pour ne pas bloquer la suppression de la partie
  }
}

/**
 * Obtenir l'URL publique d'un fichier
 * @param {string} objectName - Le nom de l'objet dans MinIO
 * @returns {string} L'URL publique
 */
function getFileUrl(objectName) {
  return `/api/files/${objectName}`;
}

module.exports = {
  uploadFile,
  deleteFile,
  getFileUrl,
  minioClient,
  BUCKET_NAME
};

