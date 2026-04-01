export interface PromptItem {
  id: string;
  text: string;
  response?: string;
  status: "idle" | "loading" | "done" | "error";
  error?: string;
}

export interface PdfInfo {
  text: string;
  pageCount: number;
  filename: string;
}

export interface ModelOption {
  id: string;
  label: string;
}
