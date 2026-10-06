# Quick-Bite Order Service

## Overview

The **Order Service** handles multi-region order placement, life-cycle state transitions, regional database sharding, automated order archival (`pg_partman`), payment processing (Kashier integration), and real-time delivery agent assignments for the Quick-Bite platform. Built with **Node.js**, **Express**, **TypeScript**, **Socket.io**, and **Knex.js**.

## Key Features

- **Multi-Region Database Sharding**: Regional database shards (e.g., Egypt `eg`, Saudi Arabia `ksa`)
- **Order Archival System**: Automated partitioning and archival to historical database clusters
- **Idempotency & Resilience**: Redis-backed idempotent order placement and atomic state transitions
- **Delivery Agent Assignment**: Redis `SET NX EX` offer/claim pattern for high-concurrency order claiming
- **Message Broker Integration**: RabbitMQ transactional outbox pattern for Core and Analytics service integration
- **Payment Processing**: Kashier webhook processing & payment sessions

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js & Socket.io
- **Database**: PostgreSQL 16 with Knex.js ORM (Multi-tenant sharding)
- **Caching & Locks**: Redis
- **Message Broker**: RabbitMQ

---

## Getting Started & Execution Guide

Follow these step-by-step instructions to run the service locally or in Docker.

### Prerequisites

Before starting, ensure you have installed:
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) (Required for Docker setup)
- [Node.js v20+](https://nodejs.org/) & `npm` (Only required if running locally without Docker)

---

### Option A: Running with Docker Compose (Zero Host Dependencies)

The Docker setup is **completely self-contained**. It spins up PostgreSQL (with multi-region database initialization scripts), Redis, RabbitMQ, executes database migrations automatically across all regional shards via an internal `migration-runner` container, and starts both the Order API and Order Background Worker.

#### Step 1: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

#### Step 2: Start All Containers
Run the following command from the `Order-Service` directory:
```bash
docker compose up -d
```
*Docker will automatically:*
1. Start `postgres`, `redis`, and `rabbitmq` containers.
2. Initialize regional databases (`order_service_eg`, `order_service_ksa`, etc.).
3. Run the `migration-runner` container to execute `scripts/migrate-all.ts` across all regional shards.
4. Launch `order-service` (port `4000`) and `order-worker`.

#### Step 3: Monitor & Verify
```bash
# View real-time logs for all services
docker compose logs -f

# View logs for the order API service specifically
docker compose logs -f order-service
```
Test health check endpoint:
```bash
curl http://localhost:4000/api/health
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
DB_eg_HOST=localhost
DB_ksa_HOST=localhost
ARCHIVE_DB_eg_HOST=localhost
ARCHIVE_DB_ksa_HOST=localhost
REDIS_HOST=localhost
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

#### Step 4: Run Multi-Region Database Migrations
```bash
# Migrate all regional database shards
npm run migrate:all
```

#### Step 5: Start Development Server
```bash
# Start API server (Hot reload)
npm run dev

# In a separate terminal, start Background Worker
npm run worker
```

---

### Integration & Unit Testing

To execute unit and integration test suites against hot and archive database shards:

```bash
# Run test suite inside containers and exit automatically
docker compose -f docker-compose.test.yml run --rm test

# Tear down test containers and volumes
docker compose -f docker-compose.test.yml down -v
```
