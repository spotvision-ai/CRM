import { RecordRoadmapComponentInstanceContext } from '@/object-record/record-roadmap/states/contexts/RecordRoadmapComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { ROADMAP_NAME_COLUMN_WIDTH } from '@/object-record/record-roadmap/constants/RoadmapDimensions';

// User-resizable width (px) of the left "Name" column. Defaults to the shared
// constant; the drag-divider in the timeline writes new values here. Scoped to
// the roadmap instance so it survives zoom/scroll but resets per view mount —
// it's a viewing preference, not persisted server-side.
export const recordRoadmapNameColumnWidthComponentState =
  createAtomComponentState<number>({
    key: 'recordRoadmapNameColumnWidthComponentState',
    defaultValue: ROADMAP_NAME_COLUMN_WIDTH,
    componentInstanceContext: RecordRoadmapComponentInstanceContext,
  });
