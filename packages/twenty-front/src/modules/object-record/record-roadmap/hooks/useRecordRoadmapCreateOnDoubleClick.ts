import { useLingui } from '@lingui/react/macro';
import { useCallback } from 'react';
import { type Temporal } from 'temporal-polyfill';
import { v4 } from 'uuid';

import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useRecordRoadmapContextOrThrow } from '@/object-record/record-roadmap/contexts/RecordRoadmapContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { ROADMAP_UNCATEGORIZED_SWIMLANE_KEY } from '@/object-record/record-roadmap/hooks/useRecordRoadmapSwimlanes';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

type CreateAtDayArgs = {
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  startFieldName?: string;
  endFieldName?: string;
  groupFieldName?: string | null;
  swimlaneKey?: string | null;
};

export const useRecordRoadmapCreateOnDoubleClick = () => {
  const { t } = useLingui();
  const { objectNameSingular } = useRecordRoadmapContextOrThrow();
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular,
    shouldMatchRootQueryFilter: true,
  });
  const { openRecordFromIndexView } = useOpenRecordFromIndexView();
  const { enqueueErrorSnackBar } = useSnackBar();

  const createAtDay = useCallback(
    async ({
      startDate,
      endDate,
      startFieldName,
      endFieldName,
      groupFieldName,
      swimlaneKey,
    }: CreateAtDayArgs) => {
      if (startFieldName === undefined || endFieldName === undefined) {
        return;
      }
      const id = v4();
      const input: Record<string, unknown> = {
        id,
        [startFieldName]: startDate.toString(),
        [endFieldName]: endDate.toString(),
      };
      if (
        typeof groupFieldName === 'string' &&
        swimlaneKey !== undefined &&
        swimlaneKey !== null
      ) {
        input[groupFieldName] =
          swimlaneKey === ROADMAP_UNCATEGORIZED_SWIMLANE_KEY
            ? null
            : swimlaneKey;
      }

      try {
        const created = await createOneRecord(input);
        if (created?.id) {
          openRecordFromIndexView({ recordId: created.id });
        }
      } catch {
        enqueueErrorSnackBar({
          message: t`Could not create roadmap record`,
        });
      }
    },
    [createOneRecord, openRecordFromIndexView, enqueueErrorSnackBar, t],
  );

  return { createAtDay };
};
