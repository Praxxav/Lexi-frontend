const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

/**
 * Uploads a document file to the backend to generate a template.
 * @param file The file to upload (.docx, .pdf, .txt).
 * @returns The generated template markdown string.
 */
export const createTemplateFromUpload = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/create-template-from-upload/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to create template.');
  }

  const result = await response.json();
  return result.template_markdown;
};

/**
 * Saves the generated template markdown to the database.
 * @param templateMarkdown The full markdown string with YAML front-matter.
 * @returns The success message and the new template's ID.
 */
export const saveTemplate = async (templateMarkdown: string): Promise<{ message: string; template_id: string }> => {
  const response = await fetch(`${API_BASE_URL}/save-template/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ template_markdown: templateMarkdown }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to save the template.');
  }

  return response.json();
};

/**
 * Defines the structure of a Template object returned from the API.
 */
export interface Template {
  id: string;
  title: string;
  fileDescription: string | null;
  jurisdiction: string | null;
  docType: string | null;
  similarityTags: string[];
  createdAt: string;
}

/**
 * Fetches all saved templates from the database.
 * @returns A promise that resolves to an array of templates.
 */
export const getTemplates = async (): Promise<Template[]> => {
  const response = await fetch(`${API_BASE_URL}/templates/`);
  if (!response.ok) {
    throw new Error('Failed to fetch templates.');
  }
  return response.json();
};