// Shared DOM helpers for vertical row-reorder drags. Both gestures that can
// reorder a roadmap row — dragging the bar itself (useRecordRoadmapBarInteraction)
// and dragging the name-column grip handle (useRecordRoadmapRowReorderInteraction)
// — resolve the row under the cursor via `elementFromPoint` + a data attribute
// and paint the same inset-shadow drop indicator. Keeping it here keeps the two
// gestures pixel-identical and avoids re-rendering every row on a 500-row lane.

export const ROADMAP_ROW_DATA_ATTR = 'data-roadmap-record-id';
export const ROADMAP_DROP_TARGET_DATA_ATTR = 'data-roadmap-drop-target';

export const findRoadmapRowRecordIdAtPoint = (
  clientX: number,
  clientY: number,
): string | null => {
  const element = document.elementFromPoint(clientX, clientY);
  const row = element?.closest(`[${ROADMAP_ROW_DATA_ATTR}]`) ?? null;
  return row?.getAttribute(ROADMAP_ROW_DATA_ATTR) ?? null;
};

// Paints the drop indicator on the row currently under the cursor and clears
// it from the previously highlighted one. DOM-mutation only (no React state)
// so dragging stays smooth across hundreds of rows. The source row never
// highlights itself.
export const updateRoadmapDropTargetHighlight = ({
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
  const row = hit?.closest(`[${ROADMAP_ROW_DATA_ATTR}]`) ?? null;
  const rowRecordId = row?.getAttribute(ROADMAP_ROW_DATA_ATTR) ?? null;
  const nextElement =
    row !== null && rowRecordId !== null && rowRecordId !== sourceRecordId
      ? row
      : null;
  if (previousElement !== null && previousElement !== nextElement) {
    previousElement.removeAttribute(ROADMAP_DROP_TARGET_DATA_ATTR);
  }
  if (nextElement !== null) {
    nextElement.setAttribute(ROADMAP_DROP_TARGET_DATA_ATTR, '');
  }
  return nextElement;
};

export const clearRoadmapDropTargetHighlight = (element: Element | null) => {
  if (element !== null) {
    element.removeAttribute(ROADMAP_DROP_TARGET_DATA_ATTR);
  }
};
