# IntelectGame V2

Real-time quiz application built with Vue.js and Node.js, featuring a microservices architecture with API Gateway, reverse proxy, and comprehensive monitoring.

## 🎮 Description

IntelectGame is a real-time quiz platform where:
- **Administrators** can add, modify, and delete questions
- **Players** can register and answer questions
- Multiple players can answer simultaneously
- Administrators can view real-time leaderboards
- Scores are updated in real-time via WebSocket
- Full monitoring and observability with Grafana and Prometheus

## 🌐 Production Server

**Domain**: `vika-game.ru`  
**Server IP**: `82.202.141.248`

### Quick Access Links

- **User Frontend**: https://vika-game.ru
- **Admin Frontend**: https://admin.vika-game.ru or https://vika-game.ru/vika-admin
- **Traefik Dashboard**: https://vika-game.ru/dashboard/
- **Grafana**: https://vika-game.ru/login or https://vika-game.ru/api-gateway-monitoring
- **Prometheus**: http://82.202.141.248:9090 (direct access)

### Test Routes

You can test the following endpoints on the production server:

- **User Login**: https://vika-game.ru/vika-game/api/auth/login
- **User Registration**: https://vika-game.ru/vika-game/api/auth/register
- **Admin Login**: https://vika-game.ru/vika-game/api/auth/admin/login
- **Player Registration**: https://vika-game.ru/vika-game/player/register
- **Quiz List**: https://vika-game.ru/vika-game/api/quiz
- **Game Verification**: https://vika-game.ru/vika-game/api/game/:code/verify

## 🏗️ Architecture

The application uses a microservices architecture with an API Gateway and reverse proxy:

```
┌─────────────────────────────────────────────────────────────┐
│                    Traefik (Reverse Proxy)                   │
│                    Port 80 (HTTP)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
   │ Frontend│    │ Admin   │   │  API    │
   │  (Vue)  │    │ Frontend│   │ Gateway │
   └─────────┘    └─────────┘   └────┬────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────┐
        │                             │                         │
   ┌────▼────┐                  ┌────▼────┐              ┌────▼────┐
   │  Auth   │                  │  Quiz   │              │  Game   │
   │ Service │                  │ Service │              │ Service │
   │  :3001  │                  │  :3002  │              │  :3003  │
   └────┬────┘                  └────┬────┘              └────┬────┘
        │                             │                         │
        └─────────────────────────────┼─────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
              ┌─────▼─────┐     ┌─────▼─────┐    ┌─────▼─────┐
              │  MongoDB  │     │   Redis   │    │   MinIO   │
              │  :27017   │     │   :6379   │    │   :9000   │
              └───────────┘     └───────────┘    └───────────┘
```

### Services Backend (Node.js)

1. **api-gateway** (Port 3000)
   - Single entry point for all API requests
   - Routes requests to appropriate microservices
   - Collects metrics for monitoring
   - Production route: `/vika-game/api/*`

2. **auth-service** (Port 3001)
   - User and admin authentication
   - User registration and management
   - JWT token generation
   - Storage: MongoDB + JSON (fallback)

3. **quiz-service** (Port 3002)
   - Quiz and question management (CRUD)
   - Question validation
   - Storage: MongoDB + JSON (fallback)

4. **game-service** (Port 3003)
   - Game session management
   - Answer processing and scoring
   - Real-time updates via WebSocket (Socket.IO)
   - Leaderboard calculations
   - Storage: MongoDB + JSON (fallback)

5. **telegram-bot** (Port 3004)
   - Optional Telegram bot integration
   - Storage: MongoDB

### Frontend (Vue.js)

1. **frontend** (Port 5173 - Dev, `/vika-game` - Production)
   - User interface for players
   - Game participation
   - Real-time WebSocket connection
   - Production: https://vika-game.ru

2. **admin-frontend** (Port 5174 - Dev, `/vika-admin` - Production)
   - Administrator interface
   - Quiz and question management
   - Game session control
   - Production: https://admin.vika-game.ru or https://vika-game.ru/vika-admin

### Infrastructure Services

1. **traefik** (Ports 80, 8080)
   - Reverse proxy and load balancer
   - Automatic service discovery via Docker labels
   - Dashboard: https://vika-game.ru/dashboard/
   - Routes all HTTP traffic

2. **mongodb** (Port 27017)
   - Primary database for all services
   - Stores users, quizzes, games, and sessions

