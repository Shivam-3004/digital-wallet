# 💳 Digital Wallet

A modern full-stack Digital Wallet application built using Spring Boot, PostgreSQL, React, TypeScript, and JWT Authentication.

Designed with a premium user experience inspired by Stripe, Revolut, and modern fintech platforms.

🌐 **Live Demo:** https://digital-wallet-one-inky.vercel.app/

---

# 📸 Preview

### Landing Page

Modern responsive landing page with premium UI, animations, and feature highlights.

### User Dashboard

Track balances, transactions, deposits, withdrawals, and transfers in real time.

### Admin Dashboard

Monitor users, transactions, platform analytics, and wallet activity.

---

# ✨ Features

## 🔐 Authentication & Security

* User Registration
* Secure Login & Logout
* JWT Authentication
* Refresh Token Authentication
* Role-Based Authorization (USER / ADMIN)
* Password Reset
* Email Verification
* Protected Routes
* Secure Password Encryption
* Session Management

---

## 👤 User Features

* Profile Management
* Update Personal Information
* Change Password
* View Wallet Details
* Transaction History
* Account Security Settings

---

## 💰 Wallet Features

* Automatic Wallet Creation
* Balance Tracking
* Deposit Money
* Withdraw Money
* Transfer Funds
* Real-Time Balance Updates

---

## 💸 Transaction Management

* Deposit Transactions
* Withdrawal Transactions
* Peer-to-Peer Transfers
* Transaction History
* Transaction Validation
* Audit Logging

---

## 📊 Dashboard Analytics

* Current Wallet Balance
* Recent Transactions
* Activity Statistics
* Transaction Trends
* Financial Overview

---

## 🛠 Admin Features

* User Management
* Block / Unblock Users
* Transaction Monitoring
* Dashboard Analytics
* Wallet Monitoring
* System Statistics

---

# 🏗 Architecture

```text
Frontend (React + TypeScript)
          │
          ▼
 REST APIs (Axios)
          │
          ▼
Spring Boot Backend
          │
          ▼
Spring Security + JWT
          │
          ▼
 PostgreSQL Database
```

---

# 🚀 Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion
* React Router
* Axios
* React Query
* Zustand

---

## Backend

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* Hibernate
* JWT Authentication
* Maven

---

## Database

* PostgreSQL

---

## DevOps

* Docker
* Docker Compose

---

# 📂 Project Structure

```text
digital-wallet
│
├── backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   ├── dto
│   ├── exception
│   ├── security
│   └── config
│
├── frontend
│   ├── src
│   ├── assets
│   ├── pages
│   ├── components
│   ├── hooks
│   ├── store
│   ├── services
│   └── layouts
│
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

# ⚙️ Installation Guide

## Clone Repository

```bash
git clone <repository-url>
cd digital-wallet
```

---

# Backend Setup

## Create PostgreSQL Database

```sql
CREATE DATABASE digital_wallet;
```

---

## Configure Environment Variables

```env
DB_USERNAME=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secure_jwt_secret

SPRING_PROFILES_ACTIVE=dev
```

---

## Run Backend

```bash
./mvnw spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

Swagger Documentation:

```text
http://localhost:8080/swagger-ui/index.html
```

Health Check:

```text
http://localhost:8080/actuator/health
```

---

# Frontend Setup

Navigate to frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

# 🐳 Docker Setup

Build and start all services:

```bash
docker compose up --build
```

Services:

| Service    | Port |
| ---------- | ---- |
| Frontend   | 5173 |
| Backend    | 8080 |
| PostgreSQL | 5432 |

---

# 📚 API Endpoints

## Authentication

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh-token
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/verify-email
```

---

## User

```http
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
PUT    /api/v1/users/change-password
```

---

## Wallet

```http
GET    /api/v1/wallet
GET    /api/v1/wallet/balance
POST   /api/v1/wallet/deposit
POST   /api/v1/wallet/withdraw
```

---

## Transactions

```http
POST   /api/v1/transactions/transfer
GET    /api/v1/transactions/history
```

---

## Admin

```http
GET    /api/v1/admin/dashboard
GET    /api/v1/admin/users
GET    /api/v1/admin/transactions
```

---

# 🔒 Security Features

* JWT Authentication
* Refresh Tokens
* Password Hashing
* Role-Based Access Control
* Input Validation
* Audit Logging
* Secure API Access
* CORS Configuration
* Rate Limiting
* Account Protection

---

# 📱 Responsive Design

Fully optimized for:

* Desktop
* Laptop
* Tablet
* Mobile Devices

Supports:

* Dark Mode
* Light Mode
* Smooth Animations
* Accessibility Best Practices

---

# 🧪 Testing

Run Backend Tests:

```bash
mvn test
```

Run Frontend Tests:

```bash
npm test
```

---

# 🌐 Live Demo

### Application

https://digital-wallet-one-inky.vercel.app/

### Portfolio

https://my-portfolio-opal-five-33.vercel.app/

---

# 👨‍💻 Developer

## Shivam Paliwal

Software Developer | Full Stack Developer

🔗 LinkedIn
https://www.linkedin.com/in/shivam884/

🌐 Portfolio
https://my-portfolio-opal-five-33.vercel.app/

💡 Passionate about building scalable web applications, secure backend systems, and modern user experiences using Java, Spring Boot, React, TypeScript, and cloud technologies.

---

# 📄 Copyright

Copyright © 2026 Shivam Paliwal.

All Rights Reserved.

This project and its source code are the intellectual property of Shivam Paliwal.

No part of this project may be copied, modified, distributed, reproduced, or used for commercial purposes without prior written permission from the author.

This project is provided solely for portfolio, educational, and demonstration purposes.

---

# ⭐ Support

If you found this project useful, consider giving it a star ⭐ on GitHub and connecting with me on LinkedIn.

Built with ❤️ by Shivam Paliwal.
