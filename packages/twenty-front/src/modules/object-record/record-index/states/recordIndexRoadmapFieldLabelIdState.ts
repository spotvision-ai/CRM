import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordIndexRoadmapFieldLabelIdState = createAtomState<
  string | null
>({
  key: 'recordIndexRoadmapFieldLabelIdState',
  defaultValue: null,
});
