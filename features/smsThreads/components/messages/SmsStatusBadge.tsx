const StatusBadge = ({ status }: { status?: string }) => {
  if (!status) {
    return null;
  }
  const base =
    "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full";
  const statusMap: Record<string, string> = {
    sent: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    queued: "bg-yellow-100 text-yellow-800",
  };
  const cls = statusMap[status] ?? "bg-gray-100 text-gray-800";
  return <span className={`${base} ${cls}`}>{status}</span>;
};

export default StatusBadge;
