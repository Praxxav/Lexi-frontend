"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Search, FileText, Calendar, MapPin, Tags } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Variable {
  id: string;
  key: string;
  label: string;
  description: string;
  example: string;
  required: boolean;
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

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTemplates(templates);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = templates.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.docType?.toLowerCase().includes(query) ||
          t.jurisdiction?.toLowerCase().includes(query) ||
          t.similarityTags.some((tag) => tag.toLowerCase().includes(query))
      );
      setFilteredTemplates(filtered);
    }
  }, [searchQuery, templates]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("http://localhost:8000/templates/");
      if (!response.ok) throw new Error("Failed to fetch templates");
      const data = await response.json();
      setTemplates(data);
      setFilteredTemplates(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load templates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTemplate = (templateId: string) => {
    router.push(`/drafting?templateId=${templateId}`);
  };

  const handleViewTemplate = (templateId: string) => {
    router.push(`/templates/${templateId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Templates</h1>
          <p className="text-muted-foreground">Loading your saved templates...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Templates</h1>
        <p className="text-muted-foreground">
          Browse and use your saved document templates
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search templates by title, type, jurisdiction, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? "No templates found" : "No templates yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try adjusting your search query"
              : "Upload a document to create your first template"}
          </p>
          {!searchQuery && (
            <Button onClick={() => router.push("/dashboard")}>
              Create Template
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="line-clamp-2">{template.title}</span>
                </CardTitle>
                {template.fileDescription && (
                  <CardDescription className="line-clamp-2">
                    {template.fileDescription}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {template.docType && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="capitalize">{template.docType}</span>
                  </div>
                )}
                {template.jurisdiction && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{template.jurisdiction}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {template.similarityTags.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Tags className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {template.similarityTags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.similarityTags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.similarityTags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  {template.variables.length} variable{template.variables.length !== 1 ? "s" : ""}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  onClick={() => handleUseTemplate(template.id)}
                  className="flex-1"
                >
                  Use Template
                </Button>
                <Button
                  onClick={() => handleViewTemplate(template.id)}
                  variant="outline"
                  className="flex-1"
                >
                  View
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}