# Banking Microservices System

A production-ready distributed banking system built with **NestJS**, **PostgreSQL**, **RabbitMQ**, and **Redis**.

## Architecture Overview

The system is architected as a **monorepo** consisting of four core microservices and a shared library:

-   **Auth Service (`apps/auth-service`)**: Manages user registration and authentication.
-   **Account Service (`apps/account-service`)**: Handles virtual account generation, tiered limits, and balance management.
-   **Transfer Service (`apps/transfer-service`)**: Executes idempotent fund transfers between accounts with atomic transaction support.
-   **Notification Service (`apps/notification-service`)**: Enterprise-grade notification system using GraphQL Subscriptions and Redis for horizontal scaling.
-   **Common Library (`libs/common`)**: Shared modules for RabbitMQ integration, global constants (Tiers), and utilities.

## Core Features

### 1. User Registration & KYC
-   Secure user registration with **bcrypt** password hashing.
-   **Identity Verification**: Integrated mock KYC verification (NIN, BVN, ID_CARD) required during registration.
-   Event-driven communication: Emits `user_created` event upon successful verification and registration.

### 2. Automatic & Tiered Virtual Accounts
-   **Automated Provisioning**: Listens for `user_created` to automatically generate a default Tier 1 account.
-   **Tier System**:
    -   **TIER_1**: Single transaction limit: 50,000 | Max balance: 300,000.
    -   **TIER_2**: Single transaction limit: 200,000 | Max balance: 1,000,000.
    -   **TIER_3**: Unlimited.
-   **Upgrade Flow**: API support for manually upgrading account tiers.

### 3. Secure Fund Transfers
-   **Idempotency**: Prevents duplicate transfers using unique request references.
-   **Atomic Operations**: Uses database transactions to ensure data consistency during balance updates.
-   **Pessimistic Locking**: Prevents race conditions during concurrent transfer requests.
-   **Validation**: Enforces sender transaction limits and receiver balance ceilings based on tiers.

### 4. Real-Time Notifications
-   **GraphQL Subscriptions**: Provides real-time updates to users via WebSockets.
-   **Scalability**: Uses a **Redis IO Adapter** to synchronize WebSocket events across multiple server instances.
-   **Multi-Party Alerts**: Automatically notifies both sender and receiver during transactions.

## Technical Stack
-   **Framework**: NestJS (Monorepo)
-   **Database**: PostgreSQL (TypeORM)
-   **Communication**: RabbitMQ (amqplib) & WebSockets (Socket.io)
-   **Real-time Scaling**: Redis (Redis Adapter)
-   **API Layer**: REST & GraphQL
-   **Security**: Bcrypt for password hashing

## Project Setup

### 1. Prerequisites
-   Node.js & NPM
-   PostgreSQL
-   RabbitMQ
-   Redis

### 2. Installation
```bash
git clone <repository-url>
cd banking-system
npm install
```

### 3. Environment Configuration
Copy the example environment file and update the values as needed:
```bash
cp .env.example .env
```

### 4. Database Setup
Create the required databases in PostgreSQL:
```sql
CREATE DATABASE banking_auth;
CREATE DATABASE banking_account;
CREATE DATABASE banking_notification;
```

### 5. Running the Services
Start each microservice from the root directory:
```bash
# Start Auth Service (Port 3002)
npm run start:dev auth-service

# Start Account Service (Port 3000)
npm run start:dev account-service

# Start Transfer Service (Port 3001)
npm run start:dev transfer-service

# Start Notification Service (Port 3003)
npm run start:dev notification-service
```

## API & Subscription Endpoints

| Service | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Register with KYC (NIN/BVN) |
| **Account** | `GET` | `/accounts/:id` | Fetch account details |
| **Account** | `POST` | `/accounts/:id/tier` | Upgrade account tier |
| **Transfer** | `POST` | `/transfers` | Initiate fund transfer |
| **Notification** | `QUERY` | `/graphql (getNotifications)` | Fetch notification history |
| **Notification** | `SUB` | `/graphql (notificationAdded)` | Real-time notification subscription |

---
*Built as part of the Road to Senior Engineer roadmap.*
