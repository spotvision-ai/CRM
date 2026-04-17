import { Temporal } from 'temporal-polyfill';

import { ROADMAP_VIEWPORT_BUFFER_RATIO } from '@/object-record/record-roadmap/constants/RoadmapDimensions';

type ComputeRoadmapViewportDaysArgs = {
  viewportStart: Temporal.PlainDate;
  viewportWidthPx: number;
  dayWidthPx: number;
};

type RoadmapViewportDays = {
  days: Temporal.PlainDate[];
  viewportEnd: Temporal.PlainDate;
};

// Produces the ordered list of PlainDates covered by the current viewport
// (viewport width + 2 × buffer). Used by the time header and the weekend
// overlay so both stay in sync with the bar positioning math.
export const computeRoadmapViewportDays = ({
  viewportStart,
  viewportWidthPx,
  dayWidthPx,
}: ComputeRoadmapViewportDaysArgs): RoadmapViewportDays => {
  const visibleDays = Math.max(
    Math.ceil(viewportWidthPx / Math.max(dayWidthPx, 1)),
    1,
  );
  const bufferDays = Math.ceil(visibleDays * ROADMAP_VIEWPORT_BUFFER_RATIO);
  const totalDays = visibleDays + bufferDays * 2;

  const days: Temporal.PlainDate[] = [];
  let cursor = viewportStart.subtract({ days: bufferDays });
  for (let i = 0; i < totalDays; i++) {
    days.push(cursor);
    cursor = cursor.add({ days: 1 });
  }

  const viewportEnd = cursor.subtract({ days: 1 });
  return { days, viewportEnd };
};
