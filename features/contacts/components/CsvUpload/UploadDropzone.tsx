"use client";

import { cn } from "@/shared/lib/utils";
import { useCallback } from "react";

type UploadDropzoneProps = {
  selectedFileName: string;
  onFileChosen: (fileObject: File) => void;
};

export function UploadDropzone({
  selectedFileName,
  onFileChosen,
}: UploadDropzoneProps) {
  const handleDropZoneClick = useCallback(() => {
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "file";
    hiddenInput.accept = ".csv,text/csv";
    hiddenInput.onchange = () => {
      const chosenFile = hiddenInput.files?.[0];
      if (chosenFile) {
        onFileChosen(chosenFile);
      }
    };
    hiddenInput.click();
  }, [onFileChosen]);

  const handleDropZoneDrop = useCallback(
    (dragEvent: React.DragEvent<HTMLDivElement>) => {
      dragEvent.preventDefault();
      const droppedFile = dragEvent.dataTransfer.files?.[0];
      if (droppedFile) {
        onFileChosen(droppedFile);
      }
    },
    [onFileChosen]
  );

  return (
    <div
      onDragOver={(dragEvent) => dragEvent.preventDefault()}
      onDrop={handleDropZoneDrop}
      className={cn(
        "border border-dashed rounded-xl p-6 text-center cursor-pointer"
      )}
      onClick={handleDropZoneClick}
    >
      <p className="text-sm text-whiteText/70">
        {selectedFileName || "Drag & drop CSV here, or click to choose a file"}
      </p>
    </div>
  );
}
