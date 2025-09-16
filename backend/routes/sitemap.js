const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Generate sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    // Get all products
    const productsResult = await pool.query('SELECT id, name, updated_at FROM products WHERE is_active = true');
    const products = productsResult.rows;

    // Get all categories
    const categoriesResult = await pool.query('SELECT id, name FROM categories');
    const categories = categoriesResult.rows;

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:650';
    const currentDate = new Date().toISOString();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/products', priority: '0.9', changefreq: 'daily' },
      { url: '/login', priority: '0.5', changefreq: 'monthly' },
      { url: '/register', priority: '0.5', changefreq: 'monthly' },
      { url: '/cart', priority: '0.6', changefreq: 'weekly' },
      { url: '/checkout', priority: '0.6', changefreq: 'weekly' }
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

    // Add product pages
    products.forEach(product => {
      const lastmod = new Date(product.updated_at).toISOString();
      sitemap += `
  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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