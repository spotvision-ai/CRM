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
  currentSwimlaneKey?: string | null;
  onCommit: (args: {
    recordId: string;
    startDate: Temporal.PlainDate;
    endDate: Temporal.PlainDate;
    targetSwimlaneKey?: string | null;
  }) => void;
};

const StyledRow = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  height: ${ROADMAP_ROW_HEIGHT}px;
  position: relative;
`;

export const RecordRoadmapRow = ({
  recordId,
  label,
  startDate,
  endDate,
  viewportStart,
  dayWidthPx,
  currentSwimlaneKey,
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
      currentSwimlaneKey={currentSwimlaneKey}
      onCommit={onCommit}
    />
  </StyledRow>
);
