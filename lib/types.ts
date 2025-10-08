// lib/types.ts

export interface TemplateVariable {
  id: string;
  templateId: string;
  key: string;
  label: string;
  description: string;
  example: string;
  required: boolean;
  type?: string;
  regex?: string;
  enum?: string[];
  createdAt?: Date;
}

export interface Template {
  id: string;
  title: string;
  fileDescription: string;
  jurisdiction: string;
  docType: string;
  similarityTags: string[];
  bodyMd: string;
  variables?: TemplateVariable[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Draft {
  id: string;
  templateId: string;
  userQuery: string;
  answersJson: string;
  draftMd: string;
  createdAt: Date;
  template?: Template;
}

export interface Document {
  id: string;
  status: string;
  insights?: any;
  documentType?: string;
  fullText?: string;
  createdAt?: Date;
}

export interface TemplateMatch {
  template: Template;
  score: number;
  reason: string;
}

export interface Question {
  variable_key: string;
  question: string;
  hint: string;
  example: string;
  required: boolean;
}

export interface PrefillResponse {
  template_id: string;
  prefilled_variables: Record<string, string>;
  missing_variables: string[];
}

export interface GenerateQuestionsResponse {
  questions: Question[];
  count: number;
}

export interface FillTemplateResponse {
  status: string;
  instance_id: string;
  draft_markdown: string;
}