import { useCallback, useRef, useState } from 'react';
import { type Temporal } from 'temporal-polyfill';

type BarInteractionMode = 'move' | 'resize-start' | 'resize-end';

type UseRecordRoadmapBarInteractionArgs = {
  recordId: string;
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  dayWidthPx: number;
  /** Swimlane key the record currently lives in. Used to detect a cross-
      swimlane drop only when the target differs from the source. */
  currentSwimlaneKey?: string | null;
  onCommit: (args: {
    recordId: string;
    startDate: Temporal.PlainDate;
    endDate: Temporal.PlainDate;
    targetSwimlaneKey?: string | null;
    /** Record id of the row the bar was released over, when that row lives in
        the same swimlane as the source. Signals "reorder by position" to the
        caller; date/swimlane commits are skipped in that case. */
    targetRowRecordId?: string | null;
  }) => void;
  /** Fired on pointerup when the user pressed and released without moving
      the bar — treated as a click and mapped to "open record detail". */
  onClick?: (recordId: string) => void;
};

// Swimlane containers tag their own wrapper with this data attribute so
// pointer-up resolves the target swimlane via elementFromPoint rather than
// maintaining row-to-swimlane maps in React state.
const SWIMLANE_DATA_ATTR = 'data-roadmap-swimlane-key';
const ROW_DATA_ATTR = 'data-roadmap-record-id';

const findSwimlaneKeyAtPoint = (
  clientX: number,
  clientY: number,
): string | null => {
  const element = document.elementFromPoint(clientX, clientY);
  if (element === null) return null;
  const swimlane = element.closest(`[${SWIMLANE_DATA_ATTR}]`);
  if (swimlane === null) return null;
  return swimlane.getAttribute(SWIMLANE_DATA_ATTR);
};

const findRowRecordIdAtPoint = (
  clientX: number,
  clientY: number,
): string | null => {
  const element = document.elementFromPoint(clientX, clientY);
  if (element === null) return null;
  const row = element.closest(`[${ROW_DATA_ATTR}]`);
  if (row === null) return null;
  return row.getAttribute(ROW_DATA_ATTR);
};

type InProgressDrag = {
  mode: BarInteractionMode;
  initialClientX: number;
  initialClientY: number;
  pointerId: number;
};

const DROP_TARGET_DATA_ATTR = 'data-roadmap-drop-target';

// Paints the blue drop indicator on the row currently under the cursor and
// clears it from the previous one. Runs on every pointermove so the target
// tracks fluidly; DOM-mutation-only to avoid re-rendering every row on a
// 500-record swimlane.
const updateDropTargetHighlight = ({
  previousElement,
  clientX,
  clientY,
  sourceRecordId,
}: {
  previousElement: Element | null;
  clientX: number;
  clientY: number;
  sourceRecordId: string;
}): Element | null => {
  const hit = document.elementFromPoint(clientX, clientY);
  const row = hit?.closest('[data-roadmap-record-id]') ?? null;
  const rowRecordId = row?.getAttribute('data-roadmap-record-id') ?? null;
  const nextElement =
    row !== null && rowRecordId !== null && rowRecordId !== sourceRecordId
      ? row
      : null;
  if (previousElement !== null && previousElement !== nextElement) {
    previousElement.removeAttribute(DROP_TARGET_DATA_ATTR);
  }
  if (nextElement !== null) {
    nextElement.setAttribute(DROP_TARGET_DATA_ATTR, '');
  }
  return nextElement;
};

const clearDropTargetHighlight = (element: Element | null) => {
  if (element !== null) {
    element.removeAttribute(DROP_TARGET_DATA_ATTR);
  }
};

