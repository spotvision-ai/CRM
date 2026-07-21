import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRecordRoadmapContextOrThrow } from '@/object-record/record-roadmap/contexts/RecordRoadmapContext';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { FieldMetadataType } from 'twenty-shared/types';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRoadmapFieldBlockedByIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldBlockedByIdState';
import { recordIndexRoadmapFieldColorIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldColorIdState';
import { recordIndexRoadmapFieldEndIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldEndIdState';
import { recordIndexRoadmapFieldGroupIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldGroupIdState';
import { recordIndexRoadmapFieldLabelIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldLabelIdState';
import { recordIndexRoadmapFieldPlannedEndIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldPlannedEndIdState';
import { recordIndexRoadmapFieldPlannedStartIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldPlannedStartIdState';
import { recordIndexRoadmapFieldStartIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldStartIdState';
import { recordIndexRoadmapFieldStatusIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldStatusIdState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import {
  combineFilters,
  computeRecordGqlOperationFilter,
  isDefined,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';

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
  const recordIndexRoadmapFieldPlannedStartId = useAtomStateValue(
    recordIndexRoadmapFieldPlannedStartIdState,
  );
  const recordIndexRoadmapFieldPlannedEndId = useAtomStateValue(
    recordIndexRoadmapFieldPlannedEndIdState,
  );
  const recordIndexRoadmapFieldStatusId = useAtomStateValue(
    recordIndexRoadmapFieldStatusIdState,
  );
  const recordIndexRoadmapFieldBlockedById = useAtomStateValue(
    recordIndexRoadmapFieldBlockedByIdState,
  );
  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  // The roadmap mounts inside the SAME record-index component-instance context
  // as the Table, so it can read the live view sorts/filters with no explicit
  // instanceId and feed them to the query — exactly like
  // useFindManyRecordIndexTableParams. Without this the timeline ignored the
  // view's sort (records were only re-sorted client-side by `position`) and
  // its filters entirely.
  const { objectMetadataItems } = useObjectMetadataItems();
  const currentRecordSorts = useAtomComponentStateValue(
    currentRecordSortsComponentState,
  );
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );
  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
  );
  const anyFieldFilterValue = useAtomComponentStateValue(
    anyFieldFilterValueComponentState,
  );
  const { filterValueDependencies } = useFilterValueDependencies();
  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const orderBy = turnSortsIntoOrderBy(
    objectMetadataItem,
    currentRecordSorts,
    objectMetadataItems,
  );
  // When a sort is active the server returns records pre-ordered; the swimlane
  // hook uses this to stop re-sorting by `position` (which would clobber it).
  const hasActiveSort = currentRecordSorts.length > 0;

  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      fields: objectMetadataItem.fields,
      filterValue: anyFieldFilterValue,
    });
  const filter = combineFilters([
    computeRecordGqlOperationFilter({
      fieldMetadataItems: flattenedFieldMetadataItems,
      recordFilterGroups: currentRecordFilterGroups,
      recordFilters: currentRecordFilters,
      filterValueDependencies,
    }),
    anyFieldFilter,
  ]);

  // Visible view-fields drive which columns the name column renders. Their
  // values must be in the GQL selection set or the cells render blank.
  const { currentView } = useGetCurrentViewOnly();
  const visibleViewFieldIds =
    currentView?.viewFields
      ?.filter((viewField) => viewField.isVisible)
      .map((viewField) => viewField.fieldMetadataId) ?? [];

  const relevantRecordGqlFields = useRelevantRecordsGqlFields({
    objectMetadataItem,
    additionalFieldMetadataIds: [recordIndexRoadmapFieldStartId],
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
    recordIndexRoadmapFieldPlannedStartId,
    recordIndexRoadmapFieldPlannedEndId,
    recordIndexRoadmapFieldStatusId,
    recordIndexRoadmapFieldBlockedById,
    recordIndexGroupFieldMetadataItem?.id,
    ...visibleViewFieldIds,
  ].filter(isDefined);

  const extraRoadmapFields = roadmapFieldIds
    .map((id) => objectMetadataItem.fields.find((field) => field.id === id))
    .filter(isDefined);

  // RELATION/MORPH fields must request the related object's REAL
  // labelIdentifier sub-fields (e.g. `opportunity { id name }`, or a person
  // `{ id name { firstName lastName } }`) — not a hardcoded `{ id, name }`,
  // which rendered the raw UUID whenever the labelIdentifier wasn't a plain
  // `name` text field. `generateDepthRecordGqlFieldsFromFields` resolves the
  // identifier per relation target, exactly like `useRelevantRecordsGqlFields`.
  // Scalars resolve fine with the boolean shorthand.
  const scalarRoadmapFields = extraRoadmapFields.filter(
    (field) =>
      field.type !== FieldMetadataType.RELATION &&
      field.type !== FieldMetadataType.MORPH_RELATION,
  );
  const relationRoadmapFields = extraRoadmapFields.filter(
    (field) =>
      field.type === FieldMetadataType.RELATION ||
      field.type === FieldMetadataType.MORPH_RELATION,
  );

  const recordGqlFields = {
    ...relevantRecordGqlFields,
    ...Object.fromEntries(
      scalarRoadmapFields.map((field) => [field.name, true]),
    ),
    ...(relationRoadmapFields.length > 0
      ? generateDepthRecordGqlFieldsFromFields({
          objectMetadataItems,
          fields: relationRoadmapFields,
          depth: 1,
        })
      : {}),
  };

  const { records, loading, error } = useFindManyRecords<ObjectRecord>({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFields,
    orderBy,
    filter,
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
    hasActiveSort,
  };
};
