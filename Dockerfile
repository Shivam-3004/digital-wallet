# Multi-stage build for optimization
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -q -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jdk-alpine
RUN apk add --no-cache curl
WORKDIR /app

# Add non-root user for security
RUN addgroup -g 1001 -S appuser && adduser -u 1001 -S appuser -G appuser

# Copy built application from builder
COPY --from=builder /app/target/digital-wallet-*.jar app.jar

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Environment variables (can be overridden at runtime)
ENV SPRING_PROFILES_ACTIVE=prod \
    SERVER_PORT=8080 \
    DB_HOST=postgres \
    DB_PORT=5432 \
    DB_NAME=digital-wallet \
    DB_USERNAME=postgres \
    DB_PASSWORD=postgres \
    JWT_SECRET=SecureJWTSecretForProduction2026 \
    JWT_REFRESH_EXPIRATION=7 \
    EMAIL_VERIFICATION_EXPIRATION=24 \
    PASSWORD_RESET_EXPIRATION=1

EXPOSE 8080

ENTRYPOINT ["java", "-Xmx512m", "-Xms256m", "-jar", "app.jar", \
            "--spring.datasource.url=jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}", \
            "--spring.datasource.username=${DB_USERNAME}", \
            "--spring.datasource.password=${DB_PASSWORD}", \
            "--jwt.secret=${JWT_SECRET}", \
            "--jwt.refresh.expiration=${JWT_REFRESH_EXPIRATION}", \
            "--email.verification.expiration.hours=${EMAIL_VERIFICATION_EXPIRATION}", \
            "--password.reset.expiration.hours=${PASSWORD_RESET_EXPIRATION}"]
