import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRecordRoadmapContextOrThrow } from '@/object-record/record-roadmap/contexts/RecordRoadmapContext';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRoadmapFieldColorIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldColorIdState';
import { recordIndexRoadmapFieldEndIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldEndIdState';
import { recordIndexRoadmapFieldGroupIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldGroupIdState';
import { recordIndexRoadmapFieldLabelIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldLabelIdState';
import { recordIndexRoadmapFieldStartIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldStartIdState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

// Fase 3 MVP: fetch the object records and let the component layer figure out
// which ones can be placed on the timeline. A viewport-bounded filter is
// planned for the Fase 5 performance work; for ≤500 records this is fine.
export const useRecordRoadmapFetchRecords = () => {
  const { objectMetadataItem } = useRecordRoadmapContextOrThrow();

  const recordIndexRoadmapFieldStartId = useAtomStateValue(
    recordIndexRoadmapFieldStartIdState,
  );
  const recordIndexRoadmapFieldEndId = useAtomStateValue(
    recordIndexRoadmapFieldEndIdState,
  );
  const recordIndexRoadmapFieldGroupId = useAtomStateValue(
    recordIndexRoadmapFieldGroupIdState,
  );
  const recordIndexRoadmapFieldColorId = useAtomStateValue(
    recordIndexRoadmapFieldColorIdState,
  );
  const recordIndexRoadmapFieldLabelId = useAtomStateValue(
    recordIndexRoadmapFieldLabelIdState,
  );
  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const relevantRecordGqlFields = useRelevantRecordsGqlFields({
    objectMetadataItem,
    additionalFieldMetadataId: recordIndexRoadmapFieldStartId,
  });

  // The shared `useRelevantRecordsGqlFields` only opts one "additional" field
  // into the selection set. The roadmap needs every configured field in the
  // response so bars render, swimlanes bucket by group, and the color dot
  // reads a value. Missing any of these used to collapse all records into
  // Uncategorized because `record[groupField.name]` was undefined.
  const roadmapFieldIds = [
    recordIndexRoadmapFieldEndId,
    recordIndexRoadmapFieldGroupId,
    recordIndexRoadmapFieldColorId,
    recordIndexRoadmapFieldLabelId,
    recordIndexGroupFieldMetadataItem?.id,
  ].filter(isDefined);

  const extraRoadmapFieldNames = roadmapFieldIds
    .map((id) => objectMetadataItem.fields.find((field) => field.id === id))
    .filter(isDefined)
    .map((field) => field.name);

  const recordGqlFields = {
    ...relevantRecordGqlFields,
    ...Object.fromEntries(extraRoadmapFieldNames.map((name) => [name, true])),
  };

  const { records, loading, error } = useFindManyRecords<ObjectRecord>({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFields,
    skip: !recordIndexRoadmapFieldStartId || !recordIndexRoadmapFieldEndId,
  });

  const startFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexRoadmapFieldStartId,
  );
  const endFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexRoadmapFieldEndId,
  );

  return {
    records,
    loading,
    error,
    startFieldMetadataItem,
    endFieldMetadataItem,
  };
};
