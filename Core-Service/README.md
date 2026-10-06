# Quick-Bite Core Service

## Overview

The **Core Service** is the backbone API for the Quick-Bite food ordering and delivery platform, built with **Node.js**, **Express**, and **TypeScript**. It provides comprehensive REST endpoints for managing restaurants, branches, products, users, and authentication, following a clean, layered architecture pattern with Dependency Injection.

## Key Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (RBAC)
- **Restaurant Management**: Create, update, and manage restaurants and their branches
- **Product Catalog**: Manage restaurant products with pricing and availability
- **User Management**: Comprehensive user account management with multiple user roles (Customer, Restaurant Owner, Admin)
- **Customer Addresses**: Manage delivery addresses with geolocation support
- **Health Monitoring**: Service health check endpoints
- **Security**: CORS, Helmet.js, SQL injection prevention, and secure authentication
- **Pagination**: Cursor-based pagination for efficient data retrieval
- **Error Handling**: Centralized error handling with correlation IDs for tracking
- **Idempotency**: Allow clients to safely retry operations without duplicate side-effects

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 16 (with PostGIS extensions) & Knex.js ORM
- **Caching**: Redis
- **Message Broker**: RabbitMQ
- **Email**: Mailjet integration for transactional emails
- **Validation**: class-validator and class-transformer

---

## Getting Started & Execution Guide

Follow these step-by-step instructions to run the service locally or in Docker.

### Prerequisites

Before starting, ensure you have installed:
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) (Required for Docker setup)
- [Node.js v20+](https://nodejs.org/) & `npm` (Only required if running locally without Docker)

---

### Option A: Running with Docker Compose (Zero Host Dependencies)

The Docker setup is **completely self-contained**. It spins up PostgreSQL, Redis, RabbitMQ, runs all database migrations automatically via an internal migration runner container, and starts both the Core API and Background Worker.

#### Step 1: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

#### Step 2: Start All Containers
Run the following command from the `Core-Service` directory:
```bash
docker compose up -d
```
*Docker will automatically:*
1. Start `postgres`, `redis`, and `rabbitmq` containers.
2. Wait for `postgres` healthcheck to pass.
3. Run the `migration-runner` container to apply all database migrations automatically.
4. Launch `core-service` (port `3000`) and `core-worker`.

#### Step 3: Monitor & Verify
```bash
# View real-time logs for all services
docker compose logs -f

# View logs for the core API service specifically
docker compose logs -f core-service
```
Test health check endpoint:
```bash
curl http://localhost:3000/api/health
```

#### Step 4: Stop Containers
```bash
# Stop containers keeping database state
docker compose down

# Stop containers and wipe database volumes (clean reset)
docker compose down -v
```

---

### Option B: Running Locally (Node.js Dev Mode)

If you prefer running the Node.js application directly on your host machine:

#### Step 1: Start Infrastructure Containers Only
```bash
docker compose up -d postgres redis rabbitmq
```

#### Step 2: Install Node Dependencies
```bash
npm install
```

#### Step 3: Configure Environment Variables
Ensure `.env` points to `localhost` for local database/redis connections:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=boot_postgres
DB_NAME=postgres
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

#### Step 4: Run Database Migrations
```bash
npm run migrate
```

#### Step 5: Start Development Server
```bash
# Start API server (Hot reload)
npm run dev

# In a separate terminal, start Background Worker
npm run worker:dev
```

---

### Integration & Unit Testing

To execute unit and integration test suites in an isolated environment:

```bash
# Run tests inside an isolated test container
docker compose -f docker-compose.test.yml run --rm test

# Clean up test containers and volumes
docker compose -f docker-compose.test.yml down -v
```
