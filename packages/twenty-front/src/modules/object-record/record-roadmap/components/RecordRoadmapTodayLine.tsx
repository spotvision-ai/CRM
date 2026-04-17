import { styled } from '@linaria/react';
import { Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type RecordRoadmapTodayLineProps = {
  viewportStart: Temporal.PlainDate;
  dayWidthPx: number;
};

const StyledLine = styled.div`
  background-color: ${themeCssVariables.accent.secondary};
  bottom: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 1px;
  z-index: 2;
`;

const StyledLabel = styled.div`
  background-color: ${themeCssVariables.accent.secondary};
  border-radius: 2px;
  color: ${themeCssVariables.font.color.inverted};
  font-size: ${themeCssVariables.font.size.xs};
  padding: 0 ${themeCssVariables.spacing[1]};
  position: absolute;
  top: -18px;
  transform: translateX(-50%);
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