// Encapsulates the pointer-down → move → up lifecycle for a single roadmap
// bar. Rather than piping a full react-DnD setup, this uses native pointer
// capture for crispness and reach (no scroll container quirks) and tracks a
// transient `deltaDays` in React state so the bar can render at its new
// position immediately while the commit fires only on pointerup.
export const useRecordRoadmapBarInteraction = ({
  recordId,
  startDate,
  endDate,
  dayWidthPx,
  currentSwimlaneKey,
  onCommit,
  onClick,
}: UseRecordRoadmapBarInteractionArgs) => {
  const [deltaDays, setDeltaDays] = useState(0);
  const [deltaYPx, setDeltaYPx] = useState(0);
  const [mode, setMode] = useState<BarInteractionMode | null>(null);
  // oxlint-disable-next-line twenty/no-state-useref
  const dragRef = useRef<InProgressDrag | null>(null);
  // oxlint-disable-next-line twenty/no-state-useref
  const dropTargetRef = useRef<Element | null>(null);

  const resolveDeltaDays = (currentClientX: number): number => {
    if (dragRef.current === null || dayWidthPx === 0) {
      return 0;
    }
    const deltaPx = currentClientX - dragRef.current.initialClientX;
    return Math.round(deltaPx / dayWidthPx);
  };

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (dragRef.current === null) return;
      if (event.pointerId !== dragRef.current.pointerId) return;
      setDeltaDays(resolveDeltaDays(event.clientX));
      // Only tracked on `move` drags — resize handles stay horizontal-only
      // so the bar doesn't appear to float vertically while the user is
      // just stretching an end.
      if (dragRef.current.mode === 'move') {
        setDeltaYPx(event.clientY - dragRef.current.initialClientY);
        dropTargetRef.current = updateDropTargetHighlight({
          previousElement: dropTargetRef.current,
          clientX: event.clientX,
          clientY: event.clientY,
          sourceRecordId: recordId,
        });
      }
    },
    // dayWidthPx is read via closure; the handler is re-created when it
    // changes (useCallback dependency), which re-binds the listeners on the
    // next pointerdown. Fine for our use: mouse doesn't stay down across
    // zoom changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dayWidthPx, recordId],
  );

  const reset = useCallback(() => {
    dragRef.current = null;
    setDeltaDays(0);
    setDeltaYPx(0);
    setMode(null);
    clearDropTargetHighlight(dropTargetRef.current);
    dropTargetRef.current = null;
  }, []);

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      const drag = dragRef.current;
      if (drag === null || event.pointerId !== drag.pointerId) return;

      const finalDelta = resolveDeltaDays(event.clientX);
      const target = event.target as HTMLElement | null;
      target?.releasePointerCapture?.(drag.pointerId);
      target?.removeEventListener('pointermove', handlePointerMove);
      target?.removeEventListener('pointerup', handlePointerUp);
      target?.removeEventListener('pointercancel', handlePointerUp);

      const droppedSwimlaneKey = findSwimlaneKeyAtPoint(
        event.clientX,
        event.clientY,
      );
      const droppedRowRecordId = findRowRecordIdAtPoint(
        event.clientX,
        event.clientY,
      );

      // Reorder-by-position: a `move` drop that lands on a different row of
      // the *same* swimlane. We route this to the commit with only
      // `targetRowRecordId` set — the caller then computes the new position
      // and skips the date/group update so the bar stays in place
      // horizontally while climbing or dropping rows. Cross-swimlane drops
      // fall through to the existing date+group path below.
      const isSameSwimlaneRowDrop =
        drag.mode === 'move' &&
        droppedRowRecordId !== null &&
        droppedRowRecordId !== recordId &&
        (droppedSwimlaneKey === null ||
          droppedSwimlaneKey === currentSwimlaneKey);

      if (isSameSwimlaneRowDrop) {
        onCommit({
          recordId,
          startDate,
          endDate,
          targetRowRecordId: droppedRowRecordId,
        });
        reset();
        return;
      }

      const targetSwimlaneKey =
        drag.mode === 'move' &&
        droppedSwimlaneKey !== null &&
        droppedSwimlaneKey !== currentSwimlaneKey
          ? droppedSwimlaneKey
          : undefined;

      if (finalDelta !== 0 || targetSwimlaneKey !== undefined) {
        let newStart = startDate;
        let newEnd = endDate;
        if (drag.mode === 'move') {
          newStart = startDate.add({ days: finalDelta });
          newEnd = endDate.add({ days: finalDelta });
        } else if (drag.mode === 'resize-start') {
          newStart = startDate.add({ days: finalDelta });
        } else if (drag.mode === 'resize-end') {
          newEnd = endDate.add({ days: finalDelta });
        }
        onCommit({
          recordId,
          startDate: newStart,
          endDate: newEnd,
          targetSwimlaneKey,
        });
      } else if (drag.mode === 'move' && onClick !== undefined) {
        // No positional change and the pointer started on the bar body (not
        // on a resize handle) → treat as a click and open the record. We
        // deliberately skip clicks on resize-start/end so accidentally
        // grabbing an edge without moving doesn't open the detail panel.
        onClick(recordId);
      }

      reset();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      startDate,
      endDate,
      recordId,
      currentSwimlaneKey,
      onCommit,
      onClick,
      handlePointerMove,
      reset,
    ],
  );

  const startInteraction = useCallback(
    (event: React.PointerEvent<HTMLElement>, nextMode: BarInteractionMode) => {
      // Primary button only (ignore right/middle click and touch/pen gestures
      // that could also trigger contextual menus).
      if (event.button !== 0) return;
      event.stopPropagation();
      event.preventDefault();

      dragRef.current = {
        mode: nextMode,
        initialClientX: event.clientX,
        initialClientY: event.clientY,
        pointerId: event.pointerId,
      };
      setMode(nextMode);

      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);
      target.addEventListener('pointermove', handlePointerMove);
      target.addEventListener('pointerup', handlePointerUp);
      target.addEventListener('pointercancel', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp],
  );

  return {
    deltaDays,
    deltaYPx,
    mode,
    onPointerDownMove: (event: React.PointerEvent<HTMLElement>) =>
      startInteraction(event, 'move'),
    onPointerDownResizeStart: (event: React.PointerEvent<HTMLElement>) =>
      startInteraction(event, 'resize-start'),
    onPointerDownResizeEnd: (event: React.PointerEvent<HTMLElement>) =>
      startInteraction(event, 'resize-end'),
  };
};
