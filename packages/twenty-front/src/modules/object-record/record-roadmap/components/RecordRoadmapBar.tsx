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
  position: absolute;
  top: ${ROADMAP_BAR_VERTICAL_PADDING}px;
  height: ${ROADMAP_BAR_HEIGHT}px;
  display: flex;
  align-items: center;
  padding: 0 ${themeCssVariables.spacing[2]};
  border-radius: 4px;
  background-color: ${(props) =>
    props.isDragging
      ? themeCssVariables.background.tertiary
      : themeCssVariables.background.secondary};
  border: 1px solid
    ${(props) =>
      props.hasError
        ? themeCssVariables.border.color.danger
        : themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  opacity: ${(props) => (props.isDragging ? 0.85 : 1)};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: grab;
  user-select: none;
  touch-action: none;

  &:hover {
    background-color: ${themeCssVariables.background.tertiary};
  }

  &:active {
    cursor: grabbing;
  }
`;

const StyledResizeHandle = styled.div<{ side: 'left' | 'right' }>`
  position: absolute;
  top: 0;
  ${(props) => (props.side === 'left' ? 'left: 0;' : 'right: 0;')}
  height: 100%;
  width: ${RESIZE_HANDLE_WIDTH}px;
  cursor: ew-resize;
  touch-action: none;
  /* The handle sits on top of the draggable body; z-index keeps it clickable
     without stealing hover from the label content behind it. */
  z-index: 1;
`;

type RecordRoadmapBarProps = {
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

export const RecordRoadmapBar = ({
  recordId,
  label,
  startDate,
  endDate,
  viewportStart,
  dayWidthPx,
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
      style={{ left: leftPx, width: widthPx }}
      onPointerDown={onPointerDownMove}
      title={
        hasError
          ? `End date is before start date (${previewStart.toString()} → ${previewEnd.toString()})`
          : `${label} (${previewStart.toString()} → ${previewEnd.toString()})`
      }
    >
      <StyledResizeHandle
        side="left"
        onPointerDown={onPointerDownResizeStart}
      />
      {label}
      <StyledResizeHandle side="right" onPointerDown={onPointerDownResizeEnd} />
    </StyledBar>
  );
};
