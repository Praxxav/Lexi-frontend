'use client';

import { useState } from 'react';
import { createTemplateFromUpload, saveTemplate } from '@/lib/api';
import toast from 'react-hot-toast';
import { UploadCloud, FileText, Loader2, Save } from 'lucide-react';

export default function TemplateUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [templateMarkdown, setTemplateMarkdown] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setTemplateMarkdown(''); // Reset on new file selection
    }
  };

  const handleGenerateTemplate = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Generating template from document...');

    try {
      const markdown = await createTemplateFromUpload(file);
      setTemplateMarkdown(markdown);
      toast.success('Template generated! Please review below.', { id: loadingToast });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Generation failed: ${errorMessage}`, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateMarkdown) {
      toast.error('No template content to save.');
      return;
    }

    setIsSaving(true);
    const savingToast = toast.loading('Saving template to database...');

    try {
      const result = await saveTemplate(templateMarkdown);
      toast.success(`${result.message} (ID: ${result.template_id})`, { id: savingToast });
      // Optionally reset the state after saving
      setFile(null);
      setTemplateMarkdown('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Save failed: ${errorMessage}`, { id: savingToast });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Create New Template</h2>
        <p className="mt-1 text-sm leading-6 text-gray-600">Upload a .docx or .pdf file to automatically extract variables and create a reusable template.</p>
      </div>

      <div className="flex items-center gap-x-4">
        <label htmlFor="file-upload" className="cursor-pointer rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          <UploadCloud className="inline-block h-5 w-5 mr-2" />
          <span>{file ? 'Change file' : 'Select a file'}</span>
          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
        </label>
        {file && <span className="text-sm text-gray-500">{file.name}</span>}
        <button type="button" onClick={handleGenerateTemplate} disabled={!file || isLoading} className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Generate Template'}
        </button>
      </div>

      {templateMarkdown && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center"><FileText className="mr-2 h-5 w-5"/> Review Detected Variables and Template</h3>
            <button type="button" onClick={handleSaveTemplate} disabled={isSaving} className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSaving ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
              <span className="ml-2">Save Template</span>
            </button>
          </div>
          <textarea
            rows={25}
            className="block w-full rounded-md border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 font-mono"
            value={templateMarkdown}
            onChange={(e) => setTemplateMarkdown(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}