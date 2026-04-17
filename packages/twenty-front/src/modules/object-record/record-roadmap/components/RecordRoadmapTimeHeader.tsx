import { styled } from '@linaria/react';
import { type Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ROADMAP_HEADER_HEIGHT } from '@/object-record/record-roadmap/constants/RoadmapDimensions';

type RecordRoadmapTimeHeaderProps = {
  days: Temporal.PlainDate[];
  viewportStart: Temporal.PlainDate;
  dayWidthPx: number;
};

const StyledHeader = styled.div`
  position: relative;
  height: ${ROADMAP_HEADER_HEIGHT}px;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  background-color: ${themeCssVariables.background.primary};
  flex-shrink: 0;
`;

const StyledMonthBand = styled.div`
  position: absolute;
  top: 0;
  height: 24px;
  display: flex;
  align-items: center;
  padding: 0 ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  border-right: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledDayCell = styled.div`
  position: absolute;
  top: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  border-right: 1px solid ${themeCssVariables.border.color.light};
`;

type MonthBand = {
  firstDay: Temporal.PlainDate;
  daySpan: number;
  label: string;
};

const MONTH_LABELS = [
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

const computeMonthBands = (days: Temporal.PlainDate[]): MonthBand[] => {
  const bands: MonthBand[] = [];
  let currentBand: MonthBand | null = null;

  for (const day of days) {
    if (
      currentBand === null ||
      currentBand.firstDay.month !== day.month ||
      currentBand.firstDay.year !== day.year
    ) {
      currentBand = {
        firstDay: day,
        daySpan: 1,
        label: `${MONTH_LABELS[day.month - 1]} ${day.year}`,
      };
      bands.push(currentBand);
    } else {
      currentBand.daySpan += 1;
    }
  }
  return bands;
};

export const RecordRoadmapTimeHeader = ({
  days,
  viewportStart,
  dayWidthPx,
}: RecordRoadmapTimeHeaderProps) => {
  const monthBands = computeMonthBands(days);

  return (
    <StyledHeader>
      {monthBands.map((band) => {
        const offsetDays = viewportStart.until(band.firstDay, {
          largestUnit: 'days',
        }).days;
        return (
          <StyledMonthBand
            key={band.firstDay.toString()}
            style={{
              left: offsetDays * dayWidthPx,
              width: band.daySpan * dayWidthPx,
            }}
          >
            {band.label}
          </StyledMonthBand>
        );
      })}
      {days.map((day) => {
        const offsetDays = viewportStart.until(day, {
          largestUnit: 'days',
        }).days;
        return (
          <StyledDayCell
            key={day.toString()}
            style={{
              left: offsetDays * dayWidthPx,
              width: dayWidthPx,
            }}
          >
            {dayWidthPx >= 20 ? day.day : ''}
          </StyledDayCell>
        );
      })}
    </StyledHeader>
  );
};
