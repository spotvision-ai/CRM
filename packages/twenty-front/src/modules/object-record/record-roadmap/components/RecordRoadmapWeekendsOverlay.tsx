import { styled } from '@linaria/react';
import { type Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type RecordRoadmapWeekendsOverlayProps = {
  days: Temporal.PlainDate[];
  viewportStart: Temporal.PlainDate;
  dayWidthPx: number;
};

const StyledWeekendColumn = styled.div`
  background-color: ${themeCssVariables.background.transparent.light};
  bottom: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  z-index: 0;
`;

export const RecordRoadmapWeekendsOverlay = ({
  days,
  viewportStart,
  dayWidthPx,
}: RecordRoadmapWeekendsOverlayProps) => {
  const weekendDays = days.filter((day) => {
    const weekday = day.dayOfWeek;
    return weekday === 6 || weekday === 7;
  });

  return (
    <>
      {weekendDays.map((day) => {
        const offsetDays = viewportStart.until(day, {
          largestUnit: 'days',
        }).days;
        return (
          <StyledWeekendColumn
            key={day.toString()}
            style={{
              left: offsetDays * dayWidthPx,
              width: dayWidthPx,
            }}
          />
        );
      })}
    </>
  );
};
