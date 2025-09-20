# PayPal Integration Setup Guide

## 🔧 **Current Issue**
PayPal is returning a 401 "Client Authentication failed" error because the API credentials are not properly configured.

## 📋 **Setup Steps**

### 1. Get PayPal API Credentials

1. **Go to PayPal Developer Dashboard**
   - Visit: https://developer.paypal.com/
   - Log in with your PayPal business account

2. **Create a New Application**
   - Click "Create App"
   - Choose "Default Application" or "Custom App"
   - Select "Sandbox" for testing or "Live" for production

3. **Get Your Credentials**
   - Copy the **Client ID**
   - Copy the **Client Secret**

### 2. Configure Environment Variables

#### **Option A: Using .env file (Recommended)**
1. Edit the `.env` file in the project root
2. Replace the placeholder values:
   ```bash
   PAYPAL_CLIENT_ID=your-actual-client-id-here
   PAYPAL_CLIENT_SECRET=your-actual-client-secret-here
   ```

#### **Option B: Set Environment Variables Directly**
```bash
export PAYPAL_CLIENT_ID="your-actual-client-id-here"
export PAYPAL_CLIENT_SECRET="your-actual-client-secret-here"
```

### 3. Restart the Application

After setting the credentials, restart your Docker containers:

```bash
# Stop current containers
docker compose down

# Start with new environment variables
docker compose up -d
```

### 4. Test PayPal Integration

1. Go to your checkout page
2. Select PayPal as payment method
3. The error should be resolved

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **Still getting 401 error?**
   - Double-check your credentials are correct
   - Ensure you're using the right environment (sandbox vs live)
   - Verify the credentials are properly set in the environment

2. **Sandbox vs Live Mode**
   - **Sandbox**: Use for testing with fake PayPal accounts
   - **Live**: Use for real transactions with real PayPal accounts
   - The mode is automatically set based on `NODE_ENV`

3. **Check Logs**
   ```bash
   docker compose logs backend
   ```
   Look for PayPal configuration messages

## 📝 **PayPal Sandbox Testing**

For testing, you can use PayPal's sandbox accounts:
- **Buyer Account**: Use PayPal's test buyer accounts
- **Seller Account**: Your sandbox business account

## 🚀 **Production Deployment**

For production:
1. Use **Live** mode credentials
2. Set `NODE_ENV=production`
3. Ensure your domain is verified with PayPal
4. Test thoroughly before going live

## 📞 **Support**

If you continue to have issues:
1. Check PayPal Developer Dashboard for any account restrictions
2. Verify your PayPal account is in good standing
3. Contact PayPal support if needed