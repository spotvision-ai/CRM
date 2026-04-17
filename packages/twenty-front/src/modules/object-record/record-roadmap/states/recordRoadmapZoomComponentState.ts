import { RecordRoadmapComponentInstanceContext } from '@/object-record/record-roadmap/states/contexts/RecordRoadmapComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type ViewRoadmapZoom } from '~/generated-metadata/graphql';

import { ROADMAP_DEFAULT_ZOOM } from '@/object-record/record-roadmap/constants/RoadmapZoomLevels';

export const recordRoadmapZoomComponentState =
  createAtomComponentState<ViewRoadmapZoom>({
    key: 'recordRoadmapZoomComponentState',
    defaultValue: ROADMAP_DEFAULT_ZOOM,
    componentInstanceContext: RecordRoadmapComponentInstanceContext,
  });
