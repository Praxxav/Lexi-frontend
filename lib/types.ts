export type VariableType = "text" | "number" | "date" | "email";

export interface Variable {
  id: string;
  key: string;
  label: string;
  description: string;
  example: string;
  required: boolean;
  templateId: string;
  type?: VariableType;
}

export interface Template {
  id: string;
  title: string;
  fileDescription: string | null;
  jurisdiction: string | null;
  docType: string | null;
  similarityTags: string[];
  bodyMd: string;
  variables?: Variable[];
  createdAt: string;
  updatedAt: string;
}

export interface Draft {
  id: string;
  templateId: string;
  variables: Record<string, string>;
  bodyMd: string;
  createdAt: string;
}

export type TemplateMatch = {
  template: Template;
  score: number;
  reason: string;
};
