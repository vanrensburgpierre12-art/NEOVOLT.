<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">About NEOVOLT</h1>
          <p class="hero-subtitle">Industrial-Grade Electrical Excellence</p>
          <div class="hero-description">
            <p>We manufacture the world's most reliable electrical connectors and plugs using cutting-edge precision machinery. Every product that leaves our facility represents decades of engineering expertise and uncompromising quality standards.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="mission-section">
      <div class="container">
        <div class="row">
          <div class="col-md-6">
            <h2 class="section-title">Our Mission</h2>
            <p class="mission-text">
              At NEOVOLT, we believe that electrical connections should be invisible to the user - seamless, reliable, and built to last. Our industrial-grade plugs and connectors are engineered to perform flawlessly in the most demanding environments, from high-voltage industrial applications to precision electronic systems.
            </p>
            <p class="mission-text">
              Every component we produce undergoes rigorous testing and quality control, ensuring that our customers receive products that exceed industry standards and deliver exceptional performance year after year.
            </p>
          </div>
          <div class="col-md-6">
            <div class="mission-image">
              <div class="image-placeholder">
                <i class="icon-cog"></i>
                <p>Precision Manufacturing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Manufacturing Excellence -->
    <section class="manufacturing-section">
      <div class="container">
        <h2 class="section-title text-center">Manufacturing Excellence</h2>
        <div class="row">
          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="icon-precision"></i>
              </div>
              <h3>Precision Engineering</h3>
              <p>Our state-of-the-art machinery ensures every connector meets exacting tolerances and specifications, delivering consistent quality across every production run.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="icon-quality"></i>
              </div>
              <h3>Quality Assurance</h3>
              <p>Every product undergoes comprehensive testing including electrical, mechanical, and environmental stress tests to guarantee reliability in real-world conditions.</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="icon-innovation"></i>
              </div>
              <h3>Continuous Innovation</h3>
              <p>We continuously invest in advanced manufacturing technologies and materials to stay at the forefront of electrical connector innovation.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Industrial Applications -->
    <section class="applications-section">
      <div class="container">
        <h2 class="section-title text-center">Industrial Applications</h2>
        <div class="applications-grid">
          <div class="application-item">
            <h4>Heavy Industry</h4>
            <p>Our connectors power critical systems in manufacturing, mining, and heavy machinery operations where reliability is non-negotiable.</p>
          </div>
          <div class="application-item">
            <h4>Data Centers</h4>
            <p>High-performance electrical connections for mission-critical server infrastructure and telecommunications equipment.</p>
          </div>
          <div class="application-item">
            <h4>Renewable Energy</h4>
            <p>Specialized connectors for solar, wind, and other renewable energy systems that must withstand harsh environmental conditions.</p>
          </div>
          <div class="application-item">
            <h4>Medical Equipment</h4>
            <p>Precision connectors for medical devices where safety and reliability are paramount for patient care.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="why-choose-section">
      <div class="container">
        <div class="row">
          <div class="col-md-6">
            <h2 class="section-title">Why Choose NEOVOLT?</h2>
            <div class="benefits-list">
              <div class="benefit-item">
                <i class="icon-check"></i>
                <div>
                  <h4>Proven Reliability</h4>
                  <p>Over 15 years of manufacturing excellence with zero critical failures in the field.</p>
                </div>
              </div>
              <div class="benefit-item">
                <i class="icon-check"></i>
                <div>
                  <h4>Custom Solutions</h4>
                  <p>We design and manufacture custom connectors to meet your specific application requirements.</p>
                </div>
              </div>
              <div class="benefit-item">
                <i class="icon-check"></i>
                <div>
                  <h4>Global Standards</h4>
                  <p>All products meet or exceed international electrical safety and performance standards.</p>
                </div>
              </div>
              <div class="benefit-item">
                <i class="icon-check"></i>
                <div>
                  <h4>Expert Support</h4>
                  <p>Our engineering team provides technical support and application guidance for every product.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="stats-container">
              <div class="stat-item">
                <div class="stat-number">99.9%</div>
                <div class="stat-label">Uptime Reliability</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">15+</div>
                <div class="stat-label">Years Experience</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">50K+</div>
                <div class="stat-label">Products Delivered</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">24/7</div>
                <div class="stat-label">Technical Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Ready to Experience Industrial-Grade Quality?</h2>
          <p>Discover our complete range of electrical connectors and find the perfect solution for your application.</p>
          <div class="cta-buttons">
            <router-link to="/products" class="btn btn-primary">View Products</router-link>
            <router-link to="/contact" class="btn btn-outline">Contact Us</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'About',
  mounted() {
    // Update page title
    document.title = 'About Us - NEOVOLT | Industrial-Grade Electrical Connectors'
  }
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  color: #ffffff;
}

