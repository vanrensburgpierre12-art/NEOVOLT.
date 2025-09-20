<template>
  <div class="shipping-info">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">Shipping Information</h1>
        <p class="page-subtitle">Fast and reliable delivery to your doorstep</p>
      </div>

      <div class="content-grid">
        <!-- Shipping Times -->
        <div class="info-section">
          <h2>Delivery Times</h2>
          <div class="delivery-options">
            <div class="delivery-option">
              <div class="option-header">
                <h3>Overnight Delivery</h3>
                <span class="delivery-time">Next Day</span>
              </div>
              <p>Available for major cities in South Africa. Orders placed before 10:00 AM will be delivered the next business day.</p>
              <ul class="delivery-features">
                <li>✓ Major cities only</li>
                <li>✓ Cut-off time: 10:00 AM</li>
                <li>✓ Next business day delivery</li>
              </ul>
            </div>

            <div class="delivery-option">
              <div class="option-header">
                <h3>Regional Delivery</h3>
                <span class="delivery-time">3 Days</span>
              </div>
              <p>Standard delivery to regional areas within South Africa. Reliable service to all locations.</p>
              <ul class="delivery-features">
                <li>✓ All regional areas</li>
                <li>✓ 3 business days</li>
                <li>✓ Tracked delivery</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Shipping Methods -->
        <div class="info-section">
          <h2>Shipping Methods</h2>
          <div class="shipping-methods">
            <div class="method">
              <div class="method-icon">🚚</div>
              <div class="method-info">
                <h3>Local Delivery</h3>
                <p>We use The Courier Guy for all local deliveries within South Africa. Reliable and cost-effective service.</p>
                <ul>
                  <li>Overnight delivery to major cities</li>
                  <li>3-day delivery to regional areas</li>
                  <li>Real-time tracking</li>
                  <li>Signature required on delivery</li>
                </ul>
              </div>
            </div>

            <div class="method">
              <div class="method-icon">🌍</div>
              <div class="method-info">
                <h3>International Delivery</h3>
                <p>DHL handles all our international shipments with fast and secure delivery worldwide.</p>
                <ul>
                  <li>DHL Express worldwide</li>
                  <li>5-10 business days delivery</li>
                  <li>Full tracking and insurance</li>
                  <li>Customs handling included</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- South Africa Pricing -->
        <div class="info-section">
          <h2>Shipping Rates</h2>
          <div class="pricing-info">
            <div class="pricing-card">
              <h3>South Africa</h3>
              <div class="pricing-details">
                <div class="price-item">
                  <span class="weight">Under 1KG</span>
                  <span class="price">R150</span>
                </div>
                <div class="price-item">
                  <span class="weight">Over 1KG</span>
                  <span class="price">Custom Quote</span>
                </div>
              </div>
              <p class="pricing-note">Contact us for custom quotes on heavier items</p>
            </div>

            <div class="pricing-card">
              <h3>International</h3>
              <div class="pricing-details">
                <div class="price-item">
                  <span class="weight">Standard</span>
                  <span class="price">Calculated at checkout</span>
                </div>
                <div class="price-item">
                  <span class="weight">Express</span>
                  <span class="price">Calculated at checkout</span>
                </div>
              </div>
              <p class="pricing-note">Rates calculated based on destination and weight</p>
            </div>
          </div>
        </div>

        <!-- Pickup Option -->
        <div class="info-section">
          <h2>Warehouse Pickup</h2>
          <div class="pickup-info">
            <div class="pickup-details">
              <h3>Free Pickup Available</h3>
              <p>Save on shipping costs by collecting your order from our warehouse in Boksburg.</p>
              
              <div class="pickup-address">
                <h4>Pickup Location</h4>
                <address>
                  Neovolt Electronics<br>
                  Boksburg, South Africa<br>
                  <strong>Contact:</strong> +27 XX XXX XXXX
                </address>
              </div>

              <div class="pickup-hours">
                <h4>Pickup Hours</h4>
                <ul>
                  <li>Monday - Friday: 9:00 AM - 5:00 PM</li>
                  <li>Saturday: 9:00 AM - 1:00 PM</li>
                  <li>Sunday: Closed</li>
                </ul>
              </div>

              <div class="pickup-instructions">
                <h4>Pickup Instructions</h4>
                <ul>
                  <li>Bring a valid ID</li>
                  <li>Bring your order confirmation</li>
                  <li>We'll notify you when your order is ready</li>
                  <li>Free parking available</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Processing -->
        <div class="info-section">
          <h2>Order Processing</h2>
          <div class="processing-steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Order Placed</h3>
                <p>Your order is received and confirmed</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Processing</h3>
                <p>Items are picked and packed (same day if before 10:00 AM)</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Shipped</h3>
                <p>Order is dispatched with tracking information</p>
              </div>
            </div>
            <div class="step">
              <div class="step-number">4</div>
              <div class="step-content">
                <h3>Delivered</h3>
                <p>Package arrives at your specified address</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="info-section">
          <h2>Need Help?</h2>
          <div class="contact-info">
            <p>If you have any questions about shipping or delivery, please contact us:</p>
            <div class="contact-methods">
              <div class="contact-method">
                <strong>Email:</strong> info@neovolt.co.za
              </div>
              <div class="contact-method">
                <strong>Phone:</strong> +27 XX XXX XXXX
              </div>
              <div class="contact-method">
                <strong>WhatsApp:</strong> +27 XX XXX XXXX
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShippingInfo',
  metaInfo: {
    title: 'Shipping Information - Neovolt Electronics',
    meta: [
      { name: 'description', content: 'Learn about Neovolt Electronics shipping options, delivery times, and rates for South Africa and international orders.' }
    ]
  }
}
</script>

