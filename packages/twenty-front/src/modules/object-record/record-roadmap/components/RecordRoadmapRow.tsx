import { styled } from '@linaria/react';
import { type Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordRoadmapBar } from '@/object-record/record-roadmap/components/RecordRoadmapBar';
import { ROADMAP_ROW_HEIGHT } from '@/object-record/record-roadmap/constants/RoadmapDimensions';

type RecordRoadmapRowProps = {
  recordId: string;
  label: string;
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  viewportStart: Temporal.PlainDate;
  dayWidthPx: number;
  onCommit: (args: {
    recordId: string;
    startDate: Temporal.PlainDate;
    endDate: Temporal.PlainDate;
  }) => void;
};

const StyledRow = styled.div`
  position: relative;
  height: ${ROADMAP_ROW_HEIGHT}px;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

export const RecordRoadmapRow = ({
  recordId,
  label,
  startDate,
  endDate,
  viewportStart,
  dayWidthPx,
  onCommit,
}: RecordRoadmapRowProps) => (
  <StyledRow>
    <RecordRoadmapBar
      recordId={recordId}
      label={label}
      startDate={startDate}
      endDate={endDate}
      viewportStart={viewportStart}
      dayWidthPx={dayWidthPx}
      onCommit={onCommit}
    />
  </StyledRow>
);
