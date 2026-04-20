import { RecordRoadmapComponentInstanceContext } from '@/object-record/record-roadmap/states/contexts/RecordRoadmapComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordRoadmapRecordIdsComponentState = createAtomComponentState<
  string[]
>({
  key: 'recordRoadmapRecordIdsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordRoadmapComponentInstanceContext,
});
