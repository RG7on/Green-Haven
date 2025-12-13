# Docker Deployment Guide

## Prerequisites

- Docker Desktop installed (for Windows)
- Docker Compose (comes with Docker Desktop)

## Quick Start

### 1. Environment Setup

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- `JWT_SECRET`: A secure random string for JWT token signing
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `VITE_API_URL`: API URL (use `http://localhost:5000` for local development)

### 2. Build and Run

Build and start all services:

```bash
docker-compose up --build
```

Or run in detached mode:

```bash
docker-compose up -d --build
```

### 3. Access the Application

- **Frontend**: http://localhost (port 80)
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

## Docker Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f mongodb
```

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Volumes

```bash
docker-compose down -v
```

### Rebuild Specific Service

```bash
docker-compose up -d --build server
docker-compose up -d --build client
```

### Execute Commands in Containers

```bash
# Access server container
docker-compose exec server sh

# Access MongoDB
docker-compose exec mongodb mongosh -u admin -p password123

# Run database seeds
docker-compose exec server node utils/seedProducts.js
```

## Production Deployment

### Build for Production

1. Update environment variables in `.env` for production
2. Build production images:

```bash
docker-compose -f docker-compose.yml build
```

### Push to Registry

Tag and push images to Docker Hub or your registry:

```bash
# Tag images
docker tag greenhaven-server:latest yourusername/greenhaven-server:latest
docker tag greenhaven-client:latest yourusername/greenhaven-client:latest

# Push to registry
docker push yourusername/greenhaven-server:latest
docker push yourusername/greenhaven-client:latest
```

## Troubleshooting

### Container won't start

```bash
# Check container logs
docker-compose logs [service-name]

# Check container status
docker-compose ps
```

### MongoDB connection issues

```bash
# Verify MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Test MongoDB connection
docker-compose exec mongodb mongosh -u admin -p password123
```

### Reset Everything

```bash
# Stop all containers and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose up --build
```

## Architecture

The application consists of three services:

1. **MongoDB**: Database service with persistent storage
2. **Server**: Node.js/Express backend API
3. **Client**: React frontend served by Nginx

All services communicate through a dedicated Docker network.

## Volumes

- `mongodb_data`: Persists MongoDB database files
- `mongodb_config`: Persists MongoDB configuration

## Health Checks

- **MongoDB**: Automated health check using mongosh ping
- **Server**: HTTP health check endpoint at `/api/health`

## Security Notes

- Change default MongoDB credentials in production
- Use strong JWT_SECRET value
- Never commit `.env` file to version control
- Use Docker secrets for sensitive data in production
- Keep MongoDB port (27017) closed to external access
