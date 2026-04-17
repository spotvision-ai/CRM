import { styled } from '@linaria/react';
import { type Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  ROADMAP_BAR_HEIGHT,
  ROADMAP_BAR_VERTICAL_PADDING,
} from '@/object-record/record-roadmap/constants/RoadmapDimensions';
import { useRecordRoadmapBarInteraction } from '@/object-record/record-roadmap/hooks/useRecordRoadmapBarInteraction';
import { computeRoadmapBarPosition } from '@/object-record/record-roadmap/utils/computeRoadmapBarPosition';

const RESIZE_HANDLE_WIDTH = 6;

const StyledBar = styled.div<{ hasError: boolean; isDragging: boolean }>`
  align-items: center;
  background-color: ${(props) =>
    props.isDragging
      ? themeCssVariables.background.tertiary
      : themeCssVariables.background.secondary};
  border: 1px solid
    ${(props) =>
      props.hasError
        ? themeCssVariables.border.color.danger
        : themeCssVariables.border.color.medium};
  border-radius: 4px;
  color: ${themeCssVariables.font.color.primary};
  cursor: grab;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  height: ${ROADMAP_BAR_HEIGHT}px;
  opacity: ${(props) => (props.isDragging ? 0.85 : 1)};
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
  position: absolute;
  text-overflow: ellipsis;
  top: ${ROADMAP_BAR_VERTICAL_PADDING}px;
  touch-action: none;
  user-select: none;
  white-space: nowrap;

  &:hover {
    background-color: ${themeCssVariables.background.tertiary};
  }

  &:active {
    cursor: grabbing;
  }
`;

// Linaria compiles CSS statically so we can't interpolate a whole
// `left: 0;` vs `right: 0;` declaration from a prop. Two siblings — shared
// styling, different edge — keep each handle anchored reliably.
const StyledResizeHandleBase = styled.div`
  cursor: ew-resize;
  height: 100%;
  position: absolute;
  top: 0;
  touch-action: none;
  width: ${RESIZE_HANDLE_WIDTH}px;
  /* Sits above the draggable body so pointer-down reaches the handle first. */
  z-index: 1;
`;

const StyledResizeHandleLeft = styled(StyledResizeHandleBase)`
  left: 0;
`;

const StyledResizeHandleRight = styled(StyledResizeHandleBase)`
  right: 0;
`;

type RecordRoadmapBarProps = {
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

export const RecordRoadmapBar = ({
  recordId,
  label,
  startDate,
  endDate,
  viewportStart,
  dayWidthPx,
  currentSwimlaneKey,
  onCommit,
}: RecordRoadmapBarProps) => {
  const {
    deltaDays,
    mode,
    onPointerDownMove,
    onPointerDownResizeStart,
    onPointerDownResizeEnd,
  } = useRecordRoadmapBarInteraction({
    recordId,
    startDate,
    endDate,
    dayWidthPx,
    currentSwimlaneKey,
    onCommit,
  });

  // Apply the transient drag delta to the rendered position so the bar
  // follows the cursor in real time. The commit fires on pointerup; until
  // then the Apollo cache still holds the original dates.
  const previewStart =
    mode === 'move' || mode === 'resize-start'
      ? startDate.add({ days: deltaDays })
      : startDate;
  const previewEnd =
    mode === 'move' || mode === 'resize-end'
      ? endDate.add({ days: deltaDays })
      : endDate;

  const { leftPx, widthPx, durationDays } = computeRoadmapBarPosition({
    startDate: previewStart,
    endDate: previewEnd,
    viewportStart,
    dayWidthPx,
  });

  const hasError = durationDays < 0;

  return (
    <StyledBar
      hasError={hasError}
      isDragging={mode !== null}
      data-roadmap-bar
      style={{ left: leftPx, width: widthPx }}
      onPointerDown={onPointerDownMove}
      title={
        hasError
          ? `End date is before start date (${previewStart.toString()} → ${previewEnd.toString()})`
          : `${label} (${previewStart.toString()} → ${previewEnd.toString()})`
      }
    >
      <StyledResizeHandleLeft onPointerDown={onPointerDownResizeStart} />
      {label}
      <StyledResizeHandleRight onPointerDown={onPointerDownResizeEnd} />
    </StyledBar>
  );
};
