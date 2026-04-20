import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordIndexRoadmapFieldStartIdState = createAtomState<
  string | null
>({
  key: 'recordIndexRoadmapFieldStartIdState',
  defaultValue: null,
});
