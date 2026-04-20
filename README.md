# ✈️ AI-Powered Real-Time Flight Booking Agent

A full-stack, real-time chat application featuring an AI flight booking assistant. This project demonstrates the integration of **WebSockets** for instant communication and **Google Dialogflow** for Natural Language Processing (NLP).

## 🌟 Key Features
- **Real-Time Interaction**: Zero-latency chat using the WebSocket protocol.
- **Intelligent NLP**: Understands user intent and extracts entities (cities, passengers, class) via Dialogflow.
- **Custom Business Logic**:
  - **Validation**: Server-side interceptor prevents same-city bookings (e.g., London to London).
  - **Session Repair**: Custom "No" loop logic that resets the conversation state on demand.
- **Secure Integration**: Enterprise-grade authentication using Google Service Accounts.

## 🛠️ Technical Architecture
The application is built on a **"Middleman"** architecture:
1. **Frontend**: A responsive HTML/CSS/JS UI that maintains a persistent WebSocket connection.
2. **Backend**: A Node.js server that acts as a secure bridge, managing authentication and session states.
3. **AI Layer**: Dialogflow handles the conversational flow and slot-filling.

## 📦 Required Libraries
To run this project, you need **Node.js** and the following dependencies:

| Library | Purpose |
| :--- | :--- |
| `express` | Web framework to host the server logic. |
| `ws` | High-performance WebSocket library for real-time messaging. |
| `axios` | Promise-based HTTP client for Dialogflow API requests. |
| `google-auth-library` | Official Google library for secure Service Account authentication. |

## ⚙️ Installation & Setup

1. **Initialize Project & Install Dependencies**:
   ```bash
   npm init -y
   npm install express ws axios google-auth-library
2. **Google Cloud Credentials:**
     Download your Service Account Key from the Google Cloud Console.
     Save it as key.json in the project's root directory.
3.  **Project Configuration:**
     Open server.js and ensure the PROJECT_ID variable matches your Dialogflow agent ID.
