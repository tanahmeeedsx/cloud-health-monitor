# Cloud Health Monitor

A real-time system health monitoring dashboard built with Node.js and Express, containerized with Docker, and deployed on AWS ECS Fargate with a full CI/CD pipeline via GitHub Actions.

## Overview

Cloud Health Monitor tracks live system metrics and lets you check the uptime of any URL — all from a clean, auto-refreshing dashboard.

## Features

- **Live System Metrics** — Real-time CPU, Memory, and Disk usage with an overall health status banner
- **URL Uptime Checker** — Instantly check if any endpoint is up, with response time and status code
- **Auto-Refreshing Dashboard** — Polls the API every 5 seconds for up-to-date metrics
- **REST API** — Simple JSON endpoints for health, system status, and URL checks

## API Endpoints

| Method | Endpoint         | Description                                  |
|--------|------------------|-----------------------------------------------|
| GET    | `/health`        | Basic health check — returns service status  |
| GET    | `/system-status` | Returns live CPU, memory, and disk metrics    |
| POST   | `/check-url`     | Checks if a given URL is reachable            |

**Example — Check a URL:**
```bash
curl -X POST http://localhost:8000/check-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Containerization:** Docker
- **CI/CD:** GitHub Actions (lint, test, Prettier checks, email notifications on pass/fail)
- **Deployment:** AWS ECS (Fargate), Amazon ECR
- **Testing:** Jest

## Getting Started

### Prerequisites
- Node.js 22+
- Docker (optional, for containerized runs)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/tanahmeeedsx/cloud-health-monitor.git
cd cloud-health-monitor

# Install dependencies
npm install

# Start the server
npm start
```

The dashboard will be available at `http://localhost:8000`.

### Running with Docker

```bash
# Build the image
docker build -t cloud-health-monitor .

# Run the container
docker run -p 8000:8000 cloud-health-monitor
```

## Testing

```bash
npm test
```

## Deployment

This project is deployed on **AWS ECS Fargate**, with images stored in **Amazon ECR**. The GitHub Actions workflow runs linting, tests, and code style checks on every push, with email notifications on pipeline pass/fail.

**Deployment steps:**
```bash
# Build the Docker image
docker build -t cloud-health-monitor .

# Authenticate with ECR
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

# Tag and push the image
docker tag cloud-health-monitor:latest <account-id>.dkr.ecr.<region>.amazonaws.com/cloud-health-monitor:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/cloud-health-monitor:latest

# Force a new ECS deployment
aws ecs update-service --cluster <cluster-name> --service <service-name> --force-new-deployment --region <region>
```

## Project Structure

```
cloud-health-monitor/
├── .github/workflows/   # CI/CD pipeline configuration
├── scripts/             # Utility scripts
├── src/                 # Application source code
│   ├── public/          # Dashboard frontend (HTML/CSS/JS)
│   ├── server.js        # Express app and routes
│   └── index.js         # Entry point
├── tests/               # Jest test suite
├── Dockerfile           # Container image definition
└── package.json
```

## Author

**Tanjim Ahmed**
[GitHub](https://github.com/tanahmeeedsx) · [LinkedIn](https://linkedin.com/in/tanahmedd)
