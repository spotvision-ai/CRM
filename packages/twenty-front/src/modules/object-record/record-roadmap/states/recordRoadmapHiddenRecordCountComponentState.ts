import { RecordRoadmapComponentInstanceContext } from '@/object-record/record-roadmap/states/contexts/RecordRoadmapComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Records that are fetched but have null start OR null end — they can't be
// placed on the timeline. The TopBar shows this count as "N records hidden".
export const recordRoadmapHiddenRecordCountComponentState =
  createAtomComponentState<number>({
    key: 'recordRoadmapHiddenRecordCountComponentState',
    defaultValue: 0,
    componentInstanceContext: RecordRoadmapComponentInstanceContext,
  });
