# Neovolt Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `.env.production` to `.env` and configure all variables
- [ ] Set strong, unique passwords for database and admin account
- [ ] Configure production payment gateway credentials (PayPal, Stripe, Yoco)
- [ ] Set up email service credentials (SMTP)
- [ ] Configure image storage service (Cloudinary)
- [ ] Set up analytics tracking IDs (Google Analytics, GTM)

### 2. SSL Certificates
- [ ] Obtain SSL certificates for your domain
- [ ] Place certificates in `nginx/ssl/` directory:
  - `nginx/ssl/cert.pem` (certificate file)
  - `nginx/ssl/key.pem` (private key file)

### 3. Domain Configuration
- [ ] Update `FRONTEND_URL` in `.env` to your production domain
- [ ] Update `server_name` in `nginx/nginx.conf` to your domain
- [ ] Configure DNS to point to your server

### 4. Security Review
- [ ] Change default JWT secret
- [ ] Change default admin password
- [ ] Review and update database credentials
- [ ] Enable SSL/TLS encryption
- [ ] Configure firewall rules

## 🛠️ Deployment Steps

### 1. Quick Deployment
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 2. Manual Deployment
```bash
# Load environment variables
source .env

# Build and start services
docker-compose -f docker-compose.prod.yml up --build -d

# Check service health
curl http://localhost:3001/api/health
```

## 🔧 Post-Deployment Configuration

### 1. Admin Account
- Default email: `admin@neovolt.com`
- Password: Set via `ADMIN_PASSWORD` environment variable
- Access admin panel at: `https://yourdomain.com/admin`

### 2. Database Management
```bash
# Create database backup
./backup-db.sh

# Access database shell
docker-compose -f docker-compose.prod.yml exec postgres psql -U neovolt -d neovolt
```

### 3. Monitoring
- Health check: `https://yourdomain.com/api/health`
- View logs: `docker-compose -f docker-compose.prod.yml logs -f`
- Monitor resources: `docker stats`

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use strong, unique passwords
- Rotate secrets regularly
- Use environment-specific configurations

### 2. Database Security
- Enable SSL connections in production
- Use strong database passwords
- Regular backups
- Monitor database access

### 3. Application Security
- Keep dependencies updated
- Monitor for security vulnerabilities
- Implement rate limiting
- Use HTTPS everywhere

## 📊 Monitoring and Maintenance

### 1. Health Checks
- Backend: `GET /api/health`
- Database connection monitoring
- Service uptime tracking

### 2. Logs
- Application logs: `docker-compose logs backend`
- Nginx logs: `docker-compose logs nginx`
- Database logs: `docker-compose logs postgres`

### 3. Backups
- Database backups: `./backup-db.sh`
- Automated daily backups recommended
- Test backup restoration process

## 🚨 Troubleshooting

### Common Issues

1. **Services not starting**
   - Check environment variables
   - Verify SSL certificates
   - Check port availability

2. **Database connection errors**
   - Verify database credentials
   - Check database container status
   - Review connection string format

3. **SSL certificate errors**
   - Verify certificate files exist
   - Check certificate validity
   - Ensure proper file permissions

### Support
- Check logs: `docker-compose logs -f`
- Health check: `curl http://localhost:3001/api/health`
- Restart services: `docker-compose restart`

## 📈 Performance Optimization

### 1. Caching
- Static assets cached for 1 year
- API responses cached for 5 minutes
- Database query optimization

### 2. Compression
- Gzip compression enabled
- Image optimization
- Minified assets

### 3. Security Headers
- HSTS enabled
- CSP configured
- XSS protection
- Content type sniffing protection

## 🔄 Updates and Maintenance

### 1. Application Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up --build -d
```

### 2. Database Migrations
```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migrate
```

### 3. SSL Certificate Renewal
- Update certificate files in `nginx/ssl/`
- Restart nginx: `docker-compose restart nginx`

## 📞 Support and Maintenance

For production support and maintenance:
- Monitor application logs regularly
- Set up automated backups
- Implement monitoring alerts
- Regular security updates
- Performance monitoring