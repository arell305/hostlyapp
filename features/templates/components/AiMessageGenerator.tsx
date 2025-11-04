"use client";

import { Button } from "@shared/ui/primitive/button";
import { Input } from "@shared/ui/primitive/input";
import { Label } from "@shared/ui/primitive/label";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useGenerateMessage } from "@/domain/openAi";
import FormActions from "@/shared/ui/buttonContainers/FormActions";

interface AiMessageGeneratorProps {
  onGenerate: (generatedText: string) => void;
}

const AiMessageGenerator: React.FC<AiMessageGeneratorProps> = ({
  onGenerate,
}) => {
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [showAiInput, setShowAiInput] = useState<boolean>(false);

  const { generateMessage, isLoading, error, setError } = useGenerateMessage();

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      return;
    }

    const generatedText = await generateMessage(aiPrompt);
    onGenerate(generatedText);
  };

  const handleCancel = () => {
    setShowAiInput(false);
    setAiPrompt("");
    setError(null);
  };

  if (!showAiInput) {
    return (
      <div className="space-y-2 mb-6">
        {/* <Label>Generate with AI</Label> */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAiInput(true)}
          className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white w-full md:w-auto hover:opacity-80 mb-2"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate with AI
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 mb-6">
      <Label>Generate with AI</Label>
      <div className="space-y-2 p-3 border rounded-lg bg-secondary/10">
        <Input
          placeholder="Describe the message... (e.g., 'Friendly reminder about upcoming event')"
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

        <FormActions
          onCancel={handleCancel}
          onSubmit={handleAiGenerate}
          isLoading={isLoading}
          error={error}
          cancelText="Cancel"
          submitText="Generate"
          submitVariant="default"
        />
      </div>
    </div>
  );
};

export default AiMessageGenerator;
