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
  color: string | null;
  currentSwimlaneKey?: string | null;
  readOnly?: boolean;
  onCommit: (args: {
    recordId: string;
    startDate: Temporal.PlainDate;
    endDate: Temporal.PlainDate;
    targetSwimlaneKey?: string | null;
  }) => void;
  onOpenRecord?: (recordId: string) => void;
};

// Must match `StyledNameRow` in RecordRoadmapNameColumn pixel-for-pixel so
// the two panes' rows stay aligned through hundreds of rows of vertical
// scroll. `box-sizing: border-box` is the non-negotiable — without it the
// 1px border is added on top of height and each row drifts by one pixel.
const StyledRow = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
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
  color,
  currentSwimlaneKey,
  readOnly,
  onCommit,
  onOpenRecord,
}: RecordRoadmapRowProps) => (
  <StyledRow>
    <RecordRoadmapBar
      recordId={recordId}
      label={label}
      startDate={startDate}
      endDate={endDate}
      viewportStart={viewportStart}
      dayWidthPx={dayWidthPx}
      color={color}
      currentSwimlaneKey={currentSwimlaneKey}
      readOnly={readOnly}
      onCommit={onCommit}
      onClick={onOpenRecord}
    />
  </StyledRow>
);
