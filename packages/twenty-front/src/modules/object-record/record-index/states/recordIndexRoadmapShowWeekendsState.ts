import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordIndexRoadmapShowWeekendsState = createAtomState<boolean>({
  key: 'recordIndexRoadmapShowWeekendsState',
  defaultValue: true,
});
