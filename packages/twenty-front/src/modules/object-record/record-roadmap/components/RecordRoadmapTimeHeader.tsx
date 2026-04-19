import { styled } from '@linaria/react';
import { type Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { ViewRoadmapZoom } from '~/generated-metadata/graphql';

import { ROADMAP_HEADER_HEIGHT } from '@/object-record/record-roadmap/constants/RoadmapDimensions';

type RecordRoadmapTimeHeaderProps = {
  days: Temporal.PlainDate[];
  viewportStart: Temporal.PlainDate;
  dayWidthPx: number;
  zoom: ViewRoadmapZoom;
};

// Sticky to the scroll container's top so the date scale stays on-screen
// while the user scrolls swimlanes vertically. `z-index: 3` keeps it above
// weekend columns, today line, and the swimlane headers (which use z:2).
const StyledHeader = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: ${ROADMAP_HEADER_HEIGHT}px;
  position: sticky;
  top: 0;
  z-index: 3;
`;

const StyledUpperCell = styled.div`
  align-items: center;
  border-right: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 24px;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
  position: absolute;
  top: 0;
  white-space: nowrap;
`;

const StyledLowerCell = styled.div`
  align-items: center;
  border-right: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  height: 24px;
  justify-content: center;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[1]};
  position: absolute;
  top: 24px;
  white-space: nowrap;
`;

type HeaderBandCell = {
  firstDay: Temporal.PlainDate;
  daySpan: number;
  label: string;
};

const MONTH_LABELS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Groups consecutive `days` whenever `keyFn` returns the same value. Returns
// one cell per group with `labelFn` invoked on its first day.
const groupIntoBand = (
  days: Temporal.PlainDate[],
  keyFn: (day: Temporal.PlainDate) => string,
  labelFn: (firstDay: Temporal.PlainDate, lastDay: Temporal.PlainDate) => string,
): HeaderBandCell[] => {
  const bands: { firstDay: Temporal.PlainDate; lastDay: Temporal.PlainDate }[] =
    [];
  let currentKey: string | null = null;

  for (const day of days) {
    const key = keyFn(day);
    if (currentKey !== key) {
      bands.push({ firstDay: day, lastDay: day });
      currentKey = key;
    } else {
      bands[bands.length - 1].lastDay = day;
    }
  }

  return bands.map(({ firstDay, lastDay }) => {
    const daySpan =
      firstDay.until(lastDay, { largestUnit: 'days' }).days + 1;
    return { firstDay, daySpan, label: labelFn(firstDay, lastDay) };
  });
};

const computeMonthBand = (days: Temporal.PlainDate[]): HeaderBandCell[] =>
  groupIntoBand(
    days,
    (day) => `${day.year}-${day.month}`,
    (firstDay) => `${MONTH_LABELS_SHORT[firstDay.month - 1]} ${firstDay.year}`,
  );

const computeMonthNameOnlyBand = (
  days: Temporal.PlainDate[],
): HeaderBandCell[] =>
  groupIntoBand(
    days,
    (day) => `${day.year}-${day.month}`,
    (firstDay) => MONTH_LABELS_SHORT[firstDay.month - 1],
  );

const computeDayBand = (days: Temporal.PlainDate[]): HeaderBandCell[] =>
  days.map((day) => ({
    firstDay: day,
    daySpan: 1,
    label: String(day.day),
  }));

// Groups consecutive days that share an ISO week (Monday-based). Label is
// `startDay-endDay (Ns)` where N is the ISO week-of-year — matches the PRD
// example "27-3 (18s)". Uses Temporal's `yearOfWeek` to handle the year-
// boundary week (e.g. Jan 1 may belong to week 52 of the previous year).
const computeWeekBand = (days: Temporal.PlainDate[]): HeaderBandCell[] =>
  groupIntoBand(
    days,
    (day) => `${day.yearOfWeek}-${day.weekOfYear}`,
    (firstDay, lastDay) =>
      `${firstDay.day}-${lastDay.day} (${firstDay.weekOfYear}s)`,
  );

const computeQuarterBand = (days: Temporal.PlainDate[]): HeaderBandCell[] =>
  groupIntoBand(
    days,
    (day) => `${day.year}-Q${Math.ceil(day.month / 3)}`,
    (firstDay) => `Q${Math.ceil(firstDay.month / 3)} ${firstDay.year}`,
  );

type BandDefinition = {
  upper: HeaderBandCell[];
  lower: HeaderBandCell[];
};

// Per-zoom header composition. The upper band is the coarser grouping
// (month → month → quarter) and the lower band the finer granularity
// (day number → week range → month name).
const computeBands = (
  days: Temporal.PlainDate[],
  zoom: ViewRoadmapZoom,
): BandDefinition => {
  switch (zoom) {
    case ViewRoadmapZoom.DAY:
      return { upper: computeMonthBand(days), lower: computeDayBand(days) };
    case ViewRoadmapZoom.WEEK:
      return { upper: computeMonthBand(days), lower: computeWeekBand(days) };
    case ViewRoadmapZoom.QUARTER:
      return {
        upper: computeQuarterBand(days),
        lower: computeMonthNameOnlyBand(days),
      };
    case ViewRoadmapZoom.MONTH:
    default:
      return { upper: computeMonthBand(days), lower: [] };
  }
};

export const RecordRoadmapTimeHeader = ({
  days,
  viewportStart,
  dayWidthPx,
  zoom,
}: RecordRoadmapTimeHeaderProps) => {
  const { upper, lower } = computeBands(days, zoom);

  return (
    <StyledHeader>
      {upper.map((band) => {
        const offsetDays = viewportStart.until(band.firstDay, {
          largestUnit: 'days',
        }).days;
        return (
          <StyledUpperCell
            key={`upper-${band.firstDay.toString()}`}
            style={{
              left: offsetDays * dayWidthPx,
              width: band.daySpan * dayWidthPx,
            }}
          >
            {band.label}
          </StyledUpperCell>
        );
      })}
      {lower.map((band) => {
        const offsetDays = viewportStart.until(band.firstDay, {
          largestUnit: 'days',
        }).days;
        return (
          <StyledLowerCell
            key={`lower-${band.firstDay.toString()}`}
            style={{
              left: offsetDays * dayWidthPx,
              width: band.daySpan * dayWidthPx,
            }}
          >
            {band.label}
          </StyledLowerCell>
        );
      })}
    </StyledHeader>
  );
};
