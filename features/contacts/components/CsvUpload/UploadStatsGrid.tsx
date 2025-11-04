"use client";

type UploadStatsGridProps = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
};

export function UploadStatsGrid({
  totalRows,
  validRows,
  invalidRows,
}: UploadStatsGridProps) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <UploadStat label="Total Rows" value={totalRows} />
      <UploadStat label="Valid Rows" value={validRows} />
      <UploadStat label="Invalid Rows" value={invalidRows} />
    </div>
  );
}

function UploadStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-whiteText/60">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
