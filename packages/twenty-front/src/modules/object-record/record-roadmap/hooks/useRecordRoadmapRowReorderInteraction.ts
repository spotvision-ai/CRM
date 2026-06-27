import { useCallback, useRef, useState } from 'react';

import {
  clearRoadmapDropTargetHighlight,
  findRoadmapRowRecordIdAtPoint,
  updateRoadmapDropTargetHighlight,
} from '@/object-record/record-roadmap/utils/recordRoadmapRowDragDom';

type UseRecordRoadmapRowReorderInteractionArgs = {
  // Fires on pointerup when the grip was released over a different row than
  // the one it started on. The caller computes the new `position` and persists
  // it (same path the bar-drag reorder uses).
  onReorder: (args: { recordId: string; targetRowRecordId: string }) => void;
};

// Discoverable, Notion-style reorder: the name column renders a grip handle
// per row; pressing it starts a vertical drag that highlights the row under
// the cursor and, on release, reorders by position. A single hook instance
// serves the whole column (the active record id is tracked in a ref), so we
// don't mount one hook per row. It reuses the same `data-roadmap-record-id`
// row resolution + inset-shadow drop indicator as the bar drag, so both
// gestures feel identical. Pointer capture keeps the drag alive across the
// row dividers without a global listener.
export const useRecordRoadmapRowReorderInteraction = ({
  onReorder,
}: UseRecordRoadmapRowReorderInteractionArgs) => {
  const [draggingRecordId, setDraggingRecordId] = useState<string | null>(null);
  // oxlint-disable-next-line twenty/no-state-useref
  const dragRef = useRef<{ pointerId: number; recordId: string } | null>(null);
  // oxlint-disable-next-line twenty/no-state-useref
  const dropTargetRef = useRef<Element | null>(null);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    const drag = dragRef.current;
    if (drag === null || event.pointerId !== drag.pointerId) return;
    dropTargetRef.current = updateRoadmapDropTargetHighlight({
      previousElement: dropTargetRef.current,
      clientX: event.clientX,
      clientY: event.clientY,
      sourceRecordId: drag.recordId,
    });
  }, []);

  const reset = useCallback(() => {
    dragRef.current = null;
    setDraggingRecordId(null);
    clearRoadmapDropTargetHighlight(dropTargetRef.current);
    dropTargetRef.current = null;
  }, []);

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      const drag = dragRef.current;
      if (drag === null || event.pointerId !== drag.pointerId) return;

      const target = event.target as HTMLElement | null;
      target?.releasePointerCapture?.(drag.pointerId);
      target?.removeEventListener('pointermove', handlePointerMove);
      target?.removeEventListener('pointerup', handlePointerUp);
      target?.removeEventListener('pointercancel', handlePointerUp);

      const droppedRowRecordId = findRoadmapRowRecordIdAtPoint(
        event.clientX,
        event.clientY,
      );
      if (droppedRowRecordId !== null && droppedRowRecordId !== drag.recordId) {
        onReorder({
          recordId: drag.recordId,
          targetRowRecordId: droppedRowRecordId,
        });
      }
      reset();
    },
    [handlePointerMove, onReorder, reset],
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLElement>, recordId: string) => {
      // Primary button only.
      if (event.button !== 0) return;
      // Stop the row's click-to-open and the bar/canvas pointer handlers from
      // also reacting — grabbing the grip is exclusively a reorder gesture.
      event.stopPropagation();
      event.preventDefault();

      dragRef.current = { pointerId: event.pointerId, recordId };
      setDraggingRecordId(recordId);

      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);
      target.addEventListener('pointermove', handlePointerMove);
      target.addEventListener('pointerup', handlePointerUp);
      target.addEventListener('pointercancel', handlePointerUp);
    },
    [handlePointerMove, handlePointerUp],
  );

  return { draggingRecordId, onPointerDown };
};
