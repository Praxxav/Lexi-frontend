"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Template, Variable } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import remarkGfm from "remark-gfm";

export default function DraftingPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  const [template, setTemplate] = useState<Template | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (!templateId) return;

    const fetchTemplate = async () => {
      const res = await fetch("http://localhost:8000/templates/");
      const templates: Template[] = await res.json();
      const found = templates.find((t) => t.id === templateId);
      setTemplate(found || null);
    };

    fetchTemplate();
  }, [templateId]);

  const handleChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateAllFields = useCallback(() => {
    if (!template) return false;
    const newErrors: Record<string, string> = {};

    template.variables?.forEach((v) => {
      const value = answers[v.key]?.trim() || "";
      if (v.required && !value) {
        newErrors[v.key] = `${v.label} is required.`;
      } else if (value) {
        // Assuming variable type is available on the Variable type
        if (v.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          newErrors[v.key] = "Please enter a valid date (YYYY-MM-DD).";
        } else if (v.type === "number" && isNaN(Number(value))) {
          newErrors[v.key] = "Please enter a valid number.";
        } else if (v.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[v.key] = "Please enter a valid email address.";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [template, answers]);

  const renderedPreview = useMemo(() => {
    if (!template) return "";
    let rendered = template.bodyMd;
    for (const variable of template.variables ?? []) {
      const value = answers[variable.key] || `{{${variable.key}}}`;
      const regex = new RegExp(`{{${variable.key}}}`, "g");
      rendered = rendered.replace(regex, value);
    }
    return rendered;
  }, [template, answers]);

  const handleDownload = async (filetype: "docx" | "pdf") => {
    if (!template) return;

    if (!validateAllFields()) {
      toast({
        title: "Validation Error",
        description:
          "Please fix the errors before generating the document. Hover over the red fields for details.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("body", renderedPreview);
    formData.append("filename", template.title.replace(/ /g, "_"));
    formData.append("filetype", filetype);

    try {
      const response = await fetch("http://localhost:8000/export/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to export document: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.title.replace(/ /g, "_")}.${filetype}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the document. Please try again.",
        variant: "destructive",
      });
    }
  };
  if (!template) return <div>Loading template...</div>;

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{template.title}</h1>

      {/* --- Input section --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Fill in information:</h2>
        {(template.variables ?? []).map((v: Variable) => (
          <div key={v.id} className="flex flex-col gap-1">
            <label className="font-medium">
              {v.label}
              {v.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <input
              type={v.type === "date" ? "date" : "text"}
              placeholder={v.example || ""}
              value={answers[v.key] || ""}
              onChange={(e) => handleChange(v.key, e.target.value)}
              className={`border rounded p-2 focus:outline-none focus:ring-2 ${
                errors[v.key]
                  ? "border-red-400 ring-red-200"
                  : "border-gray-300"
              }`}
            />
            {errors[v.key] && (
              <p className="text-xs text-red-500 mt-1">{errors[v.key]}</p>
            )}
          </div>
        ))}
      </div>

      {/* --- Preview section --- */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Live Preview:</h2>
        <div className="bg-gray-50 p-6 rounded-lg border prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {renderedPreview}
          </ReactMarkdown>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button
          size="lg"
          disabled={hasErrors}
          onClick={() => handleDownload("docx")}
        >
          <Download className="mr-2 h-5 w-5" />
          Generate DOCX
        </Button>
        <Button
          size="lg"
          variant="outline"
          disabled={hasErrors}
          onClick={() => handleDownload("pdf")}
        >
          <Download className="mr-2 h-5 w-5" />
          Generate PDF
        </Button>
      </div>
    </div>
  );
}
