import { useEffect } from 'react';

import { recordRoadmapZoomComponentState } from '@/object-record/record-roadmap/states/recordRoadmapZoomComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { ViewRoadmapZoom } from '~/generated-metadata/graphql';

// Matches the UI selector options. MONTH stays in the enum for back-compat
// with persisted views, but is intentionally skipped by the wheel cycle.
const ZOOM_ORDER: ViewRoadmapZoom[] = [
  ViewRoadmapZoom.QUARTER,
  ViewRoadmapZoom.WEEK,
  ViewRoadmapZoom.DAY,
];

// Attaches a `wheel` listener to the given ref. Ctrl or Cmd + wheel steps
// through the zoom levels; plain wheel events are left alone so the user's
// native scroll behavior is preserved. We use non-passive so we can
// preventDefault on the zoom gesture (otherwise the page would also scroll).
export const useRecordRoadmapWheelZoom = (
  targetRef: React.RefObject<HTMLElement | null>,
) => {
  const [recordRoadmapZoom, setRecordRoadmapZoom] = useAtomComponentState(
    recordRoadmapZoomComponentState,
  );

  useEffect(() => {
    const node = targetRef.current;
    if (node === null) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }
      event.preventDefault();

      const currentIndex = ZOOM_ORDER.indexOf(recordRoadmapZoom);
      if (currentIndex === -1) {
        return;
      }

      // Positive deltaY (scroll down) = zoom out (more days per pixel).
      // Negative deltaY (scroll up) = zoom in. Match Google-Maps-ish
      // expectation even if the CSS units feel inverted.
      const direction = event.deltaY > 0 ? -1 : 1;
      const nextIndex = Math.max(
        0,
        Math.min(ZOOM_ORDER.length - 1, currentIndex + direction),
      );
      const nextZoom = ZOOM_ORDER[nextIndex];

      if (nextZoom !== recordRoadmapZoom) {
        setRecordRoadmapZoom(nextZoom);
      }
    };

    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      node.removeEventListener('wheel', handleWheel);
    };
  }, [targetRef, recordRoadmapZoom, setRecordRoadmapZoom]);
};
