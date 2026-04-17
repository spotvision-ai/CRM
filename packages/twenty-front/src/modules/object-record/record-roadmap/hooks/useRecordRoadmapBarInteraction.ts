import { useCallback, useRef, useState } from 'react';
import { type Temporal } from 'temporal-polyfill';

type BarInteractionMode = 'move' | 'resize-start' | 'resize-end';

type UseRecordRoadmapBarInteractionArgs = {
  recordId: string;
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  dayWidthPx: number;
  onCommit: (args: {
    recordId: string;
    startDate: Temporal.PlainDate;
    endDate: Temporal.PlainDate;
  }) => void;
};

type InProgressDrag = {
  mode: BarInteractionMode;
  initialClientX: number;
  pointerId: number;
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
  onCommit,
}: UseRecordRoadmapBarInteractionArgs) => {
  const [deltaDays, setDeltaDays] = useState(0);
  const [mode, setMode] = useState<BarInteractionMode | null>(null);
  const dragRef = useRef<InProgressDrag | null>(null);

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
    },
    // dayWidthPx is read via closure; the handler is re-created when it
    // changes (useCallback dependency), which re-binds the listeners on the
    // next pointerdown. Fine for our use: mouse doesn't stay down across
    // zoom changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dayWidthPx],
  );

  const reset = useCallback(() => {
    dragRef.current = null;
    setDeltaDays(0);
    setMode(null);
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

      if (finalDelta !== 0) {
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
        onCommit({ recordId, startDate: newStart, endDate: newEnd });
      }

      reset();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startDate, endDate, recordId, onCommit, handlePointerMove, reset],
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
    mode,
    onPointerDownMove: (event: React.PointerEvent<HTMLElement>) =>
      startInteraction(event, 'move'),
    onPointerDownResizeStart: (event: React.PointerEvent<HTMLElement>) =>
      startInteraction(event, 'resize-start'),
    onPointerDownResizeEnd: (event: React.PointerEvent<HTMLElement>) =>
      startInteraction(event, 'resize-end'),
  };
};
