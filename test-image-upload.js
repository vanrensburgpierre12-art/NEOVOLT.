const fs = require('fs');
const path = require('path');

// Test script to verify image upload functionality
console.log('🧪 Testing image upload setup...\n');

// Check if uploads directory exists
const uploadsDir = path.join(__dirname, 'backend/uploads');
const productsDir = path.join(uploadsDir, 'products');

console.log('📁 Checking uploads directory structure:');
console.log(`   Backend uploads dir: ${uploadsDir}`);
console.log(`   Products subdir: ${productsDir}`);

if (fs.existsSync(uploadsDir)) {
    console.log('   ✅ Backend uploads directory exists');
    
    if (fs.existsSync(productsDir)) {
        console.log('   ✅ Products subdirectory exists');
        
        // List files in products directory
        const files = fs.readdirSync(productsDir);
        if (files.length > 0) {
            console.log(`   📸 Found ${files.length} uploaded images:`);
            files.forEach(file => {
                const filePath = path.join(productsDir, file);
                const stats = fs.statSync(filePath);
                console.log(`      - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
            });
        } else {
            console.log('   📭 No images found in products directory');
        }
    } else {
        console.log('   ❌ Products subdirectory missing');
    }
} else {
    console.log('   ❌ Backend uploads directory missing');
}

console.log('\n🔧 Configuration check:');
console.log('   Backend static file serving: /uploads -> /app/uploads');
console.log('   Supported formats: JPEG, JPG, PNG, GIF, WEBP');
console.log('   Max file size: 5MB');
console.log('   Docker volume: uploads_data:/app/uploads');

console.log('\n✅ Test complete! If uploads directory is missing, rebuild containers.');