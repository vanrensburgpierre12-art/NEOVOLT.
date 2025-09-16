<template>
  <div class="home">
    <!-- Structured Data -->
    <StructuredData type="Organization" :data="{}" />
    <StructuredData type="WebSite" :data="{}" />
    
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">DEUTSCHE CONNECTORS</h1>
        <p class="hero-subtitle">High-quality German electrical connectors for a reliable power connection</p>
        <router-link to="/products" class="btn btn-primary btn-lg">SHOP NOW</router-link>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured-products">
      <div class="container">
        <h2 class="section-title text-center">Featured Products</h2>
        <div class="product-grid">
          <div 
            v-for="product in featuredProducts" 
            :key="product.id" 
            class="product-card"
            @click="goToProduct(product.id)"
          >
            <LazyImage 
              :src="product.image_url || '/api/placeholder/300/200'" 
              :alt="product.name"
              height="200px"
              image-class="product-image"
            />
            <h3 class="product-name">{{ product.name }}</h3>
            <div class="product-price-rating">
              <p class="product-price">{{ formatCurrency(product.price) }}</p>
              <div v-if="product.average_rating > 0" class="product-rating">
                <div class="stars">
                  <span 
                    v-for="star in 5" 
                    :key="star" 
                    class="star"
                    :class="{ 'filled': star <= Math.round(product.average_rating) }"
                  >
                    ★
                  </span>
                </div>
                <span class="rating-text">({{ product.review_count }})</span>
              </div>
            </div>
            <button class="btn btn-primary">VIEW</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <div class="row">
          <div class="col">
            <div class="feature-card">
              <div class="feature-icon">⚡</div>
              <h3>High Quality</h3>
              <p>Premium Dutch electrical connectors built to last</p>
            </div>
          </div>
          <div class="col">
            <div class="feature-card">
              <div class="feature-icon">🚚</div>
              <h3>Fast Shipping</h3>
              <p>Quick delivery to your doorstep worldwide</p>
            </div>
          </div>
          <div class="col">
            <div class="feature-card">
              <div class="feature-icon">🛡️</div>
              <h3>Warranty</h3>
              <p>Comprehensive warranty on all products</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '../stores/products'
import { formatCurrency } from '../utils/currency'
import LazyImage from '../components/LazyImage.vue'
import StructuredData from '../components/StructuredData.vue'
import { useMeta } from '../composables/useMeta'
import analytics from '../utils/analytics'

export default {
  name: 'Home',
  components: {
    LazyImage,
    StructuredData
  },
  setup() {
    const router = useRouter()
    const productsStore = useProductsStore()
    const { setMeta } = useMeta()
    const featuredProducts = ref([])

    const goToProduct = (productId) => {
      router.push(`/product/${productId}`)
    }

    const loadFeaturedProducts = async () => {
      try {
        await productsStore.fetchProducts()
        featuredProducts.value = productsStore.products.slice(0, 4)
      } catch (error) {
        console.error('Failed to load featured products:', error)
      }
    }

    onMounted(() => {
      // Set SEO meta tags for home page
      setMeta({
        title: 'Neovolt - Deutsche Connectors | High-Quality German Electrical Hardware',
        description: 'Shop premium German electrical connectors and hardware. High-quality Deutsche connectors for reliable power connections. Fast shipping worldwide.',
        keywords: 'deutsche connectors, german electrical, power connectors, electrical hardware, electrical supplies, industrial connectors',
        image: '/api/placeholder/1200/630',
        canonical: window.location.href,
        robots: 'index, follow'
      })
      
      // Track page view
      analytics.trackPageView('Home Page', '/')
      
      loadFeaturedProducts()
    })

    return {
      featuredProducts,
      goToProduct,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.hero {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  padding: 60px 20px;
}

.hero-content {
  max-width: 800px;
  z-index: 10;
}

.hero-title {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #00ffff, #ffffff, #00ffff);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientShift 3s ease-in-out infinite;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 30px;
  color: rgba(255, 255, 255, 0.8);
}

.btn-lg {
  padding: 15px 30px;
  font-size: 1.1rem;
}

.featured-products {
  padding: 80px 0;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 50px;
  color: #00ffff;
  text-shadow: 0 0 20px #00ffff;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.product-card {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.product-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.product-card:hover::before {
  left: 100%;
}

.product-card:hover {
  border-color: #00ffff;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
  transform: translateY(-10px);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 15px;
}

.product-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #ffffff;
}

.product-price-rating {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 900;
  color: #00ffff;
  margin: 0;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.star.filled {
  color: #ffc107;
  text-shadow: 0 0 5px #ffc107;
}

.rating-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.features {
  padding: 80px 0;
  background: rgba(0, 0, 0, 0.3);
}

.feature-card {
  text-align: center;
  padding: 30px;
  background: rgba(26, 26, 46, 0.5);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  border-color: #00ffff;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  color: #00ffff;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .product-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>