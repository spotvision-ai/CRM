import { hasObjectMetadataItemPositionField } from '@/object-metadata/utils/hasObjectMetadataItemPositionField';
import { useRecordRoadmapContextOrThrow } from '@/object-record/record-roadmap/contexts/RecordRoadmapContext';
import { RecordRoadmapComponentInstanceContext } from '@/object-record/record-roadmap/states/contexts/RecordRoadmapComponentInstanceContext';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

// Subscribes the Roadmap view to the record-events stream so server-side
// record creations/updates/deletes flow into the Apollo cache without a
// manual refetch. The Roadmap fetch hook does not bound its query by date
// (Fase 5 performance task will), so no filter is declared here either —
// every record in scope is watched.
export const RecordRoadmapSSESubscribeEffect = () => {
  const recordRoadmapId = useAvailableComponentInstanceIdOrThrow(
    RecordRoadmapComponentInstanceContext,
  );
  const { objectMetadataItem } = useRecordRoadmapContextOrThrow();

  const orderBy: RecordGqlOperationOrderBy =
    !objectMetadataItem.isRemote &&
    hasObjectMetadataItemPositionField(objectMetadataItem)
      ? [
          {
            position: 'AscNullsFirst',
          },
        ]
      : [];

  const queryId = `record-roadmap-${recordRoadmapId}`;

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      objectNameSingular: objectMetadataItem.nameSingular,
      variables: {
        filter: {},
        orderBy,
      },
    },
  });

  return null;
};
