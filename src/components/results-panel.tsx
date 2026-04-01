"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, CheckCircle2, XCircle, Circle } from "lucide-react";
import type { PromptItem } from "@/lib/types";

interface ResultsPanelProps {
  prompts: PromptItem[];
  documentTitle: string;
  isExporting: boolean;
  onExport: () => void;
}

export function ResultsPanel({ prompts }: ResultsPanelProps) {
  const hasAnyActivity = prompts.some((p) => p.status !== "idle");

  if (!hasAnyActivity) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">Responses will appear here after running prompts.</p>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="px-1 py-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Responses ({prompts.filter((p) => p.status === "done").length}/
          {prompts.length})
        </span>
      </div>

      <Accordion className="space-y-1">
        {prompts.map((prompt, index) => (
          <AccordionItem
            key={prompt.id}
            value={prompt.id}
            className="border rounded-md bg-card overflow-hidden"
          >
            <AccordionTrigger className="text-xs px-3 py-2 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/30">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {prompt.status === "done" && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                )}
                {prompt.status === "error" && (
                  <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                )}
                {prompt.status === "loading" && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 shrink-0" />
                )}
                {prompt.status === "idle" && (
                  <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
                <span className="text-left truncate">
                  <span className="font-medium">{index + 1}.</span>{" "}
                  {prompt.text.length > 70
                    ? prompt.text.slice(0, 70) + "..."
                    : prompt.text}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              {prompt.status === "done" && prompt.response && (
                <div className="whitespace-pre-wrap bg-muted/30 rounded-md p-3 text-xs leading-relaxed max-h-[60vh] overflow-y-auto">
                  {prompt.response}
                </div>
              )}
              {prompt.status === "error" && (
                <p className="text-xs text-destructive">
                  {prompt.error || "An error occurred"}
                </p>
              )}
              {prompt.status === "loading" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Generating response...
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