/* Hero Section */
.hero-section {
  padding: 120px 0 80px;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 150, 255, 0.1) 100%);
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.hero-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #00ffff;
  margin-bottom: 20px;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.hero-subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
  font-weight: 300;
}

.hero-description p {
  font-size: 1.2rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

/* Mission Section */
.mission-section {
  padding: 80px 0;
  background: rgba(10, 10, 10, 0.8);
}

.section-title {
  font-size: 2.5rem;
  color: #00ffff;
  margin-bottom: 30px;
  font-weight: 600;
}

.mission-text {
  font-size: 1.1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
}

.mission-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.image-placeholder {
  text-align: center;
  padding: 40px;
  border: 2px dashed rgba(0, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(0, 255, 255, 0.05);
}

.image-placeholder i {
  font-size: 4rem;
  color: #00ffff;
  margin-bottom: 20px;
  display: block;
}

.image-placeholder p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
}

/* Manufacturing Section */
.manufacturing-section {
  padding: 80px 0;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.05) 0%, rgba(0, 150, 255, 0.05) 100%);
}

.feature-card {
  text-align: center;
  padding: 40px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  transition: all 0.3s ease;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: #00ffff;
  box-shadow: 0 10px 30px rgba(0, 255, 255, 0.2);
}

.feature-icon {
  margin-bottom: 20px;
}

.feature-icon i {
  font-size: 3rem;
  color: #00ffff;
}

.feature-card h3 {
  font-size: 1.5rem;
  color: #00ffff;
  margin-bottom: 15px;
  font-weight: 600;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

/* Applications Section */
.applications-section {
  padding: 80px 0;
  background: rgba(10, 10, 10, 0.9);
}

.applications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.application-item {
  padding: 30px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.application-item:hover {
  border-color: #00ffff;
  transform: translateY(-3px);
}

.application-item h4 {
  color: #00ffff;
  font-size: 1.3rem;
  margin-bottom: 15px;
  font-weight: 600;
}

.application-item p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

/* Why Choose Section */
.why-choose-section {
  padding: 80px 0;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.08) 0%, rgba(0, 150, 255, 0.08) 100%);
}

.benefits-list {
  margin-top: 20px;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(0, 255, 255, 0.1);
}

.benefit-item i {
  color: #00ffff;
  font-size: 1.5rem;
  margin-right: 20px;
  margin-top: 5px;
  flex-shrink: 0;
}

.benefit-item h4 {
  color: #00ffff;
  font-size: 1.2rem;
  margin-bottom: 8px;
  font-weight: 600;
}

.benefit-item p {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  padding: 30px 20px;
  background: rgba(0, 255, 255, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #00ffff;
  margin-bottom: 10px;
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  font-weight: 500;
}

/* CTA Section */
.cta-section {
  padding: 80px 0;
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 150, 255, 0.1) 100%);
  border-top: 1px solid rgba(0, 255, 255, 0.2);
}

.cta-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: 2.5rem;
  color: #00ffff;
  margin-bottom: 20px;
  font-weight: 600;
}

.cta-content p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 15px 30px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #00ffff 0%, #0099ff 100%);
  color: #000;
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #00cccc 0%, #0088cc 100%);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.4);
}

.btn-outline {
  background: transparent;
  color: #00ffff;
  border: 2px solid #00ffff;
}

.btn-outline:hover {
  background: rgba(0, 255, 255, 0.1);
  border-color: #00ffff;
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 200px;
  }
}

/* Icon placeholders - you can replace these with actual icons */
.icon-cog::before { content: "⚙️"; }
.icon-precision::before { content: "🎯"; }
.icon-quality::before { content: "⭐"; }
.icon-innovation::before { content: "💡"; }
.icon-check::before { content: "✓"; }
</style>