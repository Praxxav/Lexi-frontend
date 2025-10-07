"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Download,
  MapPin,
  Tags,
  Code,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Variable {
  id: string;
  key: string;
  label: string;
  description: string;
  example: string;
  required: boolean;
  type: "string" | "date" | "number" | "email";
  value?: string;
}

interface Template {
  id: string;
  title: string;
  fileDescription?: string;
  jurisdiction?: string;
  docType?: string;
  similarityTags: string[];
  bodyMd: string;
  variables: Variable[];
  createdAt: string;
}

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTemplateDetail();
  }, [params.id]);

  const fetchTemplateDetail = async () => {
    try {
      const response = await fetch("http://localhost:8000/templates/");
      if (!response.ok) throw new Error("Failed to fetch template");
      const templates = await response.json();
      const found = templates.find((t: Template) => t.id === params.id);

      if (found) {
        setTemplate(found);
        const initialValues: Record<string, string> = {};
        found.variables.forEach((v: Variable) => {
  initialValues[v.key] = v.example || "";
});

        setVariableValues(initialValues);
      } else {
        toast({
          title: "Template not found",
          description: "The requested template could not be found.",
          variant: "destructive",
        });
        router.push("/templates");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load template details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateVariables = (): boolean => {
    if (!template) return false;
    const newErrors: Record<string, string> = {};

    template.variables.forEach((v) => {
      const value = variableValues[v.key]?.trim() || "";
      if (v.required && !value) {
        newErrors[v.key] = `${v.label} is required.`;
      } else if (value) {
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
  };

  const handleProceedToDrafting = () => {
    if (!template) return;

    if (!validateVariables()) {
      const errorMessages = Object.values(errors).join(" \n");
      toast({
        title: "Validation Error",
        description:
          "Please fix the errors before proceeding. Hover over the red fields for details.",
        variant: "destructive",
      });
      return;
    }

    // Pass variables via query or localStorage
    localStorage.setItem(
      "draftingTemplate",
      JSON.stringify({
        templateId: template.id,
        variables: variableValues,
      })
    );

    router.push(`/drafting?templateId=${template.id}`);
  };

  const handleDownload = async (filetype: "docx" | "pdf") => {
    if (!template) return;

    const filledBody = template.bodyMd.replace(
      /{{(.*?)}}/g,
      (_, key) => variableValues[key.trim()] || `{{${key}}}`
    );

    const formData = new FormData();
    formData.append("body", filledBody);
    formData.append("filename", template.title.replace(/ /g, "_"));
    formData.append("filetype", filetype);

    try {
      const response = await fetch("http://localhost:8000/export/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to export document");
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/templates")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Templates
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{template.title}</h1>
        {template.fileDescription && (
          <p className="text-muted-foreground">{template.fileDescription}</p>
        )}
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Template Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {template.docType && (
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium mr-2">Document Type:</span>
              <span className="capitalize">{template.docType}</span>
            </div>
          )}
          {template.jurisdiction && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium mr-2">Jurisdiction:</span>
              <span>{template.jurisdiction}</span>
            </div>
          )}
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="font-medium mr-2">Created:</span>
            <span>{new Date(template.createdAt).toLocaleDateString()}</span>
          </div>
          {template.similarityTags.length > 0 && (
            <div className="flex items-start">
              <Tags className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
              <div>
                <span className="font-medium mr-2">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {template.similarityTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="variables">
        <TabsList>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="markdown">Markdown</TabsTrigger>
        </TabsList>

        {/* Editable Variables */}
        <TabsContent value="variables" className="space-y-4">
          {template.variables.map((variable) => (
            <Card key={variable.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{variable.label}</span>
                  {variable.required && (
                    <Badge variant="destructive">Required</Badge>
                  )}
                </CardTitle>
                <CardDescription>{variable.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  type={variable.type === "date" ? "date" : "text"}
                  value={variableValues[variable.key] || ""}
                  placeholder={variable.example || "Enter value"}
                  onChange={(e) =>
                    handleVariableChange(variable.key, e.target.value)
                  }
                  className={errors[variable.key] ? "border-destructive" : ""}
                />
                {errors[variable.key] && (
                  <p className="text-xs text-destructive">
                    {errors[variable.key]}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Variable Key: <code>{`{{${variable.key}}}`}</code>
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Document Preview</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload('docx')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download as DOCX
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload('pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download as PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none whitespace-pre-wrap">
                {template.bodyMd.replace(
                  /{{(.*?)}}/g,
                  (_, key) => variableValues[key.trim()] || `{{${key}}}`
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Raw Markdown */}
        <TabsContent value="markdown">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Raw Markdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{template.bodyMd}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex gap-3">
        <Button size="lg" onClick={handleProceedToDrafting}>
          Proceed to Drafting
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => router.push("/templates")}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
