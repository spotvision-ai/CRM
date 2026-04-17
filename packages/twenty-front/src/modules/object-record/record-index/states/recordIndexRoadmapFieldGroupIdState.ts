import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordIndexRoadmapFieldGroupIdState = createAtomState<
  string | null
>({
  key: 'recordIndexRoadmapFieldGroupIdState',
  defaultValue: null,
});
