import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRecordRoadmapContextOrThrow } from '@/object-record/record-roadmap/contexts/RecordRoadmapContext';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { recordIndexRoadmapFieldEndIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldEndIdState';
import { recordIndexRoadmapFieldStartIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldStartIdState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Fase 3 MVP: fetch the object records and let the component layer figure out
// which ones can be placed on the timeline. A viewport-bounded filter is
// planned for the Fase 5 performance work; for ≤500 records this is fine.
export const useRecordRoadmapFetchRecords = () => {
  const { objectMetadataItem } = useRecordRoadmapContextOrThrow();

  const startFieldMetadataId = useAtomStateValue(
    recordIndexRoadmapFieldStartIdState,
  );
  const endFieldMetadataId = useAtomStateValue(
    recordIndexRoadmapFieldEndIdState,
  );

  const recordGqlFields = useRelevantRecordsGqlFields({
    objectMetadataItem,
    additionalFieldMetadataId: startFieldMetadataId,
  });

  const { records, loading, error } = useFindManyRecords<ObjectRecord>({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFields,
    skip: !startFieldMetadataId || !endFieldMetadataId,
  });

  const startFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === startFieldMetadataId,
  );
  const endFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === endFieldMetadataId,
  );

  return {
    records,
    loading,
    error,
    startFieldMetadataItem,
    endFieldMetadataItem,
  };
};
