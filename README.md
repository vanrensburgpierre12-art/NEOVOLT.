# Neovolt - Dutch Electronics E-commerce Store

A modern, Tron-inspired e-commerce website for selling Dutch electrical connectors and electronic hardware. Built with Vue.js frontend and Node.js/Express backend, running in Docker containers.

## Features

### 🛒 E-commerce Features
- **Product Catalog**: Browse and search Dutch connectors and electronic hardware
- **Shopping Cart**: Add/remove items, update quantities
- **User Authentication**: Registration, login, and profile management
- **Order Management**: Complete order processing and tracking
- **Payment Integration**: PayPal payment processing
- **Admin Dashboard**: Product, order, and user management

### 🎨 Design Features
- **Tron-like Aesthetic**: Neon blue accents, glowing effects, animated lines
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, futuristic interface with smooth animations
- **Dark Theme**: Professional dark background with neon highlights

### 🔧 Technical Features
- **Dockerized**: Complete containerized setup
- **PostgreSQL Database**: Robust data storage
- **RESTful API**: Well-structured backend API
- **JWT Authentication**: Secure user authentication
- **Admin Panel**: Full administrative interface

## Tech Stack

### Frontend
- Vue.js 3
- Vue Router
- Pinia (State Management)
- Axios (HTTP Client)
- GSAP (Animations)
- CSS3 with custom Tron styling

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- PayPal REST SDK
- bcryptjs (Password Hashing)

### Infrastructure
- Docker & Docker Compose
- Nginx (Reverse Proxy)
- PostgreSQL Database

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd neovolt
   ```

2. **Configure Environment Variables**
   ```bash
   # Copy the example environment file
   cp backend/.env.example backend/.env
   
   # Edit the environment variables
   nano backend/.env
   ```

3. **Set up PayPal Integration**
   - Get PayPal Client ID and Secret from [PayPal Developer](https://developer.paypal.com/)
   - Update `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` in `backend/.env`

4. **Start the Application**
   ```bash
   # Build and start all services
   docker-compose up --build
   
   # Or run in background
   docker-compose up -d --build
   ```

5. **Initialize Database**
   ```bash
   # Run database migrations
   docker-compose exec backend npm run migrate
   ```

6. **Access the Application**
   - Frontend: http://localhost:650
   - Backend API: http://localhost:3001
   - Database: localhost:5432

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://neovolt:neovolt123@postgres:5432/neovolt
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
FRONTEND_URL=http://localhost:650
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/categories/all` - Get all categories
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item quantity
- `DELETE /api/cart/remove/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders/create` - Create order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:orderId` - Get order details
- `PUT /api/orders/:orderId/status` - Update order status (Admin)
- `GET /api/orders/admin/all` - Get all orders (Admin)

### Payments
- `POST /api/payments/paypal/create` - Create PayPal payment
- `POST /api/payments/paypal/execute` - Execute PayPal payment
- `GET /api/payments/status/:orderId` - Get payment status

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:userId` - Get user details

## Database Schema

### Users
- id, email, password_hash, first_name, last_name, phone, role, created_at, updated_at

### Products
- id, name, description, price, stock_quantity, category_id, image_url, specifications, is_active, created_at, updated_at

### Categories
- id, name, description, image_url, created_at

### Cart
- id, user_id, product_id, quantity, created_at

### Orders
- id, user_id, order_number, status, total_amount, shipping_address, payment_method, payment_status, payment_id, created_at, updated_at

### Order Items
- id, order_id, product_id, quantity, price, created_at

## Development

### Running in Development Mode

1. **Backend Development**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Database Management

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U neovolt -d neovolt

# Run migrations
docker-compose exec backend npm run migrate

# Reset database
docker-compose down -v
docker-compose up --build
```

## Production Deployment

1. **Update Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong JWT secret
   - Configure production PayPal credentials
   - Set proper database credentials

2. **Build and Deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```

3. **SSL Configuration**
   - Configure SSL certificates
   - Update Nginx configuration for HTTPS

## Admin Features

### Dashboard
- User statistics
- Product inventory
- Order analytics
- Revenue tracking

### Product Management
- Add/edit/delete products
- Manage categories
- Stock management
- Product specifications

### Order Management
- View all orders
- Update order status
- Order details and tracking
- Customer information

### User Management
- View user profiles
- Order history
- Account management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## Changelog

### v1.0.0
- Initial release
- Complete e-commerce functionality
- Tron-inspired UI design
- Docker containerization
- PayPal integration
- Admin dashboard