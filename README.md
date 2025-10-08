# Lexi - Frontend
Lexi Frontend is a Next.js + TypeScript application that provides an interactive interface for AI-powered legal document automation, connecting seamlessly with the Lexi Backend (FastAPI)
## System Architecture
![alt text](image-3.png)


.

## Overview

The frontend allows users to:
Upload .docx or .pdf files.
View extracted variables and templates.
Interactively draft new legal documents.
Manage templates and generated drafts.
Export final drafts as .docx or .pdf.

🏗️ System Architecture

🔹 Core Components
Component	Description
Frontend (Next.js)	User interface for template management, AI-assisted drafting, and document uploads.
Backend (FastAPI)	Handles document parsing, template generation, AI interactions, and database operations.
Database (PostgreSQL via Prisma)	Stores templates, variables, and user drafts.
AI Layer (Gemini / Exa.ai)	Provides natural language understanding, variable extraction, and contextual drafting.
🔁 Workflow

Upload Document → Sent to backend → Gemini extracts variables.

Template Created → Saved and rendered as interactive fields.

Drafting Interface → User answers AI-generated questions.

Generate Draft → AI fills template and returns Markdown.

Export / Save → User can export to .pdf or .docx.

✨ Features

🧩 Template Visualization: View and edit variables extracted from uploaded docs.

⚙️ Smart Drafting: Real-time variable substitution and AI-assisted question answering.

🔍 Template Discovery: Search for templates using natural queries.

🪄 Interactive Markdown Rendering: Preview document drafts in real time.

💾 Backend Integration: Seamless communication with FastAPI APIs.

🧠 Gemini + Exa Integration: AI-powered variable extraction and bootstrapping.

🧩 Tech Stack
Layer	Technology
Framework	Next.js (App Router)
Language	TypeScript
UI Library	Tailwind CSS + ShadCN UI
Markdown Rendering	react-markdown + remark-gfm
State Management	React Hooks
Backend API	FastAPI
AI Models	Google Gemini, Exa.ai
⚙️ Setup Instructions
1️⃣ Clone the Repository
git clone https://github.com/yourusername/lexi-frontend.git
cd lexi-frontend

2️⃣ Install Dependencies
npm install
# or
yarn install

3️⃣ Configure Environment Variables

Create a .env.local file in the project root:

NEXT_PUBLIC_BACKEND_URL="http://127.0.0.1:8000"
NEXT_PUBLIC_GEMINI_KEY="your_google_gemini_api_key"
NEXT_PUBLIC_EXA_KEY="your_exa_ai_api_key"


📝 Ensure your backend (FastAPI) is running before starting the frontend.

4️⃣ Run the Development Server
npm run dev
# or
yarn dev


The app will be available at:
👉 http://localhost:3000

🔗 Backend Integration

The frontend interacts with the backend via the following API routes:

Functionality	API Endpoint
Upload Document	/create-template-from-upload/
Save Template	/save-template/
List Templates	/templates/
Prefill Variables	/prefill-variables-from-query/
Generate Questions	/generate-questions-for-missing-variables/
Fill Template	/fill-template/
Export Draft	/export/

Ensure your backend URL in .env.local points to the correct host (local or deployed).