# Lexi - Intelligent Document Drafting System

An AI-powered document drafting and analysis platform that streamlines the entire document lifecycle, from template generation to intelligent drafting and document analysis.

## System Architecture

Lexi follows a modern microservices architecture with the following components:

### Core Components

1. **Frontend** (React/Next.js)
   - Modern, responsive web application
   - User interface for document management
   - Real-time chat interface for document interactions
   - Built with React, Next.js, and Tailwind CSS

2. **Orchestration Backend** (Python/FastAPI)
   - Central coordination layer
   - RESTful API endpoints
   - Workflow management and business logic
   - Integration hub for all services

3. **Database** (PostgreSQL & Prisma ORM)
   - Template storage and management
   - Document metadata and versioning
   - User data and preferences
   - Query optimization via Prisma ORM

4. **Document Parser & Embeddings**
   - Multi-format document processing (.docx, .pdf, .txt)
   - Text extraction and normalization
   - Vector embeddings generation for semantic search
   - Document chunking and preprocessing

5. **Worker Flows & Logs**
   - Asynchronous task processing
   - Background job execution
   - Activity logging and monitoring
   - Error tracking and recovery

6. **Gemini API Layer**
   - Variable extraction from documents
   - Template matching and suggestions
   - Q&A generation for document clarification
   - Exa.ai search integration for web content
   - Web bootstrap for template creation
   - No-match fallback handling

## Getting Started

