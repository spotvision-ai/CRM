import { useMemo } from 'react';
import { type Temporal } from 'temporal-polyfill';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecordRoadmapContextOrThrow } from '@/object-record/record-roadmap/contexts/RecordRoadmapContext';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRoadmapFieldGroupIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldGroupIdState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export type RoadmapPlacedRecord = {
  record: ObjectRecord;
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  label: string;
  /** SELECT-option color resolved from the view's `roadmapFieldColorId`. */
  color: string | null;
};

export type RoadmapSwimlane = {
  key: string;
  label: string;
  color?: string | null;
  records: RoadmapPlacedRecord[];
};

export const ROADMAP_UNCATEGORIZED_SWIMLANE_KEY = '__uncategorized__';

type UseRecordRoadmapSwimlanesArgs = {
  placedRecords: RoadmapPlacedRecord[];
};

type UseRecordRoadmapSwimlanesResult = {
  swimlanes: RoadmapSwimlane[];
  /** Field name the swimlane key maps back to for updateOneRecord.
      `null` when the view has no group field configured. */
  groupFieldName: string | null;
  /** Whether vertical drag may change the group. RELATION grouping is
      intentionally read-only in the MVP (see PRD §3.3). */
  supportsCrossSwimlaneDrop: boolean;
};

// Groups roadmap records by the SELECT option configured as
// `roadmapFieldGroupId` on the current view — or, as a fallback, by the
// generic `recordIndexGroupFieldMetadataItem` the user just picked from the
// shared Group menu. The roadmap-specific column wins when both are set so
// the view-level configuration survives reloads; the shared atom covers the
// "set Group = Stage on the sidebar" path users expect from Kanban.
// If neither is set or the field is RELATION, the timeline falls back to a
// single swimlane. The returned swimlane `key` is either the SELECT option
// `value` or the sentinel `__uncategorized__` for records whose group field
// is null.
export const useRecordRoadmapSwimlanes = ({
  placedRecords,
}: UseRecordRoadmapSwimlanesArgs): UseRecordRoadmapSwimlanesResult => {
  const { objectMetadataItem } = useRecordRoadmapContextOrThrow();
  const recordIndexRoadmapFieldGroupId = useAtomStateValue(
    recordIndexRoadmapFieldGroupIdState,
  );
  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const groupField = useMemo(() => {
    if (isDefined(recordIndexRoadmapFieldGroupId)) {
      return (
        objectMetadataItem.fields.find(
          (field) => field.id === recordIndexRoadmapFieldGroupId,
        ) ?? null
      );
    }
    return recordIndexGroupFieldMetadataItem ?? null;
  }, [
    recordIndexRoadmapFieldGroupId,
    recordIndexGroupFieldMetadataItem,
    objectMetadataItem,
  ]);

  return useMemo<UseRecordRoadmapSwimlanesResult>(() => {
    if (groupField === null) {
      return {
        swimlanes: [
          {
            key: ROADMAP_UNCATEGORIZED_SWIMLANE_KEY,
            label: 'All records',
            records: placedRecords,
          },
        ],
        groupFieldName: null,
        supportsCrossSwimlaneDrop: false,
      };
    }

    const supportsCrossSwimlaneDrop =
      groupField.type === FieldMetadataType.SELECT;

    if (groupField.type !== FieldMetadataType.SELECT) {
      // RELATION grouping is treated as a single informational swimlane in
      // Fase 4b — the PRD defers full RELATION-aware rendering to v2.
      return {
        swimlanes: [
          {
            key: ROADMAP_UNCATEGORIZED_SWIMLANE_KEY,
            label: groupField.label ?? 'Group',
            records: placedRecords,
          },
        ],
        groupFieldName: groupField.name,
        supportsCrossSwimlaneDrop: false,
      };
    }

    const options = groupField.options ?? [];
    const byValue = new Map<string, RoadmapPlacedRecord[]>();
    const uncategorized: RoadmapPlacedRecord[] = [];

    for (const placed of placedRecords) {
      const rawValue = placed.record[groupField.name];
      if (
        typeof rawValue === 'string' &&
        rawValue.length > 0 &&
        options.some((option) => option.value === rawValue)
      ) {
        const bucket = byValue.get(rawValue) ?? [];
        bucket.push(placed);
        byValue.set(rawValue, bucket);
      } else {
        uncategorized.push(placed);
      }
    }

    const swimlanes: RoadmapSwimlane[] = options
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((option) => ({
        key: option.value,
        label: option.label,
        color: option.color,
        records: byValue.get(option.value) ?? [],
      }));

    if (uncategorized.length > 0) {
      swimlanes.push({
        key: ROADMAP_UNCATEGORIZED_SWIMLANE_KEY,
        label: 'Uncategorized',
        records: uncategorized,
      });
    }

    return {
      swimlanes,
      groupFieldName: groupField.name,
      supportsCrossSwimlaneDrop,
    };
  }, [groupField, placedRecords]);
};
