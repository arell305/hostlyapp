"use client";

import { Button } from "@shared/ui/primitive/button";
import { Input } from "@shared/ui/primitive/input";
import { Label } from "@shared/ui/primitive/label";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useGenerateMessage } from "@/domain/openAi";
import FieldErrorMessage from "@/shared/ui/error/FieldErrorMessage";

interface AiMessageGeneratorProps {
  onGenerate: (generatedText: string) => void;
}

const AiMessageGenerator: React.FC<AiMessageGeneratorProps> = ({
  onGenerate,
}) => {
  const [aiPrompt, setAiPrompt] = useState<string>("");

  const { generateMessage, isLoading, error } = useGenerateMessage();

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      return;
    }
    const prompt = await generateMessage(aiPrompt);
    if (prompt) {
      onGenerate(prompt);
      setAiPrompt("");
    }
  };

  const disabled = isLoading || !aiPrompt.trim();

  return (
    <div className="w-full max-w-md">
      {" "}
      <Label className="text-base font-medium">Generate with AI</Label>
      <div className="mt-3 space-y-3">
        <Input
          placeholder="Ex: Fun promo for Friday night at Sound, free entry before 11:30, guest list vibe..."
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAiGenerate();
            }
          }}
          className="text-base"
          autoFocus
        />

        <Button
          isLoading={isLoading}
          type="button"
          variant="default"
          size="xs"
          onClick={handleAiGenerate}
          disabled={disabled}
          className="w-[200px] bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white font-normal text-sm rounded-2xl shadow-lg"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Message
        </Button>
      </div>
      <FieldErrorMessage error={error} />
    </div>
  );
};

export default AiMessageGenerator;
