"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { PdfUpload } from "@/components/pdf-upload";
import { PromptManager } from "@/components/prompt-manager";
import { ResultsPanel } from "@/components/results-panel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Play, Loader2, FileText, Download, ChevronDown } from "lucide-react";
import type { PdfInfo, PromptItem, ModelOption } from "@/lib/types";

// == Add your models here ======================================
const AVAILABLE_MODELS: ModelOption[] = [
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash" },
  { id: "google/gemini-2.5-pro-preview-03-25", label: "Gemini 2.5 Pro" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "openai/gpt-4o-mini", label: "GPT-4o Mini" },
  { id: "openai/gpt-4.1-mini", label: "GPT-4.1-mini" },
  { id: "openai/gpt-5", label: "GPT-5"},
  { id: "openai/gpt-5.1", label: "GPT-5.1"},
  { id: "openai/gpt-5.2", label: "GPT-5.2"},
  { id: "openai/gpt-5.4-mini", label: "GPT-5.4-mini" },
  { id: "openai/gpt-5.4", label: "GPT-5.4 (costly)" },
];

// == Default prompts ===========================================
const DEFAULT_PROMPTS: PromptItem[] = [
  {
    id: "default-1",
    text: "Create many, many questions of one line from this Chapter, PDF. One-liner questions, so cover all the concepts and topics and subtopics of this chapter. All the questions, those are possible from this chapter, those answers can be given in one word or one line. You should write down, cover every concept, every topic, and every subtopic, everything from the whole chapter, read it deeply and make as many as questions possible from this Chapter. Write in the end some HOT and Long Questions also List of topics and subtopics to be covered, mapping of all the concepts of the chapter. write in a very compact way, every topic and subtopics in one line with arrow like a flow chart what students will learn in this in this chapter.",
    status: "idle",
  },
  {
    id: "default-2",
    text: "Now Make a long simple list with compact formating print friendly saving space & very compact info, on sheet of all the words of this chapter, these words in Simple English and also in Hindi in one line both, so that students understand these words, terms, concepts, deeply and clearly. For the Students of Hindi Speaking background..format is fine, make a list of words, under topics and subtopics of the chapter, don't left any hard word undefined.",
    status: "idle",
  },
  {
    id: "default-3",
    text: "Now Create visual maps not image based on arrow concepts maps of the all topics and subtopics including all paragraphs of all topics and subtopics, all concepts must be covered, full of emojis and pics and make it easy for students to retain, arrow concept maps of all paragraphs under topics and subtopics with lots of emojis to make visual notes of the chapter for better memory retain and understanding write more and more in one line only, do minimum line breaks, as minimum as possible.",
    status: "idle",
  },
  {
    id: "default-4",
    text: "bilingual English + Hindi emoji concept map version.",
    status: "idle",
  },
  {
    id: "default-5",
    text: "All Facts, Important data, make a long list under topics and subtopics, Name of concept, place, Person, some date, important event and some ranking, where, what, which position, rankings, personality, invention all different kind of all possible facts of the chapter under all topics and subtopics. Make a simple print friendly list with emojis. Lots of facts in form of a simple list.",
    status: "idle",
  },
  {
    id: "default-6",
    text: "Now Create many many real life Project and real life Problems to solve students so that they can develop problem solving skills, so that they can deeply develop different types of thinkings. Many many small or big problems based on all the subtopics and topics and every concept they have learned so far. I want to connect learning to real life and develop thinking skills and other 21st century skills. Create problems under topics and subtopics but also write which skill will develop or targeted skill for the problem children are solving, for all thinking types: Critical Thinking, Analytical Thinking, Creative Thinking, Divergent Thinking, Convergent Thinking, Logical Thinking, Concrete Thinking, Abstract Thinking, Reflective Thinking, Systems Thinking, Intuitive Thinking, Deductive Thinking, Inductive Thinking, Lateral Thinking, Emotional Thinking.",
    status: "idle",
  },
  {
    id: "default-7",
    text: "NOW MAP THE big concepts which we want that student must carry in their hearts and brains after doing this chapter. Concepts which can bring Behavioural change. Life Changing concepts, concepts that can change attitude of the child. Major Concepts they must develop after doing this chapter so that I can do the Assessment based on Life transformation of the child after learning all the above chapter. So make a list of these Life Changing concepts from this chapter affecting behaviour, attitude, life, must become life long learning after this chapter. Map the concepts against skills which can be acquired and life long learning ideas and principals to live now onwards. Make a solid list of these deep life changing concepts for the child assessment.",
    status: "idle",
  },
];

