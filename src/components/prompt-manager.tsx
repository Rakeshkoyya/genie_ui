"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import type { PromptItem } from "@/lib/types";

interface PromptManagerProps {
  prompts: PromptItem[];
  onPromptsChange: (prompts: PromptItem[]) => void;
  disabled?: boolean;
}

export function PromptManager({
  prompts,
  onPromptsChange,
  disabled,
}: PromptManagerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addPrompt = () => {
    const newPrompt = {
      id: crypto.randomUUID(),
      text: "",
      status: "idle" as const,
    };
    onPromptsChange([...prompts, newPrompt]);
    setExpandedId(newPrompt.id);
  };

  const removePrompt = (id: string) => {
    onPromptsChange(prompts.filter((p) => p.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updatePromptText = (id: string, text: string) => {
    onPromptsChange(prompts.map((p) => (p.id === id ? { ...p, text } : p)));
  };

  const movePrompt = (index: number, direction: "up" | "down") => {
    const newPrompts = [...prompts];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newPrompts.length) return;
    [newPrompts[index], newPrompts[target]] = [
      newPrompts[target],
      newPrompts[index],
    ];
    onPromptsChange(newPrompts);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-2">
      <div className="flex items-center justify-between px-1 py-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Prompts ({prompts.length})
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs"
          onClick={addPrompt}
          disabled={disabled}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-1">
        {prompts.map((prompt, index) => {
          const isExpanded = expandedId === prompt.id;
          const preview = prompt.text.trim()
            ? prompt.text.trim().substring(0, 60) +
              (prompt.text.length > 60 ? "..." : "")
            : "Empty prompt";

          return (
            <div
              key={prompt.id}
              className="border rounded-md bg-card overflow-hidden"
            >
              {/* Collapsed header */}
              <div
                className="flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-muted/50"
                onClick={() => toggleExpand(prompt.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                )}
                <span className="text-xs font-medium text-muted-foreground w-4">
                  {index + 1}.
                </span>
                <span className="text-xs flex-1 truncate">{preview}</span>
                {/* Status indicator */}
                {prompt.status === "done" && (
                  <span className="text-xs text-green-600 shrink-0">
                    &#10003;
                  </span>
                )}
                {prompt.status === "loading" && (
                  <span className="text-xs text-blue-600 shrink-0 animate-pulse">
                    ...
                  </span>
                )}
                {prompt.status === "error" && (
                  <span className="text-xs text-destructive shrink-0">
                    &#10007;
                  </span>
                )}
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-2 pb-2 space-y-1.5">
                  <Textarea
                    value={prompt.text}
                    onChange={(e) =>
                      updatePromptText(prompt.id, e.target.value)
                    }
                    placeholder="Enter your prompt..."
                    className="min-h-[60px] text-xs resize-y"
                    disabled={disabled || prompt.status === "loading"}
                  />
                  {prompt.error && (
                    <p className="text-xs text-destructive">{prompt.error}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          movePrompt(index, "up");
                        }}
                        disabled={index === 0 || disabled}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          movePrompt(index, "down");
                        }}
                        disabled={index === prompts.length - 1 || disabled}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePrompt(prompt.id);
                      }}
                      disabled={disabled || prompt.status === "loading"}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
