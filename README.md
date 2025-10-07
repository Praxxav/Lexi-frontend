# Lexi - Intelligent Document Drafting Frontend

This is the Next.js/React frontend for **Lexi**, the AI-powered document drafting and analysis platform. It provides the user interface for the entire document lifecycle, from generating templates to drafting new documents and analyzing existing ones.

## Features

This frontend is designed to interact with all of the backend's powerful features:

-   **Template Generation**: Upload a `.docx`, `.pdf`, or `.txt` file to have the AI generate a reusable Markdown template.
-   **Template Management**: A UI to save, browse, and manage all your document templates.
-   **Intelligent Drafting Workflow**:
    -   Start a draft with a natural language query (e.g., "draft a non-disclosure agreement for a new client").
    -   The UI will help find an existing template or bootstrap a new one from the web.
    -   Answer a series of simple, AI-generated questions to fill in the document's variables.
    -   Review and export the final document as a `.docx` or `.pdf`.
-   **Document Analysis Dashboard**: (Future) A central place to view the status of uploaded documents, see AI-generated summaries, and explore extracted entities.
-   **Document Q&A**: (Future) An interactive chat interface to ask specific questions about the content of an analyzed document.

## Getting Started

### 1. Prerequisites

-   Node.js 18.17 or later.
-   The backend server must be running (typically at `http://127.0.0.1:8000`).

### 2. Configure Environment Variables

Create a file named `.env.local` in the `frontend` directory. This file will hold the URL for the backend API.

```properties
NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8000"
```

### 3. Install Dependencies and Run

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
