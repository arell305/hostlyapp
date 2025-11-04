"use client";

import { cn } from "@/shared/lib/utils";
import { RowInput } from "@/shared/lib/csvHelper";

type UploadPreviewTableProps = {
  rows: RowInput[];
  isValidPhoneNumber: (value: string) => boolean;
};

export function UploadPreviewTable({
  rows,
  isValidPhoneNumber,
}: UploadPreviewTableProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 max-h-56 overflow-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-cardBackground">
          <tr>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Phone</th>
            <th className="text-left p-2">Valid</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 100).map((row, rowIndex) => {
            const hasName = row.name.trim().length > 0;
            const hasValidPhone = isValidPhoneNumber(row.phoneNumber);
            const isRowValid = hasName && hasValidPhone;

            return (
              <tr
                key={rowIndex}
                className={cn("border-t", !isRowValid && "bg-red-500/5")}
              >
                <td className="p-2">{row.name}</td>
                <td className="p-2">{row.phoneNumber}</td>
                <td className="p-2">{isRowValid ? "Yes" : "No"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length > 100 && (
        <div className="p-2 text-xs text-whiteText/60">
          Showing first 100 rows
        </div>
      )}
    </div>
  );
}