3. **redis** (Port 6379)
   - Caching layer
   - Session management
   - Real-time data storage

4. **minio** (Ports 9000, 9001)
   - S3-compatible object storage
   - File and image storage
   - Console: http://82.202.141.248:9001 (direct access)

### Monitoring Stack

1. **prometheus** (Port 9090)
   - Metrics collection and storage
   - Scrapes metrics from services
   - Access: http://82.202.141.248:9090

2. **grafana** (Port 3005)
   - Metrics visualization and dashboards
   - API Gateway monitoring dashboard
   - Container monitoring dashboard
   - Access: https://vika-game.ru/login or https://vika-game.ru/api-gateway-monitoring
   - Dashboards:
     - API Gateway: https://vika-game.ru/api-gateway-monitoring
     - Containers: https://vika-game.ru/container-monitoring

3. **cadvisor** (Port 8081)
   - Docker container metrics
   - Exposes Prometheus metrics format
   - Access: http://82.202.141.248:8081/metrics

4. **node-exporter** (Port 9100)
   - System metrics (CPU, memory, disk, network)
   - Exposes Prometheus metrics format
   - Access: http://82.202.141.248:9100/metrics

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (optional, JSON used by default)
- Docker and Docker Compose (for deployment)

### Installation

1. Clone the repository

2. Install dependencies:

```bash
# Backend services
cd node/api-gateway && npm install
cd ../auth-service && npm install
cd ../quiz-service && npm install
cd ../game-service && npm install

# Frontend
cd ../../vue/front && npm install
cd ../admin && npm install
```

### Local Development

#### Start Backend Services

```bash
# Terminal 1 - API Gateway
cd node/api-gateway
npm start

# Terminal 2 - Auth Service
cd node/auth-service
npm start

# Terminal 3 - Quiz Service
cd node/quiz-service
npm start

# Terminal 4 - Game Service
cd node/game-service
npm start
```

#### Start Frontend

```bash
# Terminal 5 - User Frontend
cd vue/front
npm run dev

# Terminal 6 - Admin Frontend
cd vue/admin
npm run dev
```

The applications will be accessible on:
- User Frontend: http://localhost:5173
- Admin Frontend: http://localhost:5174

### Deployment with Docker Compose

**Option 1: Use the script (recommended)**
```bash
./docker-compose.up.sh
```

**Option 2: Disable BuildKit manually**
```bash
DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 docker compose up -d --build
```

**Option 3: Classic build (if BuildKit causes issues)**
```bash
docker compose build --no-cache
docker compose up -d
```

Services will be accessible on:
- Frontend: http://localhost/vika-game (via Traefik)
- Admin Frontend: http://localhost/vika-admin (via Traefik)
- API Gateway: http://localhost/vika-game/api
- Traefik Dashboard: http://localhost/dashboard/
- Grafana: http://localhost:3005
- Prometheus: http://localhost:9090

### Kubernetes Deployment (Minikube)

See the [k8s/README.md](./k8s/README.md) file for detailed instructions.

#### Quick Deployment

```bash
# Make the script executable
chmod +x k8s/build-and-deploy.sh

# Run the script
./k8s/build-and-deploy.sh
```

## 📁 Project Structure

```
gameV2/
├── node/                    # Backend Services (Node.js)
│   ├── api-gateway/        # API Gateway (Express)
│   ├── auth-service/       # Authentication service
│   ├── quiz-service/       # Quiz management service
│   ├── game-service/       # Game service with WebSocket
│   └── telegram-bot/       # Telegram bot (optional)
├── vue/                     # Frontends (Vue.js)
│   ├── front/              # User interface
│   └── admin/              # Administrator interface
├── monitoring/              # Monitoring configuration
│   ├── prometheus/         # Prometheus configuration
│   └── grafana/            # Grafana dashboards and provisioning
├── k8s/                     # Kubernetes files
│   ├── mongodb-deployment.yaml
│   ├── auth-service-deployment.yaml
│   ├── quiz-service-deployment.yaml
│   ├── game-service-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── configmap.yaml
│   ├── all-services.yaml
│   └── README.md
├── docker-compose.yml       # Docker Compose orchestration
└── README.md
```

## 🔐 Default Credentials

### Frontend User

**URL**: https://vika-game.ru

| Type | Email | Password | Description |
|------|-------|----------|-------------|
| User | `user@vika-game.com` | `user123` | Standard user account |
| Admin | `admin@vika-game.com` | `admin` | Administrator account |

