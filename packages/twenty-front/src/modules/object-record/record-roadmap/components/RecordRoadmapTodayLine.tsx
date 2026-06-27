import { styled } from '@linaria/react';
import { Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ROADMAP_HEADER_HEIGHT } from '@/object-record/record-roadmap/constants/RoadmapDimensions';

type RecordRoadmapTodayLineProps = {
  viewportStart: Temporal.PlainDate;
  dayWidthPx: number;
};

// "Today" highlight: a full-width column tinted with the brand blue so the
// current day pops at any zoom level. The left edge still draws a 2px solid
// stripe to anchor the eye when the column itself is narrow (DAY zoom in).
// Renders behind the bars (zIndex 0) so milestone content stays readable;
// the label badge sits above on zIndex 3 where it can't be obscured.
const StyledColumn = styled.div`
  background-color: ${themeCssVariables.background.transparent.blue};
  border-left: 0px solid ${themeCssVariables.accent.secondary};
  bottom: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  z-index: 0;
`;

// Pinned just under the sticky header so the "Today" pill is actually
// visible (at top:-18px it sat above the canvas, hidden behind the header).
const StyledLabel = styled.div`
  background-color: ${themeCssVariables.accent.secondary};
  border-radius: 4px;
  color: ${themeCssVariables.font.color.inverted};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  left: 0;
  padding: 1px ${themeCssVariables.spacing[1]};
  position: absolute;
  top: ${ROADMAP_HEADER_HEIGHT + 4}px;
  white-space: nowrap;
  z-index: 3;
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
    <StyledColumn style={{ left: leftPx, width: dayWidthPx }}>
      <StyledLabel>Today</StyledLabel>
    </StyledColumn>
  );
};
