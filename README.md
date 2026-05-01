#  Real-Time Location Tracking System

##  Project Overview

This project is a real-time location tracking system where authenticated users can share their live location and see other users moving on a map.

It demonstrates how modern distributed systems handle **real-time communication**, **event streaming**, and **scalable architecture** using WebSockets and Kafka.

This system simulates real-world applications like ride-sharing or live collaboration platforms.

---

##  Tech Stack

### Frontend
- HTML
- CSS
- JavaScript
- Leaflet.js (Map visualization)

### Backend
- Node.js
- Express.js
- Socket.IO (WebSockets)

### Infrastructure
- Kafka (event streaming)
- Redis (optional: caching / rate limiting)

### Authentication
- JWT-based authentication (OIDC-style simulation)

---

##  Features

-  Real-time location updates
-  Multi-user tracking on map
-  Secure authentication using JWT
-  Kafka-based event streaming
-  WebSocket-based live broadcasting
-  Scalable event-driven architecture
-  Basic rate limiting support (optional with Redis)

---

##  Setup Steps

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd location-tracking-app
```
## 2. Install Dependencies
```
npm install
```
## 3. Start Kafka using Docker
```
docker run -d --name zookeeper -p 2181:2181 confluentinc/cp-zookeeper

docker run -d --name kafka \
  -p 9092:9092 \
  -e KAFKA_ZOOKEEPER_CONNECT=localhost:2181 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  confluentinc/cp-kafka
```
## 4. Create Kafka Topic
```
docker exec -it kafka /opt/kafka/bin/kafka-topics.sh \
  --create \
  --topic location-updates \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1
```
## 5. Configure Environment Variables

Create a .env file:
```
PORT=3000
JWT_SECRET=your_secret_key
KAFKA_BROKER=localhost:9092

# Optional (if using Redis)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```
## 6. Start the Server
```
node server/index.js
```
## Authentication (OIDC-style)

Flow
1. User logs in via frontend
2. Server generates JWT token
3. Token is stored in browser
4. Token is sent during WebSocket connection
## WebSocket Event Flow
```
Client → Socket.IO → Server
       → Authenticate user
       → Receive location:update
       → Send event to Kafka
```
Kafka Event Flow
```
Socket Server → Kafka Producer → Topic (location-updates)
                                ↓
                         Kafka Consumer
                                ↓
                     Broadcast via Socket.IO
                                ↓
                       All connected clients
```
## Assumptions
- Users allow browser location access
- Kafka is running locally or via Docker
- Network latency is minimal
- Single Kafka partition is used for simplicity
## Limitations
- No persistent database (in-memory/event-driven)
- No horizontal scaling setup
- Basic UI 
- Kafka setup is local 
## Screenshots 
<img width="856" height="640" alt="Screenshot 2026-05-01 at 8 22 35 PM" src="https://github.com/user-attachments/assets/7106d8ca-da44-4f8b-8466-31f68f360e97" />
<img width="856" height="640" alt="Screenshot 2026-05-01 at 8 22 27 PM" src="https://github.com/user-attachments/assets/558ad1d5-2480-4296-8a33-4b230a255213" />





