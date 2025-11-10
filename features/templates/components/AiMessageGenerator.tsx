"use client";

import { Button } from "@shared/ui/primitive/button";
import { Input } from "@shared/ui/primitive/input";
import { Label } from "@shared/ui/primitive/label";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useGenerateMessage } from "@/domain/openAi";

interface AiMessageGeneratorProps {
  onGenerate: (generatedText: string) => void;
}

const AiMessageGenerator: React.FC<AiMessageGeneratorProps> = ({
  onGenerate,
}) => {
  const [aiPrompt, setAiPrompt] = useState<string>("");

  const { generateMessage, isLoading, error, setError } = useGenerateMessage();

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      return;
    }

    const generatedText = await generateMessage(aiPrompt);
    onGenerate(generatedText);
  };

  return (
    <div className="">
      <Label>Generate with AI</Label>
      <div className="space-y-2 rounded-lg mb-6">
        <Input
          placeholder="Describe the message... "
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAiGenerate();
            }
          }}
          autoFocus
        />
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={handleAiGenerate}
          className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white  hover:opacity-80 mb-4 rounded-[20px]"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate
        </Button>
      </div>
    </div>
  );
};

export default AiMessageGenerator;
