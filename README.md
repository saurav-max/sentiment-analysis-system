
# Sentiment Analysis System

A full-stack sentiment analysis system built with three independent services that work together in real time.

---

## Architecture Overview
# Sentiment Analysis System

A full-stack sentiment analysis system built with three independent services that work together in real time.

---

## Architecture Overview
```
React Frontend  →  Spring Boot Backend  →  ML Pipeline (Python)
                        ↕                        ↕
                      Kafka                    Redis
```

---

## Services

### 1. `frontend/` — React
- User interface for submitting text and viewing sentiment results
- Communicates with the Spring Boot backend via REST API

### 2. `backend/` — Spring Boot (Java)
- REST API that receives text from the frontend
- Publishes messages to Kafka for async processing
- Caches results in Redis to avoid redundant ML calls
- Fetches sentiment results and returns them to the frontend

### 3. `ml-pipeline/` — Python
- Consumes messages from Kafka
- Runs sentiment analysis on the text (positive / negative / neutral)
- Stores results back in Redis

---

## Tech Stack

| Layer       | Technology              |
|-------------|-------------------------|
| Frontend    | React                   |
| Backend     | Spring Boot (Java)      |
| ML Service  | Python (FastAPI/Flask)  |
| Message Bus | Apache Kafka            |
| Cache       | Redis                   |

---

## Prerequisites

Before running this project, make sure the following are installed on your system:

- Java 17+
- Node.js 18+
- Python 3.9+
- **Apache Kafka** (installed and running locally on default port `9092`)
- **Redis** (installed and running locally on default port `6379`)

### Start Kafka (if not running)
```bash
# Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka broker
bin/kafka-server-start.sh config/server.properties
```

### Start Redis (if not running)
```bash
redis-server
```

---

## Running the Project

### ML Pipeline
```bash
cd ml-pipeline
pip install -r requirements.txt
python app.py
```

### Backend
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## Environment Variables

Each service uses environment variables. Copy `.env.example` to `.env` in the respective folders and fill in your values.

Key variables:
- `KAFKA_BOOTSTRAP_SERVERS` — default `localhost:9092`
- `REDIS_HOST` — default `localhost`
- `REDIS_PORT` — default `6379`
- `ML_SERVICE_URL` — URL where the Python service runs

---

## Project Structure
```
sentiment-analysis-system/
├── frontend/        # React app
├── backend/         # Spring Boot API
├── ml-pipeline/     # Python ML service
└── README.md
```

---

## Author

[saurav-max](https://github.com/saurav-max)
