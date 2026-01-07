const router = require("express").Router();
const minioService = require("../services/minioService");

/**
 * @swagger
 * /api/files/{filePath}:
 *   get:
 *     summary: Serve uploaded files (images and audio) from MinIO
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: filePath
 *         required: true
 *         schema:
 *           type: string
 *         description: File path (e.g., parties/1767583454035-o6tcwi26uda.jpeg)
 *     responses:
 *       200:
 *         description: File content
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 *       500:
 *         description: Error serving file
 */
router.get("/:filePath(*)", async (req, res) => {
  try {
    const filePath = req.params.filePath;
    
    // Récupérer le fichier depuis MinIO
    const dataStream = await minioService.minioClient.getObject(
      minioService.BUCKET_NAME,
      filePath
    );
    
    // Déterminer le content-type basé sur l'extension
    const extension = filePath.split('.').pop().toLowerCase();
    const contentTypeMap = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',
      webm: 'audio/webm'
    };
    const contentType = contentTypeMap[extension] || 'application/octet-stream';
    
    // Définir les headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 year
    
    // Pipes the data stream to the response
    dataStream.pipe(res);
    
    dataStream.on('error', (err) => {
      console.error('Error streaming file from MinIO:', err);
      if (!res.headersSent) {
        res.status(404).json({ error: 'File not found' });
      }
    });
  } catch (error) {
    console.error('Error serving file from MinIO:', error);
    if (!res.headersSent) {
      res.status(404).json({ error: 'File not found' });
    }
  }
});

module.exports = router;


