# MoldGuard — Smart Mold Prevention System

## Project Overview
MoldGuard is a full‑stack smart‑environment monitoring system that predicts and prevents mold growth. It combines:
- **IoT edge nodes** (ESP32) collecting temperature, humidity, and light data.
- **Serverless backend** (Firebase Cloud Functions) for telemetry ingestion, alerting and data backups.
- **SaaS frontend** built with React + Vite + Tailwind CSS for real‑time dashboards.
- **Big‑Data analytics** (Hadoop, Python/Pandas) that computes risk scores.

The repository now contains a single deep‑learning workspace:
- `DeepLearningLab/` – Docker‑based lab with training, inference, and utilities.

## Tech Stack
| Layer | Technologies |
|---|---|
| **IoT & Edge** | C++, ESP32, DHT22, LDR |
| **Frontend** | React, Vite, Tailwind CSS, Recharts |
| **Backend** | Firebase (Firestore, Auth, Hosting), Node.js Cloud Functions |
| **Analytics** | Hadoop (HDFS), Python (Pandas) |
| **Deep Learning** | Docker, Python, PyTorch/TensorFlow (as defined in `DeepLearningLab/requirements.txt`) |

## Getting Started
### Prerequisites
- **Node.js** v18+ and npm
- **Docker Desktop** (for the deep‑learning lab)
- A configured **Firebase** project (Firestore, Auth, Hosting)
- (Optional) **Python 3.10+** if you want to run the lab locally without Docker

### 1. Frontend Dashboard
```bash
# From project root
npm install
npm run dev   # http://localhost:5173
```

### 2. Cloud Functions
```bash
cd functions
npm install
# Create .env from .env.example and fill in your credentials
firebase deploy --only functions
```

### 3. Firebase Configuration (Root)
```bash
cp .env.example .env   # then edit with your Firebase project IDs & API keys
```

### 4. Deep‑Learning Lab
```bash
# Build the Docker image
cd DeepLearningLab
docker build -t moldguard-deeplearn .

# Run a container (example: start a Jupyter notebook)
docker run -it --rm -p 8888:8888 moldguard-deeplearn jupyter notebook --ip=0.0.0.0 --no-browser
```
Inside the notebook you can execute the training scripts located in `DeepLearningLab/training/` or run inference with `DeepLearningLab/predict.py`.

#### Running locally without Docker (optional)
```bash
python -m venv venv
source venv/bin/activate   # on Windows: venv\Scripts\activate
pip install -r requirements.txt
python training/train.py   # example command
```

## CI / CD
The repository includes GitHub Actions workflows (`.github/workflows/ci.yml` and `deploy.yml`) that run linting, unit tests, and automatically deploy the frontend and Cloud Functions on pushes to `main`.

## Contributing
1. Fork the repo and create a feature branch.
2. Follow the **Getting Started** steps.
3. Open a Pull Request targeting `experimental` for review before merging to `main`.

## System Architecture Diagrams

Complete visualization of the MoldGuard system covering use cases, data flow, and deployment topology:

### Use Case Diagram

![Use Case Diagram](docs/assets/uml-use-case.png)

Displays all actors (Guest, Authenticated User, External Services) and use cases within the system, including the `<<extend>>` relationship where Forgot Password extends the Login functionality.

### System Activity Diagram

![System Activity Diagram](docs/assets/uml-system-activity.png)

Visualizes data flow and runtime workflow, from edge devices (ESP32) collecting sensor data, through the gateway, Cloud Functions for processing, Firestore for storage, to the frontend dashboard and analytics batch pipeline.

### Deployment Diagram

![Deployment Diagram](docs/assets/uml-deployment.png)

Illustrates the runtime architecture and data flow between components: ESP32 edge devices, Firebase Hosting (frontend), Firebase Authentication, Firestore (database), Cloud Functions (backend), Email Service, and GCP Analytics Cluster.

**For comprehensive documentation**, refer to [docs/uml-diagrams.md](https://docs.google.com/document/d/1gT79mg7mwyrDwVnMwywcxqGdVZqUWkAq/edit?usp=sharing&ouid=105786420846292963880&rtpof=true&sd=true).

---

## License
This project was developed as part of an academic coursework submission and is provided for educational and portfolio demonstration purposes.
