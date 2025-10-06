# Deployment Guide - Pashion ERP System

This guide covers deployment options for the Pashion ERP System in various environments.

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 16+ and npm 8+
- MySQL 8.0+
- Git

### Setup Steps
```bash
# 1. Clone and setup
git clone <repository-url>
cd passion-inventory
npm install concurrently -g

# 2. Install dependencies
npm run install-all

# 3. Setup database
mysql -u root -p
CREATE DATABASE passion_erp;
exit

# 4. Configure environment
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit the .env files with your database credentials

# 5. Run migrations and seed data
npm run migrate
npm run seed

# 6. Start development servers
npm run dev
```

Access the application at http://localhost:3000

## 🏭 Production Deployment

### Option 1: Traditional Server Deployment

#### Server Requirements
- **OS**: Ubuntu 20.04 LTS or CentOS 8+
- **CPU**: 4 cores, 2.5 GHz
- **RAM**: 8 GB
- **Storage**: 50 GB SSD
- **Network**: 100 Mbps

#### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install Nginx
sudo apt install nginx -y

# Install PM2 for process management
sudo npm install -g pm2
```

#### Step 2: Database Setup
```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE passion_erp;
CREATE USER 'passion_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON passion_erp.* TO 'passion_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Step 3: Application Deployment
```bash
# Create application directory
sudo mkdir -p /var/www/passion-erp
sudo chown $USER:$USER /var/www/passion-erp

# Clone repository
cd /var/www/passion-erp
git clone <repository-url> .

# Install dependencies
npm run install-all

# Build frontend
cd client
npm run build
cd ..

# Setup environment variables
cp server/.env.example server/.env
# Edit server/.env with production values

# Run database migrations
npm run migrate

# Start application with PM2
pm2 start server/index.js --name "passion-erp-api"
pm2 startup
pm2 save
```

#### Step 4: Nginx Configuration
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/passion-erp
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend (React build)
    location / {
        root /var/www/passion-erp/client/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # API routes
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location /uploads {
        alias /var/www/passion-erp/server/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/passion-erp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Option 2: Docker Deployment

#### Docker Compose Setup
Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: passion-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql/init:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"
    networks:
      - passion-network

  # Backend API
  api:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: passion-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    volumes:
      - ./server/uploads:/app/uploads
      - ./server/logs:/app/logs
    ports:
      - "5000:5000"
    depends_on:
      - mysql
    networks:
      - passion-network

  # Frontend
  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: ${REACT_APP_API_URL}
    container_name: passion-frontend
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - api
    networks:
      - passion-network

  # Redis (for caching and sessions)
  redis:
    image: redis:7-alpine
    container_name: passion-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - passion-network

volumes:
  mysql_data:
  redis_data:

networks:
  passion-network:
    driver: bridge
```

#### Server Dockerfile
Create `server/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads logs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

#### Client Dockerfile
Create `client/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Deploy with Docker
```bash
# Create environment file
cp .env.example .env
# Edit .env with production values

# Build and start services
docker-compose up -d --build

# Run migrations
docker-compose exec api npm run migrate

# Check logs
docker-compose logs -f
```

### Option 3: Cloud Deployment (AWS)

#### AWS Architecture
- **EC2**: Application servers
- **RDS**: MySQL database
- **S3**: File storage
- **CloudFront**: CDN
- **ALB**: Load balancer
- **Route 53**: DNS

#### Terraform Configuration
Create `infrastructure/main.tf`:

```hcl
provider "aws" {
  region = var.aws_region
}

# VPC and Networking
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "passion-erp-vpc"
  }
}

# RDS MySQL Instance
resource "aws_db_instance" "mysql" {
  identifier     = "passion-erp-db"
  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true

  tags = {
    Name = "passion-erp-database"
  }
}

# EC2 Instance for API
resource "aws_instance" "api" {
  ami           = "ami-0c02fb55956c7d316" # Amazon Linux 2
  instance_type = "t3.medium"
  
  vpc_security_group_ids = [aws_security_group.api.id]
  subnet_id              = aws_subnet.public[0].id
  
  user_data = file("user-data.sh")

  tags = {
    Name = "passion-erp-api"
  }
}

