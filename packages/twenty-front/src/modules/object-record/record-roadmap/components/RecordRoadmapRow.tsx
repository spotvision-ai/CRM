import { styled } from '@linaria/react';
import { type Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ROADMAP_ROW_HEIGHT } from '@/object-record/record-roadmap/constants/RoadmapDimensions';
import { RecordRoadmapBar } from '@/object-record/record-roadmap/components/RecordRoadmapBar';

type RecordRoadmapRowProps = {
  label: string;
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  viewportStart: Temporal.PlainDate;
  dayWidthPx: number;
};

const StyledRow = styled.div`
  position: relative;
  height: ${ROADMAP_ROW_HEIGHT}px;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

export const RecordRoadmapRow = ({
  label,
  startDate,
  endDate,
  viewportStart,
  dayWidthPx,
}: RecordRoadmapRowProps) => (
  <StyledRow>
    <RecordRoadmapBar
      label={label}
      startDate={startDate}
      endDate={endDate}
      viewportStart={viewportStart}
      dayWidthPx={dayWidthPx}
    />
  </StyledRow>
);
