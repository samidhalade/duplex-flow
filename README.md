# DuplexFlow AI 🚀

_Real-Time Full-Duplex Voice Agent & FDB-v3 Benchmark Suite_

[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![Gemini Realtime](https://img.shields.io/badge/Gemini-2.5%20Flash-green.svg)](https://ai.google.dev/)
[![Status](https://img.shields.io/badge/status-submission%20ready-success.svg)]()

---

## 📌 Project Overview

**DuplexFlow AI** is a state-of-the-art, full-stack conversational AI platform engineered for real-time, bi-directional voice interactions. Developed for the **Samsung PRISM Gen AI** program, DuplexFlow eliminates the latency and rigidity of traditional half-duplex voice bots. It combines ultra-low latency **WebRTC streaming via LiveKit** with the **Google Gemini Realtime API**, enabling fluid, natural interruptions, multi-step tool execution, and live evaluation telemetry mapped against the **FDB-v3 benchmark suite**.

---

## 📦 Submission Deliverables & Assets

- **🖥️ Source Code Repository:** [GitHub Main Branch](https://github.com/samidhalade/duplex-flow)
- **🎥 5-Minute Video Demo:** [Watch Demo on YouTube / Google Drive](https://drive.google.com/file/d/183DY6P6KhiZT1Pzk6ta6nueyhlT-r5f5/view?usp=sharing)
- **📊 Presentation Slides:** [View PDF Presentation](./docs/DuplexFlow_AI_Presentation.pdf)
- **📝 AI Usage Disclosure Form:** [View Disclosure Document](./docs/AI_Disclosure_Form.docx)

---

## 🏗️ System Architecture & Tech Stack

```text
duplex-flow-ai/
├── duplex-flow-backend/          # Python FastAPI & LiveKit Agent worker
│   ├── app/
│   │   ├── ai/                   # LiveKit worker & Gemini Realtime tool definitions
│   │   ├── api/                  # REST routers (/api/token, /api/benchmark)
│   │   └── core/                 # App configurations & settings
│   ├── requirements.txt
│   └── .env                      # Environment credentials
├── duplex-flow-frontend/         # Next.js 14 WebRTC Studio & Analytics Dashboard
│   ├── app/                      # Live Studio & Benchmark pages
│   └── package.json
└── docs/                         # Submission assets (Presentation & AI Disclosure)

Backend & Agent Worker: Python, FastAPI, LiveKit Agents SDK, Google GenAI SDK (gemini-2.5-flash), Subprocess Worker Lifespan Management.

Frontend Studio: Next.js, React, Tailwind CSS, LiveKit WebRTC Client, Recharts, Lucide Icons.

Real-Time Communication: Bidirectional audio streaming over WebRTC via LiveKit Cloud.

Evaluation Framework: FDB-v3 (Full-Duplex Benchmark) tracking reasoning latency, tool invocation accuracy, disfluency handling, and state rollbacks.

🛠️ Multi-Domain Tool Registry
The AI agent is equipped with a versatile multi-step tool execution architecture spanning four core enterprise domains:

Travel & Identity: search_flights, book_flight, update_identity_doc

Finance & Billing: get_card_benefits, get_exchange_rate, modify_autopay

Housing & Location: search_apartments, calculate_commute, update_search_filter

E-Commerce & Support: track_order, search_products, add_to_cart

🚀 Reproducible Setup & Execution Guide
Prerequisites
Python 3.10 or higher

Node.js 18+ and npm

Active LiveKit Cloud and Google Gemini API keys

1. Backend Setup (duplex-flow-backend)
Bash
# Navigate to backend directory
cd duplex-flow-backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # On Windows (use source venv/bin/activate on macOS/Linux)

# Install dependencies
pip install -r requirements.txt

# Create a .env file with your credentials:
# LIVEKIT_URL=wss://your-livekit-url
# LIVEKIT_API_KEY=your_api_key
# LIVEKIT_API_SECRET=your_api_secret
# GOOGLE_API_KEY=your_gemini_api_key
# FRONTEND_URL=http://localhost:3000

# Run the FastAPI backend server (automatically spawns the LiveKit agent worker via lifespan)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
2. Frontend Setup (duplex-flow-frontend)
Bash
# Open a new terminal and navigate to frontend directory
cd duplex-flow-frontend

# Install frontend dependencies
npm install

# Run the development server
npm run dev
Open http://localhost:3000 in your browser to access the Live Studio and Benchmark Telemetry Dashboard.

📡 Core API Reference
GET /api/token — Generates secure LiveKit WebRTC access tokens for active voice room sessions.

GET /api/live-logs?room=<room_id> — Streams real-time tool execution logs and transcripts for the Live Tool Inspector (IPC).

GET /api/benchmark — Serves aggregate FDB-v3 evaluation pass rates, scenario metrics, and domain performance breakdowns.
```