### Frontend Admin

**URL**: https://admin.vika-game.ru or https://vika-game.ru/vika-admin

| Type | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | `admin@vika-game.com` | `admin` | Administrator login |

### Grafana

**URL**: https://vika-game.ru/login or https://vika-game.ru/api-gateway-monitoring

| Username | Password | Description |
|----------|----------|-------------|
| `admin` | `admin` | Grafana administrator account |

### Traefik Dashboard

**URLs**:
- https://vika-game.ru/dashboard/ (recommended)
- https://vika-game.ru/traefik-dashboard (alternative)
- http://82.202.141.248:8080/dashboard/ (direct port, may be blocked by firewall)

No authentication required.

### MinIO

**URL**: http://82.202.141.248:9000 (API) or http://82.202.141.248:9001 (Console)

| Access Key | Secret Key | Description |
|------------|------------|-------------|
| `minioadmin` | `minioadmin` | Default credentials |

## 📡 API Endpoints

All API requests go through the API Gateway with the prefix `/vika-game/api`.

### API Gateway

**Base URL**: 
- Local: `http://localhost:3000`
- Production: `https://vika-game.ru/vika-game/api`

All endpoints below are accessible via the API Gateway.

### Auth Service

**Base URL**: 
- Local: `http://localhost:3001`
- Production: `https://vika-game.ru/vika-game/api/auth`

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/auth/register` | POST | User registration | No |
| `/auth/login` | POST | User login | No |
| `/auth/admin/login` | POST | Administrator login | No |
| `/auth/me` | GET | Current user information | Yes |
| `/auth/users` | GET | List all users (admin) | Admin |
| `/auth/users/:id` | GET | User details | Admin |

**Example Request**:
```bash
curl -X POST https://vika-game.ru/vika-game/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@vika-game.com",
    "password": "user123"
  }'
```

### Quiz Service

**Base URL**: 
- Local: `http://localhost:3002`
- Production: `https://vika-game.ru/vika-game/api/quiz`

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/quiz` | GET | List all quizzes | No |
| `/quiz` | POST | Create a quiz | Admin |
| `/quiz/:id` | GET | Get quiz details | No |
| `/quiz/:id` | PUT | Update a quiz | Admin |
| `/quiz/:id` | DELETE | Delete a quiz | Admin |
| `/quiz/:id/questions` | GET | Get quiz questions | No |
| `/quiz/:id/questions` | POST | Add a question | Admin |

**Example Request**:
```bash
curl https://vika-game.ru/vika-game/api/quiz
```

### Game Service

**Base URL**: 
- Local: `http://localhost:3003`
- Production: `https://vika-game.ru/vika-game/api/game`

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/game/create` | POST | Create a game session | Admin |
| `/game/:code` | GET | Get game details | No |
| `/game/:code/verify` | GET | Verify game code | No |
| `/game/:code/players` | GET | List connected players | Yes |
| `/game/:code/start` | POST | Start a game | Admin |
| `/game/:code/next` | POST | Move to next question | Admin |
| `/game/:code/answer` | POST | Submit an answer | Yes |
| `/game/:code/scores` | GET | Get leaderboard | No |

**Example Request**:
```bash
curl https://vika-game.ru/vika-game/api/game/ABC123/verify
```

### WebSocket (Socket.IO)

**Connection URL**:
- Local: `http://localhost:3003`
- Production: `https://vika-game.ru/socket.io`

#### Client → Server Events

| Event | Data | Description |
|-------|------|-------------|
| `register` | `{ gameCode, playerId, playerName }` | Register player in a game |
| `answer` | `{ questionId, answer, gameCode }` | Submit an answer |
| `disconnect` | - | Player disconnection |

#### Server → Client Events

| Event | Data | Description |
|-------|------|-------------|
| `game:started` | `{ gameCode, question }` | Game started, first question |
| `game:question` | `{ question, timeLimit }` | New question |
| `game:answer:received` | `{ playerId, answer }` | Answer received confirmation |
| `game:scores` | `{ scores: [{ playerId, score }] }` | Updated leaderboard |
| `game:ended` | `{ finalScores }` | Game ended |
| `error` | `{ message }` | Error message |

**Example Usage**:
```javascript
import io from 'socket.io-client';

const socket = io('https://vika-game.ru', {
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

// Register
socket.emit('register', {
  gameCode: 'ABC123',
  playerId: 'player123',
  playerName: 'John Doe'
});

// Listen for events
socket.on('game:question', (data) => {
  console.log('New question:', data.question);
});

// Submit answer
socket.emit('answer', {
  questionId: 'q1',
  answer: 'Answer A',
  gameCode: 'ABC123'
});
```

