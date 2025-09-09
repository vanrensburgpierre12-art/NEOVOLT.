const axios = require('axios');

class CourierGuyService {
  constructor() {
    this.apiKey = process.env.COURIERGUY_API_KEY;
    this.baseUrl = process.env.COURIERGUY_BASE_URL || 'https://api.thecourierguy.co.za';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Get shipping rates
  async getShippingRates(origin, destination, weight, dimensions) {
    try {
      const response = await this.client.post('/api/rates', {
        origin: {
          address: origin.address,
          city: origin.city,
          postal_code: origin.postal_code,
          country: origin.country || 'ZA'
        },
        destination: {
          address: destination.address,
          city: destination.city,
          postal_code: destination.postal_code,
          country: destination.country || 'ZA'
        },
        weight: weight, // in kg
        dimensions: {
          length: dimensions.length, // in cm
          width: dimensions.width,   // in cm
          height: dimensions.height  // in cm
        }
      });

      return response.data;
    } catch (error) {
      console.error('CourierGuy rates error:', error.response?.data || error.message);
      throw new Error('Failed to get shipping rates');
    }
  }

  // Create shipment
  async createShipment(orderData) {
    try {
      const shipmentData = {
        order_number: orderData.order_number,
        customer: {
          name: orderData.customer.name,
          email: orderData.customer.email,
          phone: orderData.customer.phone
        },
        pickup_address: {
          name: orderData.pickup.name,
          address: orderData.pickup.address,
          city: orderData.pickup.city,
          postal_code: orderData.pickup.postal_code,
          country: orderData.pickup.country || 'ZA',
          phone: orderData.pickup.phone
        },
        delivery_address: {
          name: orderData.delivery.name,
          address: orderData.delivery.address,
          city: orderData.delivery.city,
          postal_code: orderData.delivery.postal_code,
          country: orderData.delivery.country || 'ZA',
          phone: orderData.delivery.phone
        },
        items: orderData.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          weight: item.weight,
          value: item.value
        })),
        service_type: orderData.service_type || 'standard',
        special_instructions: orderData.special_instructions || ''
      };

      const response = await this.client.post('/api/shipments', shipmentData);
      return response.data;
    } catch (error) {
      console.error('CourierGuy shipment creation error:', error.response?.data || error.message);
      throw new Error('Failed to create shipment');
    }
  }

  // Track shipment
  async trackShipment(trackingNumber) {
    try {
      const response = await this.client.get(`/api/tracking/${trackingNumber}`);
      return response.data;
    } catch (error) {
      console.error('CourierGuy tracking error:', error.response?.data || error.message);
      throw new Error('Failed to track shipment');
    }
  }

  // Get delivery status
  async getDeliveryStatus(trackingNumber) {
    try {
      const trackingData = await this.trackShipment(trackingNumber);
      return {
        status: trackingData.status,
        last_update: trackingData.last_update,
        location: trackingData.location,
        estimated_delivery: trackingData.estimated_delivery
      };
    } catch (error) {
      console.error('CourierGuy delivery status error:', error.response?.data || error.message);
      throw new Error('Failed to get delivery status');
    }
  }

  // Cancel shipment
  async cancelShipment(trackingNumber, reason) {
    try {
      const response = await this.client.post(`/api/shipments/${trackingNumber}/cancel`, {
        reason: reason || 'Customer request'
      });
      return response.data;
    } catch (error) {
      console.error('CourierGuy cancellation error:', error.response?.data || error.message);
      throw new Error('Failed to cancel shipment');
    }
  }

  // Get available services
  async getAvailableServices(origin, destination) {
    try {
      const response = await this.client.get('/api/services', {
        params: {
          origin: origin,
          destination: destination
        }
      });
      return response.data;
    } catch (error) {
      console.error('CourierGuy services error:', error.response?.data || error.message);
      throw new Error('Failed to get available services');
    }
  }

  // Calculate estimated delivery time
  async getEstimatedDelivery(origin, destination, serviceType) {
    try {
      const response = await this.client.get('/api/delivery-estimate', {
        params: {
          origin: origin,
          destination: destination,
          service_type: serviceType
        }
      });
      return response.data;
    } catch (error) {
      console.error('CourierGuy delivery estimate error:', error.response?.data || error.message);
      throw new Error('Failed to get delivery estimate');
    }
  }
}

module.exports = new CourierGuyService();