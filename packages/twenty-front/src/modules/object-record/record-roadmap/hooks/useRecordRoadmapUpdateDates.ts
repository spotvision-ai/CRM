import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';
import { type Temporal } from 'temporal-polyfill';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecordRoadmapContextOrThrow } from '@/object-record/record-roadmap/contexts/RecordRoadmapContext';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

type UpdateDatesArgs = {
  recordId: string;
  startFieldName?: string;
  endFieldName?: string;
  startDate?: Temporal.PlainDate;
  endDate?: Temporal.PlainDate;
  groupFieldName?: string;
  groupValue?: string | null;
  /** New `position` written after a vertical reorder drag. Computed via
      `computeNewPositionOfDraggedRecord` at the call site so the halfway
      logic stays shared with Kanban/Table. */
  position?: number;
};

// Persists a roadmap bar's start / end (and optional swimlane group) via the
// standard update-record mutation. useUpdateOneRecord already rolls the
// Apollo cache back on failure so the bar snaps to its pre-drag position; we
// only need to surface the error with a snackbar.
export const useRecordRoadmapUpdateDates = () => {
  const { t } = useLingui();
  const { objectNameSingular } = useRecordRoadmapContextOrThrow();
  const { updateOneRecord } = useUpdateOneRecord();
  const { enqueueErrorSnackBar } = useSnackBar();

  const updateDates = useCallback(
    async ({
      recordId,
      startFieldName,
      endFieldName,
      startDate,
      endDate,
      groupFieldName,
      groupValue,
      position,
    }: UpdateDatesArgs) => {
      const input: Record<string, string | number | null> = {};
      if (startFieldName !== undefined && startDate !== undefined) {
        // Preserve any time-of-day from the source by dropping to pure
        // date string; backend DATE_TIME columns accept date-only ISO.
        input[startFieldName] = startDate.toString();
      }
      if (endFieldName !== undefined && endDate !== undefined) {
        input[endFieldName] = endDate.toString();
      }
      if (groupFieldName !== undefined && groupValue !== undefined) {
        input[groupFieldName] = groupValue;
      }
      if (position !== undefined) {
        input.position = position;
      }
      if (Object.keys(input).length === 0) {
        return;
      }

      try {
        await updateOneRecord({
          objectNameSingular,
          idToUpdate: recordId,
          updateOneRecordInput: input,
        });
      } catch {
        enqueueErrorSnackBar({
          message: t`Could not update roadmap record`,
        });
      }
    },
    [objectNameSingular, updateOneRecord, enqueueErrorSnackBar, t],
  );

  return { updateDates };
};