Follow these steps to run the application on your local machine:

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.17 or later) - [Download here](https://nodejs.org/)
- **Python** (3.9 or later) - [Download here](https://www.python.org/)
- **PostgreSQL** - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/lexi.git
cd lexi
```

### Step 2: Database Setup

1. **Install PostgreSQL** (if not already installed)

2. **Create a new database:**

```bash
# Log into PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE lexi_db;

# Exit psql
\q
```

3. **Note your database connection details** - you'll need them for the backend configuration.

### Step 3: Backend Setup

1. **Navigate to the backend directory:**

```bash
cd backend
```

2. **Create a virtual environment:**

```bash
# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

3. **Install Python dependencies:**

```bash
pip install -r requirements.txt
```

4. **Create environment file:**

Create a file named `.env` in the `backend` directory:

```properties
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/lexi_db

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Exa.ai Search (optional)
EXA_API_KEY=your_exa_api_key_here

# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

**How to get API keys:**
- **Gemini API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Exa.ai API Key**: Visit [Exa.ai](https://exa.ai/) (optional)

5. **Initialize the database:**

```bash
# Generate Prisma client
prisma generate

# Push schema to database
prisma db push
```

6. **Start the backend server:**

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see output like:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Keep this terminal window open** - the backend needs to run continuously.

### Step 4: Frontend Setup

1. **Open a new terminal window/tab** and navigate to the frontend directory:

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm install
```

This will download all required Node.js packages. It may take a few minutes.

3. **Create environment file:**

Create a file named `.env.local` in the `frontend` directory:

```properties
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

4. **Start the development server:**

```bash
npm run dev
```

You should see output like:
```
   ▲ Next.js 14.x.x
   - Local:        http://localhost:3000
   - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

5. **Open your browser:**

Navigate to `http://localhost:3000`

You should now see the Lexi application running!

## Verification Checklist

To ensure everything is working correctly:

- [ ] Backend server is running on `http://localhost:8000`
- [ ] Frontend is running on `http://localhost:3000`
- [ ] You can access the API docs at `http://localhost:8000/docs`
- [ ] Database connection is successful (check backend terminal logs)
- [ ] Frontend can communicate with backend (no CORS errors in browser console)

## Common Issues and Solutions

### Backend Issues

**Issue: "ModuleNotFoundError" when starting backend**
```bash
# Solution: Ensure virtual environment is activated and dependencies installed
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

**Issue: "Database connection failed"**
```bash
# Solution: Check PostgreSQL is running
# On macOS:
brew services start postgresql

# On Linux:
sudo systemctl start postgresql

# On Windows: Start PostgreSQL from Services
```

**Issue: "Port 8000 already in use"**
```bash
# Solution: Kill the process using port 8000
# On macOS/Linux:
lsof -ti:8000 | xargs kill -9

# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

### Frontend Issues

**Issue: "npm: command not found"**
```bash
# Solution: Install Node.js from https://nodejs.org/
# Verify installation:
node --version
npm --version
```

**Issue: "Port 3000 already in use"**
```bash
# Solution: Run on a different port
npm run dev -- -p 3001
```

**Issue: "Failed to fetch" or CORS errors**
```bash
# Solution: Ensure backend is running and .env.local has correct URL
# Check: http://localhost:8000/docs should be accessible
```

## Development Workflow

### Making Changes

**Backend changes:**
1. Edit Python files in `backend/`
2. FastAPI will auto-reload (if running with `--reload`)
3. Check terminal for any errors

**Frontend changes:**
1. Edit files in `frontend/src/` or `frontend/app/`
2. Next.js will automatically hot-reload
3. Check browser console for errors

### Stopping the Servers

**To stop backend:**
- Press `CTRL + C` in the backend terminal

**To stop frontend:**
- Press `CTRL + C` in the frontend terminal

### Restarting the Servers

**Backend:**
```bash
cd backend
source venv/bin/activate  # if not already activated
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Project Structure

```
lexi/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Backend environment variables
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── routers/               # API route handlers
│   ├── services/              # Business logic
│   └── utils/                 # Helper functions
│
└── frontend/
    ├── package.json           # Node.js dependencies
    ├── .env.local            # Frontend environment variables
    ├── next.config.js        # Next.js configuration
    ├── app/                  # Next.js app directory
    │   ├── page.tsx         # Home page
    │   ├── layout.tsx       # Root layout
    │   └── [routes]/        # Other pages
    ├── components/          # React components
    ├── lib/                # Utilities and helpers
    └── public/             # Static assets
```

## Next Steps

Now that you have Lexi running:

1. **Explore the UI** - Navigate through the different features
2. **Upload a document** - Try the template generation feature
3. **Create a draft** - Use the intelligent drafting workflow
4. **Check API docs** - Visit `http://localhost:8000/docs` for interactive API documentation
5. **Read the code** - Familiarize yourself with the project structure

## Features

### Template Generation
- Upload documents in multiple formats (.docx, .pdf, .txt)
- AI-powered template extraction
- Automatic variable identification
- Reusable Markdown templates

### Intelligent Drafting Workflow
- Natural language query interface
- Smart template matching
- Guided variable filling through AI-generated questions
- Real-time document preview
- Export to .docx or .pdf

### Template Management
- Browse and search templates
- Version control
- Template categorization
- Duplicate detection

### Document Analysis
- Automated document parsing
- AI-generated summaries
- Entity extraction
- Semantic search capabilities

### Interactive Q&A
- Chat interface for document queries
- Context-aware responses
- Multi-document analysis
- Natural language understanding

## API Endpoints

### Document Upload & Analysis
- `POST /upload-document/` - Upload a document (.pdf, .docx, .txt) for intelligent analysis
- `GET /documents/` - Retrieve all uploaded documents with their details
- `GET /document/{document_id}/status` - Check the processing status of a document
- `GET /document/{document_id}/insights` - Get AI-generated analysis insights for a processed document
- `POST /document/{document_id}/query` - Ask specific questions about a processed document

### Template Management
- `POST /create-template-from-upload/` - Upload a document and convert it into a reusable Markdown template
- `POST /save-template/` - Save a template with YAML front-matter and variables to database
- `GET /templates/` - List all saved templates with their variables

### Document Drafting Workflow
- `POST /find-templates` - Find relevant templates based on user query (with Web Bootstrap fallback)
- `POST /fill-template` - Fill a template with provided variable values to generate draft
- `POST /prefill-variables-from-query` - Use AI to auto-fill variables based on user's initial query
- `POST /generate-questions-for-missing-variables` - Generate human-friendly questions for unfilled required variables

### Document Export
- `POST /export/` - Export document as .docx or .pdf file

## Technology Stack

### Frontend
- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **State Management**: React Context/Hooks
- **HTTP Client**: Axios/Fetch API

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.9+
- **ORM**: Prisma
- **Database**: PostgreSQL
- **AI Integration**: Google Gemini API
- **Document Processing**: python-docx, PyPDF2
- **Embeddings**: Sentence Transformers

### Infrastructure
- **Task Queue**: Celery/Background Tasks
- **Logging**: Python logging module
- **API Documentation**: FastAPI auto-generated (Swagger/OpenAPI)

## Production Deployment

For production deployment, refer to:
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- GitHub Issues: [Project Issues](https://github.com/yourusername/lexi/issues)
- Documentation: [Full Docs](https://docs.lexi.example.com)
- Email: support@lexi.example.com

## Acknowledgments

- Google Gemini API for AI capabilities
- Exa.ai for web search functionality
- FastAPI framework
- Next.js team
- Open source community