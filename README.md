# Banking Microservices System

A production-ready distributed banking system built with **NestJS**, **PostgreSQL**, and **RabbitMQ**.

## Architecture Overview

The system is architected as a **monorepo** consisting of three core microservices and a shared library:

-   **Auth Service (`apps/auth-service`)**: Manages user registration and authentication.
-   **Account Service (`apps/account-service`)**: Handles virtual account generation, tiered limits, and balance management.
-   **Transfer Service (`apps/transfer-service`)**: Executes idempotent fund transfers between accounts with atomic transaction support.
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

## Technical Stack
-   **Framework**: NestJS (Monorepo)
-   **Database**: PostgreSQL (TypeORM)
-   **Message Broker**: RabbitMQ (amqplib)
-   **Security**: Bcrypt for password hashing

## Project Setup

### 1. Prerequisites
-   Node.js & NPM
-   PostgreSQL
-   RabbitMQ

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

### 3. Database Setup
Create the required databases in PostgreSQL:
```sql
CREATE DATABASE banking_auth;
CREATE DATABASE banking_account;
```

### 4. Running the Services
Start each microservice from the root directory:
```bash
# Start Auth Service (Port 3002)
npm run start:dev auth-service

# Start Account Service (Port 3000)
npm run start:dev account-service

# Start Transfer Service (Port 3001)
npm run start:dev transfer-service
```

## API Endpoints

| Service | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Register with KYC (NIN/BVN) |
| **Account** | `GET` | `/accounts/:id` | Fetch account details |
| **Account** | `POST` | `/accounts/:id/tier` | Upgrade account tier |
| **Transfer** | `POST` | `/transfers` | Initiate fund transfer |
| **Transfer** | `GET` | `/transfers/:id` | Check transfer status |

---
*Built as part of the Road to Senior Engineer roadmap.*
