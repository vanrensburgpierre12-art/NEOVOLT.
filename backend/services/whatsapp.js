const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.apiKey = process.env.WHATSAPP_API_KEY;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.baseUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  }

  // Send text message
  async sendTextMessage(to, message) {
    try {
      const response = await axios.post(this.baseUrl, {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('WhatsApp text message error:', error.response?.data || error.message);
      throw new Error('Failed to send WhatsApp message');
    }
  }

  // Send template message
  async sendTemplateMessage(to, templateName, languageCode = 'en_US', components = []) {
    try {
      const response = await axios.post(this.baseUrl, {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          components: components
        }
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('WhatsApp template message error:', error.response?.data || error.message);
      throw new Error('Failed to send WhatsApp template message');
    }
  }

  // Send order confirmation message
  async sendOrderConfirmation(customerPhone, orderData) {
    const message = `🎉 *Order Confirmed!*

Order #${orderData.order_number}
Total: $${orderData.total_amount}

Your order has been received and is being processed. We'll send you tracking information once it ships.

Thank you for choosing Neovolt Electronics!`;

    return await this.sendTextMessage(customerPhone, message);
  }

  // Send shipping notification
  async sendShippingNotification(customerPhone, orderData, trackingNumber) {
    const message = `📦 *Your Order Has Shipped!*

Order #${orderData.order_number}
Tracking Number: ${trackingNumber}

Your order is on its way! You can track it using the tracking number above.

Thank you for your business!`;

    return await this.sendTextMessage(customerPhone, message);
  }

  // Send delivery confirmation
  async sendDeliveryConfirmation(customerPhone, orderData) {
    const message = `✅ *Order Delivered!*

Order #${orderData.order_number}

Your order has been successfully delivered. We hope you love your new products!

Thank you for choosing Neovolt Electronics!`;

    return await this.sendTextMessage(customerPhone, message);
  }

  // Send payment reminder
  async sendPaymentReminder(customerPhone, orderData) {
    const message = `💳 *Payment Reminder*

Order #${orderData.order_number}
Amount: $${orderData.total_amount}

Your payment is pending. Please complete your payment to process your order.

Thank you!`;

    return await this.sendTextMessage(customerPhone, message);
  }

  // Send newsletter message
  async sendNewsletterMessage(phoneNumbers, newsletterData) {
    const results = [];
    
    for (const phoneNumber of phoneNumbers) {
      try {
        const message = `📰 *${newsletterData.subject}*

${newsletterData.content}

---
Neovolt Electronics
Unsubscribe: Reply STOP`;

        const result = await this.sendTextMessage(phoneNumber, message);
        results.push({ phoneNumber, success: true, result });
      } catch (error) {
        results.push({ phoneNumber, success: false, error: error.message });
      }
    }

    return results;
  }

  // Send customer support message
  async sendCustomerSupportMessage(customerPhone, supportMessage) {
    const message = `🛠️ *Customer Support*

${supportMessage}

Our team will get back to you shortly. Thank you for contacting us!`;

    return await this.sendTextMessage(customerPhone, message);
  }

  // Send promotional message
  async sendPromotionalMessage(customerPhone, promotionData) {
    const message = `🎉 *Special Offer!*

${promotionData.title}

${promotionData.description}

Discount: ${promotionData.discount}% off
Valid until: ${promotionData.validUntil}

Shop now: ${process.env.FRONTEND_URL}/products

---
Neovolt Electronics
Reply STOP to unsubscribe`;

    return await this.sendTextMessage(customerPhone, message);
  }

  // Verify webhook
  verifyWebhook(mode, token, challenge) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      return challenge;
    }
    return null;
  }

  // Process incoming webhook
  processWebhook(body) {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.messages) {
        const message = value.messages[0];
        return {
          from: message.from,
          messageId: message.id,
          timestamp: message.timestamp,
          type: message.type,
          text: message.text?.body,
          name: value.contacts?.[0]?.profile?.name
        };
      }

      return null;
    } catch (error) {
      console.error('WhatsApp webhook processing error:', error);
      return null;
    }
  }
}

module.exports = new WhatsAppService();