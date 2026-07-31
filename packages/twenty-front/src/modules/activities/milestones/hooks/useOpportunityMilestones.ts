import { isDefined } from 'twenty-shared/utils';

import { type MilestoneCardRecord } from '@/activities/milestones/types/MilestoneCardRecord';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

// Statuses that close a milestone. Same set the Roadmap deviation logic
// treats as terminal, so both surfaces agree on what "still open" means.
const TERMINAL_STATUS_VALUES = new Set(['DONE', 'COMPLETED', 'CANCELLED']);

const MILESTONE_GQL_FIELDS = {
  id: true,
  name: true,
  status: true,
  blockedBy: true,
  plannedStartDate: true,
  plannedEndDate: true,
  actualStartDate: true,
  actualEndDate: true,
  position: true,
  opportunityId: true,
  description: true,
  assigneeId: true,
  assignee: {
    id: true,
    name: true,
    avatarUrl: true,
  },
};

type UseOpportunityMilestonesArgs = {
  opportunityId: string;
  enabled: boolean;
  // Status values to show. `null` keeps the default: every non-terminal option.
  selectedStatusValues: string[] | null;
};

export const useOpportunityMilestones = ({
  opportunityId,
  enabled,
  selectedStatusValues,
}: UseOpportunityMilestonesArgs) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'opportunityMilestone',
  });

  const statusFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.name === 'status',
  );
  const blockedByFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.name === 'blockedBy',
  );

  const statusOptions = statusFieldMetadataItem?.options ?? [];
  const openStatusValues = statusOptions
    .filter((option) => !TERMINAL_STATUS_VALUES.has(option.value.toUpperCase()))
    .map((option) => option.value);

  // Without status options there is nothing to filter by, so the effective
  // selection is null and the terminal exclusion falls back to client-side.
  const effectiveStatusValues =
    statusOptions.length > 0
      ? (selectedStatusValues ?? openStatusValues)
      : null;

  const hasEmptySelection =
    isDefined(effectiveStatusValues) && effectiveStatusValues.length === 0;

  // Only narrow server-side when the selection is a strict subset of the enum:
  // values outside it throw "invalid input value for enum ...", and the full
  // list is a no-op.
  const canFilterStatusServerSide =
    isDefined(effectiveStatusValues) &&
    effectiveStatusValues.length > 0 &&
    effectiveStatusValues.length < statusOptions.length;

  const { records, loading } = useFindManyRecords<MilestoneCardRecord>({
    objectNameSingular: 'opportunityMilestone',
    filter: {
      opportunityId: { eq: opportunityId },
      ...(canFilterStatusServerSide
        ? { status: { in: effectiveStatusValues } }
        : {}),
    },
    // Chronological by planned completion, then by the manual `position`
    // the Roadmap persists on drag-reorder so undated milestones keep the
    // order the user gave them.
    orderBy: [{ plannedEndDate: 'AscNullsLast' }, { position: 'AscNullsLast' }],
    recordGqlFields: MILESTONE_GQL_FIELDS,
    skip: !enabled || hasEmptySelection,
  });

  const milestones = hasEmptySelection
    ? []
    : canFilterStatusServerSide
      ? records
      : records.filter(
          (milestone) =>
            !isDefined(milestone.status) ||
            !TERMINAL_STATUS_VALUES.has(milestone.status.toUpperCase()),
        );

  return {
    milestones,
    loading,
    statusOptions,
    effectiveStatusValues,
    statusFieldMetadataItem,
    blockedByFieldMetadataItem,
  };
};
