"use client";

import { useState, useEffect } from "react";
import { Template, TemplateMatch, Draft } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatDraft() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [topMatch, setTopMatch] = useState<TemplateMatch | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all templates on mount
  useEffect(() => {
    fetch("http://localhost:8000/templates/")
      .then((res) => res.json())
      .then((data: Template[]) => setTemplates(data))
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to load templates",
          variant: "destructive",
        })
      );
  }, []);

  // Send query or draft command
  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/find-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.json();

      if (data.status === "found" && data.results?.length > 0) {
        const best = data.results[0].template;
        setTopMatch({ template: best, score: data.results[0].score, reason: "Local match found" });
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: `Found local match: **${best.title}**` },
        ]);
      } else if (data.status === "bootstrapped") {
        setTopMatch({ template: data.template, score: 1, reason: "Bootstrapped from web" });
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: `Bootstrapped template: **${data.template.title}**` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: "No matching templates found." },
        ]);
      }
    } catch (err) {
      toast({ title: "Error", description: "Template search failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }

    setInput("");
  };

  // Select template
  const handleSelectTemplate = async (template: Template) => {
    setSelectedTemplate(template);
    const initValues: Record<string, string> = {};
    template.variables?.forEach((v) => (initValues[v.key] = v.example || ""));
    setVariableValues(initValues);

    // Prefill variables using query
    try {
      const res = await fetch("http://localhost:8000/prefill-variables-from-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: template.id, query: input }),
      });
      const data = await res.json();
      if (data.detected_variables) {
        setVariableValues((prev) => ({ ...prev, ...data.detected_variables }));
        toast({ title: "Prefilled", description: "Some fields were prefilled by AI." });
      }
    } catch (err) {
      console.warn("Prefill failed", err);
    }
  };

  // Update variable values
  const handleVariableChange = (key: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [key]: value }));
  };

  // Generate draft using backend
  const generateDraft = async () => {
    if (!selectedTemplate) return;
    const res = await fetch("http://localhost:8000/fill-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template_id: selectedTemplate.id, variables: variableValues }),
    });

    const data = await res.json();
    if (!data.draft_markdown) {
      toast({ title: "Error", description: "Draft generation failed", variant: "destructive" });
      return;
    }

    const draft: Draft = {
      id: crypto.randomUUID(),
      templateId: selectedTemplate.id,
      variables: { ...variableValues },
      bodyMd: data.draft_markdown,
      createdAt: new Date().toISOString(),
    };

    setDrafts((prev) => [draft, ...prev]);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "assistant", content: data.draft_markdown },
    ]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">AI Drafting Assistant</h1>

      {/* Chat Box */}
      <div className="space-y-2 max-h-96 overflow-y-auto border p-4 rounded bg-gray-50">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-2 rounded ${m.role === "user" ? "bg-blue-100 text-blue-800" : "bg-gray-100"}`}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
          </div>
        ))}
        {isLoading && <p className="text-sm text-gray-400">Thinking...</p>}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder='Type your request or use "/draft ..."'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button onClick={handleSend}>Send</Button>
      </div>

      {/* Template Suggestion */}
      {topMatch && !selectedTemplate && (
        <div className="border p-4 rounded bg-white mt-4 shadow">
          <h2 className="font-semibold text-lg">{topMatch.template.title}</h2>
          <p className="text-sm text-gray-500">{topMatch.reason}</p>
          <Button onClick={() => handleSelectTemplate(topMatch.template)} className="mt-2">
            Use This Template
          </Button>
        </div>
      )}

      {/* Variable Inputs */}
      {selectedTemplate && (
        <div className="border p-4 rounded bg-gray-50 space-y-4">
          <h2 className="font-semibold text-lg">Fill Variables for {selectedTemplate.title}</h2>
          {(selectedTemplate.variables ?? []).map((v) => (
            <div key={v.id} className="flex flex-col gap-1">
              <label className="font-medium">
                {v.label} {v.required && <span className="text-red-500">*</span>}
              </label>
              <Input
                placeholder={v.example}
                value={variableValues[v.key] || ""}
                onChange={(e) => handleVariableChange(v.key, e.target.value)}
              />
            </div>
          ))}
          <Button onClick={generateDraft}>Generate Draft</Button>
        </div>
      )}

      {/* Draft History */}
      {drafts.length > 0 && (
        <div className="space-y-2 mt-4">
          <h2 className="font-semibold text-lg">Generated Drafts</h2>
          {drafts.map((d) => (
            <div key={d.id} className="border p-2 rounded bg-white">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{d.bodyMd}</ReactMarkdown>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
