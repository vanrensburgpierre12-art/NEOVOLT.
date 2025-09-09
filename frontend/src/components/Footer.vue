<template>
  <footer class="footer">
    <div class="container">
      <div class="row">
        <div class="col">
          <h3 class="text-neon">NEOVOLT</h3>
          <p>High-quality Dutch electrical connectors and electronic hardware for professionals and enthusiasts.</p>
        </div>
        <div class="col">
          <h4>Quick Links</h4>
          <ul>
            <li><router-link to="/products">Products</router-link></li>
            <li><router-link to="/about">About</router-link></li>
            <li><router-link to="/contact">Contact</router-link></li>
          </ul>
        </div>
        <div class="col">
          <h4>Support</h4>
          <ul>
            <li><router-link to="/shipping">Shipping Info</router-link></li>
            <li><router-link to="/returns">Returns</router-link></li>
            <li><router-link to="/warranty">Warranty</router-link></li>
          </ul>
        </div>
        <div class="col">
          <h4>Connect</h4>
          <p>Follow us for updates and new products</p>
          <div class="social-links">
            <a href="#" class="social-link">Twitter</a>
            <a href="#" class="social-link">LinkedIn</a>
            <a href="#" class="social-link">GitHub</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 Neovolt. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  background: rgba(10, 10, 10, 0.95);
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  padding: 40px 0 20px;
  margin-top: 60px;
}

.footer h3, .footer h4 {
  margin-bottom: 20px;
  color: #00ffff;
}

.footer ul {
  list-style: none;
  padding: 0;
}

.footer ul li {
  margin-bottom: 10px;
}

.footer ul li a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer ul li a:hover {
  color: #00ffff;
}

.social-links {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.social-link {
  color: #00ffff;
  text-decoration: none;
  padding: 8px 12px;
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: #00ffff;
}

.footer-bottom {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 255, 255, 0.2);
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}
</style>