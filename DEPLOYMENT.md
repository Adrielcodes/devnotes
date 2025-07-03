# DevNotes Deployment Guide

This guide covers deploying DevNotes to various platforms.

## 🚀 Quick Deploy Options

### Option 1: Netlify (Frontend) + Railway (Backend) - Recommended

#### Frontend Deployment (Netlify)

1. **Push your code to GitHub/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Click "New site from Git"
   - Connect your repository
   - Set build settings:
     - Build command: (leave empty)
     - Publish directory: `public`
   - Click "Deploy site"

3. **Update API URL**
   - After deployment, update the `API_BASE_URL` in `public/script.js` with your backend URL

#### Backend Deployment (Railway)

1. **Deploy to Railway**
   - Go to [railway.app](https://railway.app) and sign up/login
   - Click "New Project" → "Deploy from GitHub repo"
   - Connect your repository
   - Add environment variables:
     ```
     DB_HOST=your-mysql-host
     DB_USER=your-mysql-user
     DB_PASSWORD=your-mysql-password
     DB_NAME=devnotes
     SESSION_SECRET=your-super-secret-key
     NODE_ENV=production
     ALLOWED_ORIGINS=https://your-netlify-app.netlify.app
     ```

2. **Set up MySQL Database**
   - Use Railway's MySQL plugin or external service (PlanetScale, AWS RDS, etc.)
   - Update database environment variables

3. **Update Frontend API URL**
   - Copy your Railway app URL
   - Update `API_BASE_URL` in `public/script.js`

### Option 2: Full Stack on Railway

1. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub repo
   - Add MySQL plugin
   - Set environment variables
   - Deploy

2. **Configure Domain**
   - Railway provides a custom domain
   - Or connect your own domain

### Option 3: Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-devnotes-app
   ```

3. **Add MySQL Database**
   ```bash
   heroku addons:create jawsdb:kitefin
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SESSION_SECRET=your-super-secret-key
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### 1. Local Development
```bash
# Clone and setup
git clone <your-repo-url>
cd devnotes
npm install

# Start MySQL
brew services start mysql  # macOS
sudo systemctl start mysql # Linux

# Create database
mysql -u root -e "CREATE DATABASE IF NOT EXISTS devnotes;"

# Start application
npm start
```

### 2. Docker Deployment
```bash
# Build and run with Docker
docker build -t devnotes .
docker run -p 3000:3000 --name devnotes-app devnotes
```

### 3. Cloud Deployment
- **Heroku**: Use Heroku Postgres addon
- **Railway**: Automatic MySQL provisioning
- **Render**: Free tier with PostgreSQL
- **Vercel**: Serverless deployment

## 📋 Prerequisites

### System Requirements
- Node.js 14+ 
- MySQL 8.0+
- 512MB RAM minimum
- 1GB disk space

### Production Checklist
- [ ] Environment variables configured
- [ ] Database connection secured
- [ ] SSL certificate installed
- [ ] Process manager configured
- [ ] Logging setup
- [ ] Monitoring configured
- [ ] Backup strategy implemented

## 🔧 Environment Configuration

### Production Environment Variables

Create a `.env` file in production:

```env
# Database (Production)
DB_HOST=your-production-db-host
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=devnotes

# Security
SESSION_SECRET=your-very-long-random-secret-key
NODE_ENV=production

# Server
PORT=3000
HOST=0.0.0.0

# Optional: Redis for session storage
REDIS_URL=redis://localhost:6379
```

### Database Setup

#### MySQL Production Setup

```sql
-- Create production database
CREATE DATABASE devnotes_prod;

-- Create dedicated user
CREATE USER 'devnotes_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON devnotes_prod.* TO 'devnotes_user'@'%';
FLUSH PRIVILEGES;

-- Configure MySQL for production
SET GLOBAL max_connections = 200;
SET GLOBAL wait_timeout = 600;
SET GLOBAL interactive_timeout = 600;
```

#### Connection Pooling

The application uses MySQL2 connection pooling. For high-traffic sites, consider:

```javascript
// Enhanced pool configuration
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 20,        // Increase for production
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S devnotes -u 1001

# Change ownership
RUN chown -R devnotes:nodejs /app
USER devnotes

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/test || exit 1

# Start application
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_USER=devnotes_user
      - DB_PASSWORD=secure_password
      - DB_NAME=devnotes
      - SESSION_SECRET=your-secret-key
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=devnotes
      - MYSQL_USER=devnotes_user
      - MYSQL_PASSWORD=secure_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "3306:3306"
    restart: unless-stopped

volumes:
  mysql_data:
```

### Docker Commands

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Update application
docker-compose pull
docker-compose up -d
```

## ☁️ Cloud Deployment

### Heroku Deployment

1. **Create Heroku app**
   ```bash
   heroku create your-devnotes-app
   ```

2. **Add MySQL addon**
   ```bash
   heroku addons:create jawsdb:kitefin
   ```

3. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SESSION_SECRET=your-secret-key
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Railway Deployment

1. **Connect repository**
   - Link your GitHub/Bitbucket repository
   - Railway will auto-detect Node.js

2. **Add MySQL service**
   - Create new MySQL service
   - Link to your application

3. **Configure environment**
   - Set `NODE_ENV=production`
   - Set `SESSION_SECRET`

4. **Deploy**
   - Railway auto-deploys on push

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure environment**
   - Add environment variables in Vercel dashboard
   - Use external MySQL service (PlanetScale, Railway, etc.)

## 🔒 Security Configuration

### SSL/TLS Setup

#### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Security Headers

Add security middleware to your Express app:

```javascript
const helmet = require('helmet');

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
```

## 📊 Process Management

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'devnotes',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### PM2 Commands

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start ecosystem.config.js --env production

# Monitor
pm2 monit

# View logs
pm2 logs devnotes

# Restart
pm2 restart devnotes

# Stop
pm2 stop devnotes

# Setup startup script
pm2 startup
pm2 save
```

## 📈 Monitoring & Logging

### Application Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'devnotes' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### Health Checks

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'connected'
  };
  
  res.status(200).json(health);
});
```

### Database Monitoring

```sql
-- Monitor slow queries
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Check connection status
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';

