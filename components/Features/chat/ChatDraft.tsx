"use client";

import { useState, useEffect, useRef } from "react";
import { Template, Draft } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Copy, Check } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  type?: "text" | "template_card" | "question_form" | "draft";
  data?: any;
}

interface Question {
  variable_key: string;
  question: string;
  hint: string;
  example: string;
  required: boolean;
}

const API_BASE = "http://localhost:8000";

export default function ChatDraft() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "system",
      content: "👋 Hi! I can help you draft legal documents. Try:\n- 'Draft a notice to insurer'\n- '/draft lease agreement'\n- Upload a template to get started",
      type: "text"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [draftContent, setDraftContent] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (message: Omit<ChatMessage, "id">) => {
    setMessages(prev => [...prev, { ...message, id: crypto.randomUUID() }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userInput = input.trim();
    addMessage({ role: "user", content: userInput, type: "text" });
    setInput("");
    setIsLoading(true);

    try {
      if (userInput.toLowerCase() === "/vars") {
        handleVarsCommand();
        return;
      }

      const res = await fetch(`${API_BASE}/find-templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userInput }),
      });

      const data = await res.json();

      if (data.status === "found" && data.results?.length > 0) {
        const topMatch = data.results[0];
        setCurrentTemplate(topMatch.template);

        addMessage({
          role: "assistant",
          content: "",
          type: "template_card",
          data: {
            template: topMatch.template,
            score: topMatch.score,
            alternatives: data.results.slice(1, 4)
          }
        });

        await prefillVariables(topMatch.template.id, userInput);

      } else if (data.status === "bootstrapped") {
        setCurrentTemplate(data.template);

        addMessage({
          role: "assistant",
          content: `✨ **Found template online!**\n\nSource: [${data.source_title}](${data.source_url})\n\nI've created a new template. Fill it out from templates!`,
          type: "text"
        });

        await prefillVariables(data.template.id, userInput);

      } else {
        addMessage({
          role: "assistant",
          content: "No matching templates found. Try uploading a template or using different keywords.",
          type: "text"
        });
      }

    } catch (error) {
      console.error("Error:", error);
      addMessage({ role: "assistant", content: "⚠️ An error occurred. Please try again.", type: "text" });
    } finally {
      setIsLoading(false);
    }
  };

  const prefillVariables = async (templateId: string, query: string) => {
    try {
      const res = await fetch(`${API_BASE}/prefill-variables-from-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: templateId, query }),
      });

      const data = await res.json();

      if (data.prefilled_variables) setVariableValues(data.prefilled_variables);

      if (data.missing_variables?.length > 0) await generateQuestions(templateId, data.prefilled_variables || {});
      else addMessage({ role: "assistant", content: "🎉 All variables filled! Ready to generate your draft.", type: "text" });

    } catch (error) {
      console.error("Prefill error:", error);
    }
  };

  const generateQuestions = async (templateId: string, filledVars: Record<string, string>) => {
    try {
      const res = await fetch(`${API_BASE}/generate-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: templateId, filled_variables: filledVars }),
      });

      const data = await res.json();
      if (data.questions?.length > 0) {
        setCurrentQuestions(data.questions);
        addMessage({ role: "assistant", content: `📋 I need ${data.questions.length} more detail(s):`, type: "text" });
        addMessage({ role: "assistant", content: "", type: "question_form", data: { questions: data.questions } });
      }
    } catch (error) {
      console.error("Question generation error:", error);
    }
  };

  const handleQuestionSubmit = async (answers: Record<string, string>) => {
    const allValues = { ...variableValues, ...answers };
    setVariableValues(allValues);

    addMessage({ role: "user", content: `Answered ${Object.keys(answers).length} question(s)`, type: "text" });
    await generateDraft(allValues);
  };

  const generateDraft = async (values: Record<string, string>) => {
    if (!currentTemplate) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/fill-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template_id: currentTemplate.id, variables: values }),
      });

      const data = await res.json();

      if (data.draft_markdown) {
        setDraftContent(data.draft_markdown);
        addMessage({ role: "assistant", content: "✅ **Draft Generated!**", type: "text" });
        addMessage({ role: "assistant", content: data.draft_markdown, type: "draft", data: { instanceId: data.instance_id } });
      }

    } catch (error) {
      console.error("Draft generation error:", error);
      addMessage({ role: "assistant", content: "⚠️ Failed to generate draft.", type: "text" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVarsCommand = () => {
    if (!currentTemplate) return addMessage({ role: "assistant", content: "No template selected.", type: "text" });

    const filled = Object.keys(variableValues).length;
    const total = currentTemplate.variables?.length || 0;
    const missing = currentTemplate.variables?.filter(v => !variableValues[v.key] && v.required) || [];

    let content = `📊 **Variable Status for "${currentTemplate.title}"**\n\n✅ Filled: ${filled}/${total}`;
    if (missing.length > 0) {
      content += `\n❌ Missing:\n${missing.map(v => `- ${v.label}`).join("\n")}`;
    } else {
      content += "\n🎉 All required variables filled!";
    }

    addMessage({ role: "assistant", content, type: "text" });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadDraft = (content: string, format: "md" | "docx") => {
    if (format === "md") {
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "draft.md";
      a.click();
    } else alert("DOCX download coming soon!");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto gap-4 p-2">
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-xl shadow-inner border border-gray-200">
        {messages.map(msg => (
          <MessageRenderer
            key={msg.id}
            message={msg}
            onTemplateSelect={(template: Template) => { setCurrentTemplate(template); prefillVariables(template.id, ""); }}
            onQuestionSubmit={handleQuestionSubmit}
            onCopy={copyToClipboard}
            onDownload={downloadDraft}
            copied={copied}
          />
        ))}
        {isLoading && <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={16} />Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder='Type your request or "/vars"'
          disabled={isLoading}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()}>Send</Button>
      </div>
    </div>
  );
}

// -------- Message Renderer with professional UI --------
function MessageRenderer({ message, onTemplateSelect, onQuestionSubmit, onCopy, onDownload, copied }: any) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const bubbleClass = message.role === "user" ? "bg-blue-100 text-blue-900 ml-auto rounded-l-xl rounded-br-xl" :
                      message.role === "system" ? "bg-yellow-50 border-yellow-200 text-yellow-900 rounded-xl" :
                      "bg-white border-gray-200 rounded-xl";

  if (message.type === "template_card") {
    const { template, score, alternatives } = message.data;
    return (
      <Card className="border-blue-200 shadow-sm hover:shadow-md transition p-3">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{template.title}</CardTitle>
          <CardDescription className="text-sm text-gray-500">Score: {score} • {template.variables?.length || 0} variables</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-700">{template.fileDescription}</p>
          <div className="flex flex-wrap gap-2">
            {template.similarityTags?.map((tag: string) => <Badge key={tag}>{tag}</Badge>)}
          </div>
          <Button onClick={() => onTemplateSelect(template)} className="w-full">Use Template</Button>
          {alternatives?.length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600">See {alternatives.length} alternative(s)</summary>
              <div className="mt-2 space-y-1">
                {alternatives.map((alt: any) => <div key={alt.template.id} className="p-2 bg-gray-50 rounded border">{alt.template.title} (Score: {alt.score})</div>)}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    );
  }

  if (message.type === "draft") {
    return (
      <Card className="border-green-200 bg-green-50 shadow-sm">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Generated Draft</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onCopy(message.content)}>{copied ? <Check size={16}/> : <Copy size={16}/>}</Button>
            <Button size="sm" variant="outline" onClick={() => onDownload(message.content, "md")}><Download size={16}/> MD</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none bg-white p-4 rounded border shadow-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Question form and default text handled similarly with improved spacing & shadows
  return (
    <div className={`p-3 border ${bubbleClass} max-w-[80%]`}>
      <div className="prose prose-sm text-gray-800">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
      </div>
    </div>
  );
}