<style scoped>
.shipping-info {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  color: #ffffff;
  padding: 40px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
}

.page-title {
  font-size: 3rem;
  color: #00ffff;
  margin-bottom: 20px;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
}

.page-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto;
}

.content-grid {
  display: grid;
  gap: 40px;
}

.info-section {
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  padding: 30px;
}

.info-section h2 {
  color: #00ffff;
  font-size: 2rem;
  margin-bottom: 30px;
  text-align: center;
}

.delivery-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 30px;
}

.delivery-option {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 25px;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.option-header h3 {
  color: #ffffff;
  margin: 0;
  font-size: 1.3rem;
}

.delivery-time {
  background: #00ffff;
  color: #000;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
}

.delivery-features {
  list-style: none;
  padding: 0;
  margin-top: 15px;
}

.delivery-features li {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.shipping-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.method {
  display: flex;
  gap: 20px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 25px;
}

.method-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.method-info h3 {
  color: #00ffff;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.method-info ul {
  list-style: none;
  padding: 0;
  margin-top: 15px;
}

.method-info ul li {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.pricing-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.pricing-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  padding: 25px;
  text-align: center;
}

.pricing-card h3 {
  color: #00ffff;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.pricing-details {
  margin-bottom: 15px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 255, 255, 0.2);
}

.price-item:last-child {
  border-bottom: none;
}

.weight {
  color: rgba(255, 255, 255, 0.8);
}

.price {
  color: #00ffff;
  font-weight: bold;
}

.pricing-note {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin: 0;
}

.pickup-info {
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 8px;
  padding: 25px;
}

.pickup-details h3 {
  color: #00ffff;
  margin-bottom: 15px;
  font-size: 1.3rem;
}

.pickup-address,
.pickup-hours,
.pickup-instructions {
  margin: 20px 0;
}

.pickup-address h4,
.pickup-hours h4,
.pickup-instructions h4 {
  color: #00ffff;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.pickup-address address {
  color: rgba(255, 255, 255, 0.8);
  font-style: normal;
  line-height: 1.6;
}

.pickup-hours ul,
.pickup-instructions ul {
  list-style: none;
  padding: 0;
}

.pickup-hours ul li,
.pickup-instructions ul li {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.processing-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
}

.step {
  text-align: center;
  position: relative;
}

.step-number {
  width: 50px;
  height: 50px;
  background: #00ffff;
  color: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  margin: 0 auto 15px;
}

.step-content h3 {
  color: #00ffff;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.step-content p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 0;
}

.contact-info {
  text-align: center;
}

.contact-info p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.contact-methods {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.contact-method {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.contact-method strong {
  color: #00ffff;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .delivery-options,
  .shipping-methods,
  .pricing-info,
  .processing-steps {
    grid-template-columns: 1fr;
  }
  
  .method {
    flex-direction: column;
    text-align: center;
  }
  
  .contact-methods {
    flex-direction: column;
    gap: 15px;
  }
}
</style>