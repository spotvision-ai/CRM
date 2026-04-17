import { Temporal } from 'temporal-polyfill';

import { ROADMAP_MIN_BAR_WIDTH } from '@/object-record/record-roadmap/constants/RoadmapDimensions';

type ComputeRoadmapBarPositionArgs = {
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  viewportStart: Temporal.PlainDate;
  dayWidthPx: number;
};

type RoadmapBarPosition = {
  leftPx: number;
  widthPx: number;
  durationDays: number;
};

// Derives pixel position + width of a bar given the current viewport anchor
// and the zoom's day width. Always clamps bar width to ROADMAP_MIN_BAR_WIDTH
// so single-day (or inverted) records are still selectable. End < start is
// signalled by returning widthPx === ROADMAP_MIN_BAR_WIDTH and the caller is
// expected to add the error styling.
export const computeRoadmapBarPosition = ({
  startDate,
  endDate,
  viewportStart,
  dayWidthPx,
}: ComputeRoadmapBarPositionArgs): RoadmapBarPosition => {
  const daysFromViewportStart = viewportStart.until(startDate, {
    largestUnit: 'days',
  }).days;

  const durationDays = startDate.until(endDate, { largestUnit: 'days' }).days;

  const leftPx = daysFromViewportStart * dayWidthPx;
  const widthPx = Math.max(durationDays * dayWidthPx, ROADMAP_MIN_BAR_WIDTH);

  return { leftPx, widthPx, durationDays };
};

export const parseRoadmapDateValue = (
  raw: unknown,
): Temporal.PlainDate | null => {
  if (typeof raw !== 'string') {
    return null;
  }
  try {
    // Handles both ISO DATE (`2026-04-17`) and DATE_TIME
    // (`2026-04-17T10:30:00Z`) by truncating to the date portion.
    return Temporal.PlainDate.from(raw.slice(0, 10));
  } catch {
    return null;
  }
};
