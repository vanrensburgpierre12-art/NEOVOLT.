const multer = require('multer');
const path = require('path');
const fs = require('fs');
const imageOptimization = require('../services/imageOptimization');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const productsDir = path.join(uploadsDir, 'products');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, productsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp + random string + original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Middleware for single image upload with optimization
const uploadSingle = (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    if (req.file) {
      try {
        // Get product ID from request params or body
        const productId = req.params.id || req.body.productId || Date.now();
        
        // Optimize the uploaded image
        const optimizedImages = await imageOptimization.optimizeProductImage(req.file, productId);
        
        // Add optimized image URLs to request
        req.optimizedImages = optimizedImages;
        req.file.optimizedPath = optimizedImages.original;
      } catch (error) {
        console.error('Image optimization error:', error);
        // Continue with original file if optimization fails
      }
    }

    next();
  });
};

// Middleware for multiple images upload
const uploadMultiple = upload.array('images', 5); // Max 5 images

// Middleware for category image upload with optimization
const uploadCategoryImage = (req, res, next) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    if (req.file) {
      try {
        // Get category ID from request params or body
        const categoryId = req.params.id || req.body.categoryId || Date.now();
        
        // Optimize the uploaded image
        const optimizedPath = await imageOptimization.optimizeCategoryImage(req.file, categoryId);
        
        // Add optimized image URL to request
        req.file.optimizedPath = optimizedPath;
      } catch (error) {
        console.error('Category image optimization error:', error);
        // Continue with original file if optimization fails
      }
    }

    next();
  });
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadCategoryImage,
  upload
};