# S3 Bucket for file uploads
resource "aws_s3_bucket" "uploads" {
  bucket = "passion-erp-uploads-${random_string.bucket_suffix.result}"

  tags = {
    Name = "passion-erp-uploads"
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-passion-erp-frontend"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.main.cloudfront_access_identity_path
    }
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-passion-erp-frontend"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "passion-erp-cdn"
  }
}
```

#### Deploy to AWS
```bash
# Install Terraform
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform

# Initialize and deploy
cd infrastructure
terraform init
terraform plan
terraform apply
```

## 🔧 Environment Configuration

### Production Environment Variables

#### Server (.env)
```bash
NODE_ENV=production
PORT=5000

# Database
DB_HOST=your-production-db-host
DB_PORT=3306
DB_NAME=passion_erp
DB_USER=passion_user
DB_PASSWORD=your-strong-password

# JWT
JWT_SECRET=your-super-strong-jwt-secret-key
JWT_EXPIRES_IN=24h

# Email
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=noreply@your-domain.com
SMTP_PASS=your-email-password

# File uploads
UPLOAD_PATH=/var/www/passion-erp/server/uploads
MAX_FILE_SIZE=10485760

# CORS
CORS_ORIGIN=https://your-domain.com

# Logging
LOG_LEVEL=warn
LOG_FILE=/var/www/passion-erp/server/logs/app.log
```

#### Client (.env.production)
```bash
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_NAME=Pashion ERP System
REACT_APP_COMPANY_NAME=Pashion Clothing Factory
GENERATE_SOURCEMAP=false
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# API health check endpoint
curl https://your-domain.com/api/health

# Database connection check
curl https://your-domain.com/api/health/db

# System status
pm2 status
```

### Log Management
```bash
# View application logs
pm2 logs passion-erp-api

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Rotate logs
sudo logrotate -f /etc/logrotate.d/nginx
```

### Backup Strategy
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u passion_user -p passion_erp > /backups/passion_erp_$DATE.sql
gzip /backups/passion_erp_$DATE.sql

# Keep only last 30 days
find /backups -name "passion_erp_*.sql.gz" -mtime +30 -delete
```

### Performance Monitoring
```bash
# Install monitoring tools
npm install -g clinic
npm install -g autocannon

# Performance testing
autocannon -c 10 -d 30 https://your-domain.com/api/health

# Memory and CPU profiling
clinic doctor -- node server/index.js
```

## 🔒 Security Checklist

### Server Security
- [ ] Firewall configured (UFW/iptables)
- [ ] SSH key-based authentication
- [ ] Regular security updates
- [ ] Non-root user for application
- [ ] SSL/TLS certificates
- [ ] Rate limiting enabled
- [ ] Input validation
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF protection

### Database Security
- [ ] Strong passwords
- [ ] Limited user privileges
- [ ] Regular backups
- [ ] Encrypted connections
- [ ] Access logging
- [ ] Regular updates

### Application Security
- [ ] Environment variables secured
- [ ] JWT secrets rotated
- [ ] File upload restrictions
- [ ] API rate limiting
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Dependencies updated

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check MySQL status
sudo systemctl status mysql

# Check connection
mysql -u passion_user -p -h localhost passion_erp

# Check firewall
sudo ufw status
```

#### Application Won't Start
```bash
# Check Node.js version
node --version

# Check dependencies
npm audit

# Check logs
pm2 logs passion-erp-api
```

#### High Memory Usage
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Restart application
pm2 restart passion-erp-api
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run
```

## 📞 Support

For deployment support:
- Email: devops@pashion.com
- Documentation: [Deployment Wiki](https://github.com/pashion/erp-system/wiki/deployment)
- Issues: [GitHub Issues](https://github.com/pashion/erp-system/issues)

---

**Happy Deploying! 🚀**