-- Monitor table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'devnotes'
ORDER BY (data_length + index_length) DESC;
```

## 💾 Backup Strategy

### Database Backups

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="devnotes"

# Create backup
mysqldump -u root -p $DB_NAME > $BACKUP_DIR/devnotes_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/devnotes_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "devnotes_*.sql.gz" -mtime +7 -delete

echo "Backup completed: devnotes_$DATE.sql.gz"
```

### Automated Backups

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh

# Weekly backup on Sunday
0 2 * * 0 /path/to/backup.sh
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to server
      run: |
        # Add your deployment commands here
        echo "Deploying to production..."
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check MySQL status
   sudo systemctl status mysql
   
   # Check connection
   mysql -u root -p -e "SELECT 1;"
   ```

2. **Port Already in Use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill process
   kill -9 <PID>
   ```

3. **Memory Issues**
   ```bash
   # Check memory usage
   free -h
   
   # Increase Node.js memory limit
   node --max-old-space-size=2048 server.js
   ```

4. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER /path/to/app
   chmod +x /path/to/app/server.js
   ```

### Performance Optimization

1. **Enable Gzip Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Add Caching Headers**
   ```javascript
   app.use(express.static('public', {
     maxAge: '1d',
     etag: true
   }));
   ```

3. **Database Indexing**
   ```sql
   -- Add indexes for better performance
   CREATE INDEX idx_notes_user_id ON notes(user_id);
   CREATE INDEX idx_notes_created_at ON notes(created_at);
   CREATE INDEX idx_sessions_user_id ON sessions(user_id);
   ```

## 📞 Support

For deployment issues:

1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Review security configuration
5. Check system resources

---

**Happy Deploying! 🚀** 