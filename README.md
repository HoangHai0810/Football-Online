# ⚽️ Football Online - AI-Powered Manager

**Football Online** is an advanced, full-stack football management simulation game. Build your ultimate dream team, open packs to collect absolute legends, compete in thrilling career mode tournaments, and consult with your own **Agentic AI Manager Assistant** to optimize your tactics.

## 🌟 Key Features

*   **AI Manager Assistant:** A smart, agentic chatbot powered by **LangGraph** and **Google Gemini 2.5 Flash**. Ask for market advice, squad optimization, and tactical insight. The AI knows your real-time coin balance, squad layout, and available cards.
*   **Zero-Delay Squad Optimization:** A high-performance, matrix-scoring backtracking algorithm ensures your squad is automatically arranged into the best possible formation in under 10 milliseconds.
*   **Immersive Pack Openings:** Feel the thrill of opening packs with dynamic animations, "walkout" effects for top-tier players, and authentic country flags (powered by `flagcdn`).
*   **Deep Career Mode:** Progress through leagues, compete against AI clubs, and climb the standings to earn coins and rewards.
*   **Secure Authentication:** Seamless and secure login using Google OAuth2 and JWT tokens.
*   **Interactive UI/UX:** A stunning, modern React frontend featuring glassmorphism, Framer Motion micro-animations, and a responsive design tailored for the ultimate manager experience.

## 🏗 System Architecture

The project is structured as a powerful monorepo containing three main microservices:

1.  **Frontend (`/frontend`)**
    *   React.js with Vite
    *   Framer Motion for fluid animations
    *   Lucide React for iconography
    *   Axios for API communication
    *   Tailwind CSS / Vanilla CSS for styling

2.  **Backend (`/backend`)**
    *   Java Spring Boot 3
    *   Spring Security (OAuth2 + JWT)
    *   Spring Data JPA & Hibernate
    *   MySQL (Production via Render) / H2 (Local Development)
    *   Provides the core game logic, tournament simulation, and data persistence.

3.  **Chatbot Service (`/chatbot`)**
    *   Python 3.9+ with FastAPI
    *   LangChain & LangGraph for agentic workflows
    *   Google Gemini AI integration
    *   In-memory rate limiting to prevent spam and control costs
    *   Provides specialized tools like `get_game_context` and `optimize_my_squad`.

## 🚀 Getting Started (Local Development)

To run the application locally, you will need Node.js, Java 17+, and Python 3.9+.

### 1. Database Setup
By default, the Spring Boot app uses an in-memory H2 database for local development. Data is seeded automatically. 
*Ensure your `application-dev.properties` is active.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on `http://localhost:3000`.

### 3. Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```
The backend will start on `http://localhost:8080`.

### 4. Chatbot Setup
You will need a Gemini API Key (`GEMINI_API_KEY`). Create a `.env` file in the `chatbot` folder.
```bash
cd chatbot
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python src/server.py
```
The chatbot will start on `http://localhost:8000`.

## ☁️ Deployment

This project is configured for seamless deployment on **Render** using the provided `render.yaml` blueprint.

1.  The **Java Backend** is deployed as a Web Service connected to a managed Render PostgreSQL/MySQL database.
2.  The **Python Chatbot** is deployed as a separate Web Service.
3.  The **React Frontend** is deployed as a Static Site.
4. Auto-deployments and CI pipelines are configured via GitHub Actions.