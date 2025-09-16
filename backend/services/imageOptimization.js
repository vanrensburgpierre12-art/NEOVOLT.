const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

class ImageOptimizationService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads');
    this.optimizedDir = path.join(this.uploadDir, 'optimized');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(this.optimizedDir, { recursive: true });
      await fs.mkdir(path.join(this.optimizedDir, 'products'), { recursive: true });
      await fs.mkdir(path.join(this.optimizedDir, 'categories'), { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  async optimizeImage(inputPath, outputPath, options = {}) {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'webp',
      fit = 'cover'
    } = options;

    try {
      await sharp(inputPath)
        .resize(width, height, { fit })
        .webp({ quality })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      console.error('Image optimization error:', error);
      throw error;
    }
  }

  async generateThumbnails(inputPath, baseName) {
    const thumbnails = {};

    try {
      // Small thumbnail (150x150)
      const smallPath = path.join(this.optimizedDir, 'products', `${baseName}_small.webp`);
      await this.optimizeImage(inputPath, smallPath, {
        width: 150,
        height: 150,
        quality: 70
      });
      thumbnails.small = `/uploads/optimized/products/${baseName}_small.webp`;

      // Medium thumbnail (300x300)
      const mediumPath = path.join(this.optimizedDir, 'products', `${baseName}_medium.webp`);
      await this.optimizeImage(inputPath, mediumPath, {
        width: 300,
        height: 300,
        quality: 75
      });
      thumbnails.medium = `/uploads/optimized/products/${baseName}_medium.webp`;

      // Large image (800x600)
      const largePath = path.join(this.optimizedDir, 'products', `${baseName}_large.webp`);
      await this.optimizeImage(inputPath, largePath, {
        width: 800,
        height: 600,
        quality: 80
      });
      thumbnails.large = `/uploads/optimized/products/${baseName}_large.webp`;

      // Original optimized (1200x900)
      const originalPath = path.join(this.optimizedDir, 'products', `${baseName}_original.webp`);
      await this.optimizeImage(inputPath, originalPath, {
        width: 1200,
        height: 900,
        quality: 85
      });
      thumbnails.original = `/uploads/optimized/products/${baseName}_original.webp`;

      return thumbnails;
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      throw error;
    }
  }

  async optimizeProductImage(file, productId) {
    const baseName = `product_${productId}_${Date.now()}`;
    const inputPath = file.path;
    
    try {
      const thumbnails = await this.generateThumbnails(inputPath, baseName);
      
      // Clean up original file
      await fs.unlink(inputPath);
      
      return {
        original: thumbnails.original,
        large: thumbnails.large,
        medium: thumbnails.medium,
        small: thumbnails.small
      };
    } catch (error) {
      console.error('Product image optimization error:', error);
      throw error;
    }
  }

  async optimizeCategoryImage(file, categoryId) {
    const baseName = `category_${categoryId}_${Date.now()}`;
    const inputPath = file.path;
    const outputPath = path.join(this.optimizedDir, 'categories', `${baseName}.webp`);
    
    try {
      await this.optimizeImage(inputPath, outputPath, {
        width: 400,
        height: 300,
        quality: 80
      });
      
      // Clean up original file
      await fs.unlink(inputPath);
      
      return `/uploads/optimized/categories/${baseName}.webp`;
    } catch (error) {
      console.error('Category image optimization error:', error);
      throw error;
    }
  }

  async getImageInfo(imagePath) {
    try {
      const stats = await sharp(imagePath).metadata();
      return {
        width: stats.width,
        height: stats.height,
        format: stats.format,
        size: stats.size
      };
    } catch (error) {
      console.error('Image info error:', error);
      return null;
    }
  }

  async compressImage(inputPath, outputPath, quality = 80) {
    try {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('Image compression error:', error);
      throw error;
    }
  }

  async convertToWebP(inputPath, outputPath, quality = 80) {
    try {
      await sharp(inputPath)
        .webp({ quality })
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('WebP conversion error:', error);
      throw error;
    }
  }
}

module.exports = new ImageOptimizationService();