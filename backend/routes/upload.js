const express = require('express');
const { uploadSingle } = require('../middleware/upload');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const path = require('path');

const router = express.Router();

// Upload single image
router.post('/image', authenticateToken, requireAdmin, (req, res) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ 
        message: err.message || 'File upload failed',
        error: 'UPLOAD_ERROR'
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        message: 'No file uploaded',
        error: 'NO_FILE'
      });
    }

    // Return the file information
    const fileUrl = `/uploads/products/${req.file.filename}`;
    
    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl,
        path: req.file.path
      }
    });
  });
});

// Delete image
router.delete('/image/:filename', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads/products', filename);
    
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});

module.exports = router;