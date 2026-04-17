import { styled } from '@linaria/react';
import { Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type RecordRoadmapTodayLineProps = {
  viewportStart: Temporal.PlainDate;
  dayWidthPx: number;
};

const StyledLine = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: ${themeCssVariables.accent.secondary};
  pointer-events: none;
  z-index: 2;
`;

const StyledLabel = styled.div`
  position: absolute;
  top: -18px;
  transform: translateX(-50%);
  padding: 0 ${themeCssVariables.spacing[1]};
  background-color: ${themeCssVariables.accent.secondary};
  color: ${themeCssVariables.font.color.inverted};
  border-radius: 2px;
  font-size: ${themeCssVariables.font.size.xs};
`;

export const RecordRoadmapTodayLine = ({
  viewportStart,
  dayWidthPx,
}: RecordRoadmapTodayLineProps) => {
  const today = Temporal.Now.plainDateISO();
  const daysFromStart = viewportStart.until(today, {
    largestUnit: 'days',
  }).days;
  const leftPx = daysFromStart * dayWidthPx;

  return (
    <StyledLine style={{ left: leftPx }}>
      <StyledLabel>Today</StyledLabel>
    </StyledLine>
  );
};
