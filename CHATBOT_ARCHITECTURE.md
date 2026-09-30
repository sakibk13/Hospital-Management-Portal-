# HealingWave AI Chatbot Architecture

## Overview
HealingWave utilizes an enterprise-grade **LangChain RAG (Retrieval-Augmented Generation)** architecture integrated with **Google Gemini (LLM + Structured Function Calling)**.

This pipeline replaces simple keyword/string matching with deep semantic understanding, real-time documentation retrieval, and live hospital API tool execution.

---

## 1. Architecture Flow Diagram

```
User Query (Frontend Chat UI)
           │
           ▼
Chat API Route (`/api/chatbot/chat`)
[Vercel Serverless Function / ASP.NET Controller]
           │
           ├─────────────────────────────────────────┐
           │ 1. Vector Embedding & Retrieval         │
           ▼                                         │
LangChain RAG Engine                                 │
  - Loads `chatbot_documentation.txt`                │
  - Generates query embedding via `gemini-embedding-001`
  - Performs Cosine Similarity Vector Search         │
  - Retrieves Top-K Relevant Document Chunks         │
           │                                         │
           ├─────────────────────────────────────────┘
           │ 2. Semantic Reasoning & Tool Binding
           ▼
Google Gemini LLM (`gemini-flash-latest`)
  - Formulates intent semantically (e.g. "heart specialist" → Cardiology)
  - Evaluates whether live dynamic data is required
           │
     ┌─────┴─────────────────────────────────┐
     │ Is Live / Dynamic API Data Needed?     │
     └─────┬─────────────────────────────────┘
           │
    [YES]  │                                  [NO] (Static / Guidance Question)
           ▼                                   │
Existing Application API Tool Execution        │
  ├── `get_blood_availability`                 │
  ├── `search_doctors`                         │
  ├── `get_departments`                        │
  ├── `get_patient_details`                    │
  ├── `get_patient_appointments`               │
  ├── `search_medicines`                       │
  ├── `get_patient_prescriptions`              │
  └── `get_health_card`                        │
           │                                   │
           │ Structured Tool Output (JSON)     │
           ▼                                   │
Google Gemini LLM (Response Synthesis)         │
           │                                   │
           ├───────────────────────────────────┘
           │
           ▼
Final Grounded Response (Markdown Links + Safety Filter)
           │
           ▼
User Interface (`Chatbot.js` Component)
```

---

## 2. Step-by-Step Processing Pipeline

### Step 1: User Query & Context Ingestion
- The user inputs a message in the chat widget (`Chatbot.js`).
- The client dispatches a `POST` request to `/api/chatbot/chat` containing the query string and recent conversation history (for multi-turn follow-ups).
- **Security Check:** The Gemini API key is maintained strictly server-side (`process.env.GEMINI_API_KEY`) and is never leaked to the client bundle.

### Step 2: LangChain Documentation Retrieval (RAG)
- The server loads `chatbot_documentation.txt`, which details all existing hospital features and user-intent-to-API mappings.
- The user query is vectorized via `gemini-embedding-001`.
- A cosine similarity ranking extracts the most relevant documentation chunks, providing context to the system prompt without exceeding token limits.

### Step 3: Semantic Intent Classification & Gemini Tool Calling
- Rather than matching fixed keywords (e.g. `query.includes("doctor")`), Gemini interprets natural language semantically.
  - Queries like *"I have chest pain"*, *"cardiology"*, and *"heart specialist"* resolve to the Cardiology specialty.
- When live data is required, Gemini issues a structured tool call with typed parameters:
  - **Blood Availability:** Invokes `get_blood_availability` → queries `GET /api/BloodAvailability`.
  - **Doctor Availability:** Invokes `search_doctors` → queries `GET /api/Doctors/all`.
  - **Agentic Appointment Booking:** Invokes `book_appointment` → directly creates appointments via `POST /api/Appointments`.
  - **Cancel Appointment:** Invokes `cancel_appointment` → cancels appointments via `DELETE /api/Appointments/{id}`.
  - **Appointments Lookup:** Invokes `get_patient_appointments` → queries `GET /api/Appointments/patient/email/{email}`.
  - **Medicines:** Invokes `search_medicines` → queries `GET /api/Medicines`.
  - **Medical Records:** Invokes `get_patient_prescriptions` → queries `GET /api/Prescriptions/patient/email/{email}`.
  - **Health Card:** Invokes `get_health_card` → queries `GET /api/HealthCards/{email}`.

### Step 4: Tool Execution & Response Synthesis
- The server executes the specified tool against the application's internal API endpoints.
- The raw JSON result is fed back into Gemini as a `ToolMessage`.
- Gemini synthesizes the structured data into a concise, user-friendly Markdown message including clickable internal navigation links (e.g., `[Doctors](/doctors)`, `[Blood Bank](/blood-bank)`).

### Step 5: Static Intent Handling
- For general hospital overviews, blood compatibility guidelines, donation rules, or out-of-scope queries, Gemini formulates the answer directly from the retrieved documentation without invoking any backend API tools.

---

## 3. Supported Existing Features & APIs

| Feature | Supported Intent | API / Tool Endpoint |
| :--- | :--- | :--- |
| **Blood Bank** | Check live blood stock by blood group | `GET /api/BloodAvailability` |
| **Doctor Details** | Search specialists, availability, schedule, room | `GET /api/Doctors/all` |
| **Departments** | Retrieve active hospital departments | `GET /api/Appointments/departments` |
| **Patient Details** | Retrieve profile, blood group, emergency contact | `GET /api/Patients/pdetails/email/{email}` |
| **Appointments** | Check scheduled visits by patient email | `GET /api/Appointments/patient/email/{email}` |
| **Medicines** | Check pharmacy inventory, prices, dosage, stock | `GET /api/Medicines` |
| **Medical Records** | Retrieve doctor prescriptions & diagnoses | `GET /api/Prescriptions/patient/email/{email}` |
| **Health Card** | Check patient card balance & reward points | `GET /api/HealthCards/{email}` |
| **Bed & Cabin** | Check available patient cabins and ward beds | `GET /api/cabinBooking/cavailable` |

---

## 4. Vercel & Deployment Compatibility
- **Serverless Execution:** Runs in Next.js Serverless runtime (`runtime: 'nodejs'`) on Vercel.
- **In-Memory Caching:** Embeddings and chunk vectors are loaded in-memory, avoiding local disk writes.
- **Graceful Fallbacks:** If external services or the Gemini API encounter rate limits or network issues, the chatbot provides informative fallback guidance directing users to appropriate hospital portal pages.
