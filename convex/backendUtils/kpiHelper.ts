import { Id } from "convex/_generated/dataModel";

export function getPercentageChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

export function computeKpis(
  entries: any[],
  eventCount: number,
  promoterSet: Set<string>
) {
  const totalRsvps = entries.length;
  const totalCheckins = entries.filter((e) => e.attended).length;

  const avgRsvpPerEvent = eventCount ? totalRsvps / eventCount : 0;
  const avgCheckinsPerEvent = eventCount ? totalCheckins / eventCount : 0;
  const avgCheckinRate = totalRsvps ? totalCheckins / totalRsvps : 0;
  const avgCheckinsPerPromoter = promoterSet.size
    ? totalCheckins / promoterSet.size
    : 0;

  return {
    avgRsvpPerEvent,
    avgCheckinsPerEvent,
    avgCheckinRate,
    avgCheckinsPerPromoter,
  };
}
