import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ViewRoadmapZoom } from '~/generated-metadata/graphql';

export const recordIndexRoadmapDefaultZoomState =
  createAtomState<ViewRoadmapZoom | null>({
    key: 'recordIndexRoadmapDefaultZoomState',
    defaultValue: null,
  });
