import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const recordIndexRoadmapShowTodayState = createAtomState<boolean>({
  key: 'recordIndexRoadmapShowTodayState',
  defaultValue: true,
});