export default function Home() {
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [prompts, setPrompts] = useState<PromptItem[]>(DEFAULT_PROMPTS);
  const [documentTitle, setDocumentTitle] = useState("");
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [isRunning, setIsRunning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handlePdfExtracted = useCallback((info: PdfInfo) => {
    setPdfInfo(info);
    const name = info.filename.replace(/\.pdf$/i, "");
    setDocumentTitle(name);
    toast.success(
      `PDF extracted: ${info.pageCount} pages, ${(info.text.length / 1000).toFixed(1)}k characters`
    );
  }, []);

  const handleClearPdf = useCallback(() => {
    setPdfInfo(null);
    setPrompts((prev) =>
      prev.map((p) => ({
        ...p,
        status: "idle" as const,
        response: undefined,
        error: undefined,
      }))
    );
    toast.info("PDF cleared");
  }, []);

  const runAllPrompts = useCallback(async () => {
    if (!pdfInfo) {
      toast.error("Please upload a PDF first");
      return;
    }

    const validPrompts = prompts.filter((p) => p.text.trim());
    if (validPrompts.length === 0) {
      toast.error("Please add at least one non-empty prompt");
      return;
    }

    setIsRunning(true);

    setPrompts((prev) =>
      prev.map((p) => ({
        ...p,
        status: p.text.trim() ? ("idle" as const) : p.status,
        response: undefined,
        error: undefined,
      }))
    );

    for (const prompt of prompts) {
      if (!prompt.text.trim()) continue;

      setPrompts((prev) =>
        prev.map((p) =>
          p.id === prompt.id ? { ...p, status: "loading" as const } : p
        )
      );

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfText: pdfInfo.text,
            prompt: prompt.text,
            model: selectedModel,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to generate");
        }

        setPrompts((prev) =>
          prev.map((p) =>
            p.id === prompt.id
              ? { ...p, status: "done" as const, response: data.content }
              : p
          )
        );
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to generate";
        setPrompts((prev) =>
          prev.map((p) =>
            p.id === prompt.id
              ? { ...p, status: "error" as const, error: errorMsg }
              : p
          )
        );
        toast.error(`Prompt failed: ${errorMsg}`);
      }
    }

    setIsRunning(false);
    toast.success("All prompts completed!");
  }, [pdfInfo, prompts, selectedModel]);

  const handleExport = useCallback(async () => {
    const completedPrompts = prompts.filter(
      (p) => p.status === "done" && p.response
    );
    if (completedPrompts.length === 0) {
      toast.error("No completed responses to export");
      return;
    }

    setIsExporting(true);

    try {
      const res = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: documentTitle || "Generated Document",
          results: completedPrompts.map((p) => ({
            prompt: p.text,
            response: p.response,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to export");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentTitle || "document"}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Document downloaded!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to export document"
      );
    } finally {
      setIsExporting(false);
    }
  }, [prompts, documentTitle]);

  const canRun = pdfInfo && prompts.some((p) => p.text.trim()) && !isRunning;
  const completedCount = prompts.filter((p) => p.status === "done").length;
  const hasResults = completedCount > 0;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b bg-card shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">PDF Content Generator</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Model Selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                Model:
              </label>
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={isRunning}
                  className="h-8 pl-3 pr-8 text-sm border rounded-md bg-background appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  {AVAILABLE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
              </div>
            </div>
            {/* Export Button */}
            {hasResults && (
              <Button size="sm" onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-1" />
                )}
                Download .docx ({completedCount})
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main 2-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Config + Prompts */}
        <div className="w-[420px] shrink-0 border-r flex flex-col overflow-hidden">
          {/* PDF Upload + Title */}
          <div className="p-3 space-y-3 border-b shrink-0">
            <PdfUpload
              pdfInfo={pdfInfo}
              onPdfExtracted={handlePdfExtracted}
              onClear={handleClearPdf}
            />
            {pdfInfo && (
              <Input
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Document title..."
                className="h-8 text-sm"
              />
            )}
          </div>

          {/* Prompts - scrollable */}
          <div className="flex-1 overflow-y-auto">
            <PromptManager
              prompts={prompts}
              onPromptsChange={setPrompts}
              disabled={isRunning}
            />
          </div>

          {/* Run Button - pinned at bottom */}
          <div className="p-3 border-t shrink-0 bg-card">
            <Button
              className="w-full"
              onClick={runAllPrompts}
              disabled={!canRun}
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run All Prompts
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="flex-1 overflow-y-auto">
          <ResultsPanel
            prompts={prompts}
            documentTitle={documentTitle}
            isExporting={isExporting}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  );
}
