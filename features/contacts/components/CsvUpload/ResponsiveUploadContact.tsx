"use client";

import { useMemo, useState } from "react";
import ResponsiveModal from "@/shared/ui/responsive/ResponsiveModal";
import FormActions from "@/shared/ui/buttonContainers/FormActions";
import { Id } from "convex/_generated/dataModel";
import { isValidPhoneNumber } from "@/shared/utils/frontend-validation";
import { useBulkUpsertContacts } from "@/domain/contacts";
import { UploadDropzone } from "./UploadDropzone";
import { UploadStatsGrid } from "./UploadStatsGrid";
import { UploadErrorsBox } from "./UploadErrorsBox";
import { UploadPreviewTable } from "./UploadPreviewTable";
import {
  RowInput,
  parseCsvToRecords,
  mapCsvRecordsToRows,
  sanitizeAndDeduplicateRows,
} from "@/shared/lib/csvHelper";

type ResponsiveUploadContactProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: Id<"users">;
};

export default function ResponsiveUploadContact({
  isOpen,
  onOpenChange,
  userId,
}: ResponsiveUploadContactProps) {
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<RowInput[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    bulkUpsert: bulkUpsertContacts,
    loading: isBulkUpsertLoading,
    error: bulkUpsertError,
    setError: setBulkUpsertError,
  } = useBulkUpsertContacts();

  const validParsedRows = useMemo(() => {
    return parsedRows.filter((row) => {
      const hasName = row.name.trim().length > 0;
      const hasValidPhone = isValidPhoneNumber(row.phoneNumber);
      return hasName && hasValidPhone;
    });
  }, [parsedRows]);

  const invalidRowCount = parsedRows.length - validParsedRows.length;

  const handleCloseModal = () => {
    setBulkUpsertError(null);
    setSelectedFileName("");
    setParsedRows([]);
    setValidationErrors([]);
    onOpenChange(false);
  };

  const handleChosenFile = (fileObject: File) => {
    setSelectedFileName(fileObject.name);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const fileText =
        typeof fileReader.result === "string" ? fileReader.result : "";
      const csvRecords = parseCsvToRecords(fileText);
      const mappedRows = mapCsvRecordsToRows(csvRecords);
      const sanitized = sanitizeAndDeduplicateRows(mappedRows);
      setParsedRows(sanitized.cleanedRows);
      setValidationErrors(sanitized.collectedErrors);
    };
    fileReader.readAsText(fileObject);
  };

  const handleSubmitImport = async () => {
    if (!userId) {
      return;
    }
    if (validParsedRows.length === 0) {
      return;
    }
    const wasSuccessful = await bulkUpsertContacts({
      userId,
      rows: validParsedRows.map((row) => ({
        name: row.name.trim(),
        phoneNumber: row.phoneNumber.trim(),
      })),
    });
    if (wasSuccessful) {
      handleCloseModal();
    }
  };

  const isSubmitDisabled =
    !userId || validParsedRows.length === 0 || isBulkUpsertLoading;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onOpenChange={handleCloseModal}
      title="Upload Contacts (CSV)"
      description="Upload a CSV with columns for name and phone number."
    >
      <UploadDropzone
        selectedFileName={selectedFileName}
        onFileChosen={handleChosenFile}
      />

      <UploadStatsGrid
        totalRows={parsedRows.length}
        validRows={validParsedRows.length}
        invalidRows={invalidRowCount}
      />

      <UploadErrorsBox errors={validationErrors} />

      <UploadPreviewTable
        rows={parsedRows}
        isValidPhoneNumber={isValidPhoneNumber}
      />

      <div className="mt-4">
        <FormActions
          onCancel={handleCloseModal}
          onSubmit={handleSubmitImport}
          isLoading={isBulkUpsertLoading}
          submitText={`Import ${validParsedRows.length} contact${validParsedRows.length === 1 ? "" : "s"}`}
          error={bulkUpsertError}
          isSubmitDisabled={isSubmitDisabled}
        />
      </div>
    </ResponsiveModal>
  );
}
