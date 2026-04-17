import { type Temporal } from 'temporal-polyfill';

type ComputeRoadmapViewportDaysArgs = {
  renderedDaysStart: Temporal.PlainDate;
  totalDays: number;
};

type RoadmapViewportDays = {
  days: Temporal.PlainDate[];
  renderedDaysEnd: Temporal.PlainDate;
};

// Produces the ordered list of PlainDates starting at `renderedDaysStart`.
// The caller owns the buffer policy — this util just materializes the range
// — so the Timeline can grow the window on near-edge scroll to give an
// effectively infinite pan without re-anchoring the positioning math.
export const computeRoadmapViewportDays = ({
  renderedDaysStart,
  totalDays,
}: ComputeRoadmapViewportDaysArgs): RoadmapViewportDays => {
  const safeTotal = Math.max(totalDays, 1);
  const days: Temporal.PlainDate[] = [];
  let cursor = renderedDaysStart;
  for (let i = 0; i < safeTotal; i++) {
    days.push(cursor);
    cursor = cursor.add({ days: 1 });
  }

  const renderedDaysEnd = cursor.subtract({ days: 1 });
  return { days, renderedDaysEnd };
};
