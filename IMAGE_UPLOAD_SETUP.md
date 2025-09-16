# Image Upload Setup

## Overview
This document describes the image upload functionality that has been implemented for product pictures in the Neovolt e-commerce application.

## Backend Implementation

### 1. File Storage Structure
```
/workspace/backend/uploads/
└── products/          # Product images are stored here
```

### 2. Multer Configuration
- **File Types**: JPEG, JPG, PNG, GIF, WEBP
- **File Size Limit**: 5MB per image
- **Storage**: Local disk storage in `/backend/uploads/products/`
- **Naming**: Files are renamed with timestamp and random string for uniqueness

### 3. API Endpoints

#### Upload Image
- **POST** `/api/upload/image`
- **Authentication**: Required (Admin only)
- **Content-Type**: `multipart/form-data`
- **Body**: `image` file field
- **Response**: File information including URL

#### Delete Image
- **DELETE** `/api/upload/image/:filename`
- **Authentication**: Required (Admin only)
- **Response**: Success/error message

#### Placeholder Images
- **GET** `/api/placeholder/:width/:height`
- **Response**: SVG placeholder image
- **Example**: `/api/placeholder/300/200` returns 300x200 placeholder

### 4. Product Routes Updated
- **POST** `/api/products` - Now supports file upload
- **PUT** `/api/products/:id` - Now supports file upload
- Both routes accept either file upload or image URL

## Frontend Implementation

### 1. Admin Product Form
The admin product form now includes:
- File upload input with drag-and-drop styling
- Image preview functionality
- Option to upload file OR provide URL
- Remove image functionality

### 2. File Upload Features
- **File Selection**: Click to select image files
- **Preview**: Shows selected image before upload
- **Validation**: Only image files accepted
- **Fallback**: Can still use image URLs
- **Reset**: Clear selection and preview

### 3. Form Submission
- Uses `FormData` for multipart uploads
- Automatically includes file if selected
- Falls back to URL if no file selected

## Usage Instructions

### For Admins:
1. Go to Admin → Products
2. Click "Add New Product" or edit existing product
3. In the "Product Image" section:
   - **Option A**: Click "Choose Image File" to upload from computer
   - **Option B**: Enter image URL in the text field
4. Preview will show selected image
5. Click "Save Product" to upload

### Image Requirements:
- **Formats**: JPEG, JPG, PNG, GIF, WEBP
- **Size**: Maximum 5MB
- **Recommended**: 300x300px or larger for best quality

## Static File Serving
- Images are served from `/uploads/products/` directory
- Accessible via `http://your-domain/uploads/products/filename`
- Placeholder images available at `/api/placeholder/width/height`

## Security Features
- Admin authentication required for uploads
- File type validation
- File size limits
- Unique filename generation to prevent conflicts

## Error Handling
- Upload errors are caught and returned to frontend
- File validation errors are displayed to user
- Fallback to placeholder images if no image provided

## Future Enhancements
- Image resizing/optimization
- Multiple image support per product
- Cloud storage integration (AWS S3, Cloudinary)
- Image compression
- Thumbnail generation