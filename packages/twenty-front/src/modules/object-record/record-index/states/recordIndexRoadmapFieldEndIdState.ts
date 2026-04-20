import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordIndexRoadmapFieldEndIdState = createAtomState<string | null>(
  {
    key: 'recordIndexRoadmapFieldEndIdState',
    defaultValue: null,
  },
);
