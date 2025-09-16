const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Generate sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    // Get all products with more details
    const productsResult = await pool.query(`
      SELECT p.id, p.name, p.updated_at, p.created_at, c.name as category_name
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_active = true
      ORDER BY p.updated_at DESC
    `);
    const products = productsResult.rows;

    // Get all categories
    const categoriesResult = await pool.query('SELECT id, name, created_at FROM categories ORDER BY name');
    const categories = categoriesResult.rows;

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:650';
    const currentDate = new Date().toISOString();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

    // Add static pages with better priorities
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/products', priority: '0.9', changefreq: 'daily' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.6', changefreq: 'monthly' },
      { url: '/shipping', priority: '0.6', changefreq: 'monthly' },
      { url: '/returns', priority: '0.6', changefreq: 'monthly' },
      { url: '/privacy', priority: '0.4', changefreq: 'yearly' },
      { url: '/terms', priority: '0.4', changefreq: 'yearly' },
      { url: '/login', priority: '0.3', changefreq: 'monthly' },
      { url: '/register', priority: '0.3', changefreq: 'monthly' },
      { url: '/cart', priority: '0.5', changefreq: 'weekly' },
      { url: '/checkout', priority: '0.5', changefreq: 'weekly' }
    ];

    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add product pages with images
    products.forEach(product => {
      const lastmod = new Date(product.updated_at).toISOString();
      sitemap += `
  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${baseUrl}/api/placeholder/400/300</image:loc>
      <image:title>${product.name}</image:title>
      <image:caption>${product.name} - High-quality German electrical connector</image:caption>
    </image:image>
  </url>`;
    });

    // Add category pages (if you have category-specific pages)
    categories.forEach(category => {
      sitemap += `
  <url>
    <loc>${baseUrl}/products?category=${encodeURIComponent(category.name)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ message: 'Failed to generate sitemap' });
  }
});

module.exports = router;