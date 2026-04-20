import { isDefined } from 'twenty-shared/utils';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordIndexRoadmapDataLoaderEffect } from '@/object-record/record-roadmap/components/RecordIndexRoadmapDataLoaderEffect';
import { RecordRoadmap } from '@/object-record/record-roadmap/components/RecordRoadmap';
import { RecordRoadmapSSESubscribeEffect } from '@/object-record/record-roadmap/components/RecordRoadmapSSESubscribeEffect';
import { RecordRoadmapContextProvider } from '@/object-record/record-roadmap/contexts/RecordRoadmapContext';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

type RecordIndexRoadmapContainerProps = {
  recordRoadmapInstanceId: string;
  viewBarInstanceId: string;
};

export const RecordIndexRoadmapContainer = ({
  viewBarInstanceId,
  recordRoadmapInstanceId,
}: RecordIndexRoadmapContainerProps) => {
  const { objectNameSingular } = useRecordIndexContextOrThrow();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const { currentView } = useGetCurrentViewOnly();

  if (
    !isDefined(currentView) ||
    !isDefined(currentView.roadmapFieldStartId) ||
    !isDefined(currentView.roadmapFieldEndId)
  ) {
    return null;
  }

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={recordRoadmapInstanceId}
    >
      <RecordRoadmapContextProvider
        value={{
          viewBarInstanceId,
          objectNameSingular,
          visibleRecordFields: [],
          objectMetadataItem,
          objectPermissions,
        }}
      >
        <RecordRoadmap />
        <RecordRoadmapSSESubscribeEffect />
        <RecordIndexRoadmapDataLoaderEffect />
      </RecordRoadmapContextProvider>
    </RecordComponentInstanceContextsWrapper>
  );
};