## 📊 Monitoring

### Grafana Dashboards

**Access**: https://vika-game.ru/login or https://vika-game.ru/api-gateway-monitoring

**Credentials**: `admin` / `admin`

#### Available Dashboards

1. **API Gateway Monitoring**
   - URL: https://vika-game.ru/api-gateway-monitoring
   - HTTP error rates
   - Request latency
   - Requests per service
   - Error logs

2. **Container Monitoring**
   - URL: https://vika-game.ru/container-monitoring
   - CPU usage per container
   - Memory usage per container
   - Network I/O
   - Active containers list

### Prometheus

**Access**: http://82.202.141.248:9090

Prometheus collects metrics from:
- API Gateway (HTTP requests, errors, latency)
- Docker containers (via cAdvisor)
- System metrics (via Node Exporter)
- Application services (if exposed)

### cAdvisor

**Access**: http://82.202.141.248:8081/metrics

Exposes Docker container metrics in Prometheus format.

### Node Exporter

**Access**: http://82.202.141.248:9100/metrics

Exposes system metrics (CPU, memory, disk, network) in Prometheus format.

## 🛠️ Technologies Used

### Backend
- Node.js
- Express.js
- Socket.IO (WebSocket)
- MongoDB / Mongoose
- Redis
- JSON (fallback storage)

### Frontend
- Vue.js 3
- Vue Router
- Axios
- Socket.IO Client
- Vite

### Infrastructure
- Docker
- Docker Compose
- Traefik (Reverse Proxy)
- Kubernetes
- Minikube

### Monitoring
- Prometheus
- Grafana
- cAdvisor
- Node Exporter

### Storage
- MongoDB
- Redis
- MinIO (S3-compatible)

## 📝 Development Notes

- Data is stored in JSON files by default
- MongoDB can be enabled by configuring the `MONGODB_URI` environment variable
- Services communicate via HTTP through the API Gateway
- The game-service uses WebSocket (Socket.IO) for real-time updates
- All public routes are routed through Traefik on port 80
- Monitoring metrics are collected by Prometheus and visualized in Grafana

## 🐛 Troubleshooting

### Services Won't Start
- Check that ports 3000-3004, 5173-5174, 80, 8080, 9090, 3005 are not already in use
- Verify that JSON data files exist in the `data/` folders
- Check Docker container logs: `docker-compose logs [service-name]`

### WebSocket Connection Issues
- Verify that the game-service is running: `docker-compose ps game`
- Check Traefik routes: `curl http://localhost:8080/api/http/routers`
- Verify CORS configuration
- Test WebSocket connection: `curl -I https://vika-game.ru/socket.io/`

### MongoDB Issues
- Verify MongoDB is running: `docker-compose ps mongodb`
- Check MongoDB logs: `docker-compose logs mongodb`
- Verify the `MONGODB_URI` environment variable

### Traefik Routing Issues
- Check Traefik dashboard: https://vika-game.ru/dashboard/
- Verify Docker labels on services
- Check Traefik logs: `docker-compose logs traefik`
- Test routes: `curl -I https://vika-game.ru`

### Monitoring Issues
- Verify Prometheus is scraping: http://82.202.141.248:9090/targets
- Check Grafana data sources configuration
- Verify cAdvisor and Node Exporter are accessible
- Check Grafana logs: `docker-compose logs grafana`

## 🧪 Testing the Application

### 1. Test User Registration
```bash
curl -X POST https://vika-game.ru/vika-game/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'
```

### 2. Test User Login
```bash
curl -X POST https://vika-game.ru/vika-game/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@vika-game.com",
    "password": "user123"
  }'
```

### 3. Test Admin Login
```bash
curl -X POST https://vika-game.ru/vika-game/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vika-game.com",
    "password": "admin"
  }'
```

### 4. Test Quiz List
```bash
curl https://vika-game.ru/vika-game/api/quiz
```

### 5. Test Game Verification
```bash
curl https://vika-game.ru/vika-game/api/game/ABC123/verify
```

## 📄 License

ISC

## 👤 Author

Etienne

---

**Last Updated**: January 2026
**Production Domain**: vika-game.ru  
**Production Server IP**: 82.202.141.248
