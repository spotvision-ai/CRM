import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordIndexRoadmapFieldColorIdState = createAtomState<
  string | null
>({
  key: 'recordIndexRoadmapFieldColorIdState',
  defaultValue: null,
});
