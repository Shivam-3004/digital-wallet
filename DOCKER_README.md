# Docker Build and Run Instructions

## Prerequisites
- Docker installed
- Docker Compose installed
- Maven installed (for building)

## Quick Start

### Build and Run with Docker Compose
```bash
# Navigate to project directory
cd d:\project\digital-wallet\digital-wallet

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Access Points
- **Application**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Database**: localhost:5432 (postgres/postgres)
- **PgAdmin**: http://localhost:5050 (admin@example.com/admin)

## Manual Docker Build

### Build Image
```bash
docker build -t digital-wallet-app:latest .
```

### Run Container
```bash
docker run -d \
  --name digital-wallet \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DB_HOST=postgres \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  -e JWT_SECRET=YourSecretKey \
  -p 8080:8080 \
  digital-wallet-app:latest
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| SPRING_PROFILES_ACTIVE | prod | Spring profile (dev, prod, test) |
| DB_HOST | postgres | Database host |
| DB_PORT | 5432 | Database port |
| DB_NAME | digital-wallet | Database name |
| DB_USERNAME | postgres | Database user |
| DB_PASSWORD | postgres | Database password |
| JWT_SECRET | SecureJWT... | JWT secret key |
| JWT_REFRESH_EXPIRATION | 7 | Refresh token expiration in days |

## Troubleshooting

### Container won't start
```bash
docker-compose logs app
```

### Database connection issues
```bash
# Check if postgres is running
docker-compose ps

# Restart database
docker-compose restart postgres
```

### Clean rebuild
```bash
docker-compose down -v
docker system prune
docker-compose up -d --build
```

## Health Checks
- Application health: `curl http://localhost:8080/actuator/health`
- Database health: `docker-compose ps`

## Production Considerations
1. Change JWT_SECRET to a strong random value
2. Use environment-specific .env files
3. Configure resource limits (CPU, memory)
4. Enable persistence volume backups
5. Configure monitoring and logging
6. Use secrets management for sensitive data
7. Implement rate limiting and authentication
8. Set up proper error logging and alerts
