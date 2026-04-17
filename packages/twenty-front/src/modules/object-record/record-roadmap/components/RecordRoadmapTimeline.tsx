import { styled } from '@linaria/react';
import { useCallback, useMemo, useRef } from 'react';
import { type Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordRoadmapRow } from '@/object-record/record-roadmap/components/RecordRoadmapRow';
import { RecordRoadmapSwimlane } from '@/object-record/record-roadmap/components/RecordRoadmapSwimlane';
import { RecordRoadmapTimeHeader } from '@/object-record/record-roadmap/components/RecordRoadmapTimeHeader';
import { RecordRoadmapTodayLine } from '@/object-record/record-roadmap/components/RecordRoadmapTodayLine';
import { RecordRoadmapWeekendsOverlay } from '@/object-record/record-roadmap/components/RecordRoadmapWeekendsOverlay';
import { ROADMAP_DAY_WIDTH_BY_ZOOM } from '@/object-record/record-roadmap/constants/RoadmapZoomLevels';
import { useRecordRoadmapContextOrThrow } from '@/object-record/record-roadmap/contexts/RecordRoadmapContext';
import { useRecordRoadmapCreateOnDoubleClick } from '@/object-record/record-roadmap/hooks/useRecordRoadmapCreateOnDoubleClick';
import { useRecordRoadmapFetchRecords } from '@/object-record/record-roadmap/hooks/useRecordRoadmapFetchRecords';
import {
  ROADMAP_UNCATEGORIZED_SWIMLANE_KEY,
  useRecordRoadmapSwimlanes,
} from '@/object-record/record-roadmap/hooks/useRecordRoadmapSwimlanes';
import { useRecordRoadmapUpdateDates } from '@/object-record/record-roadmap/hooks/useRecordRoadmapUpdateDates';
import { useRecordRoadmapWheelZoom } from '@/object-record/record-roadmap/hooks/useRecordRoadmapWheelZoom';
import { recordIndexRoadmapFieldLabelIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldLabelIdState';
import { recordIndexRoadmapShowTodayState } from '@/object-record/record-index/states/recordIndexRoadmapShowTodayState';
import { recordIndexRoadmapShowWeekendsState } from '@/object-record/record-index/states/recordIndexRoadmapShowWeekendsState';
import { recordRoadmapViewportStartComponentState } from '@/object-record/record-roadmap/states/recordRoadmapViewportStartComponentState';
import { recordRoadmapZoomComponentState } from '@/object-record/record-roadmap/states/recordRoadmapZoomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { computeRoadmapViewportDays } from '@/object-record/record-roadmap/utils/computeRoadmapViewportDays';
import { parseRoadmapDateValue } from '@/object-record/record-roadmap/utils/computeRoadmapBarPosition';

const StyledTimelineContainer = styled.div`
  background-color: ${themeCssVariables.background.primary};
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const StyledTimelineCanvas = styled.div`
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  position: relative;
`;

const StyledTimelineInner = styled.div`
  position: relative;
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[4]};
  text-align: center;
`;

const MIN_VIEWPORT_WIDTH_PX = 1200;

export const RecordRoadmapTimeline = () => {
  const { objectMetadataItem } = useRecordRoadmapContextOrThrow();
  // oxlint-disable-next-line twenty/no-state-useref
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const recordRoadmapViewportStart = useAtomComponentStateValue(
    recordRoadmapViewportStartComponentState,
  );
  const recordRoadmapZoom = useAtomComponentStateValue(
    recordRoadmapZoomComponentState,
  );

  const recordIndexRoadmapShowToday = useAtomStateValue(
    recordIndexRoadmapShowTodayState,
  );
  const recordIndexRoadmapShowWeekends = useAtomStateValue(
    recordIndexRoadmapShowWeekendsState,
  );
  const recordIndexRoadmapFieldLabelId = useAtomStateValue(
    recordIndexRoadmapFieldLabelIdState,
  );

  const dayWidthPx = ROADMAP_DAY_WIDTH_BY_ZOOM[recordRoadmapZoom];

  const viewportWidthPx = Math.max(
    canvasRef.current?.clientWidth ?? MIN_VIEWPORT_WIDTH_PX,
    MIN_VIEWPORT_WIDTH_PX,
  );

  const { days } = computeRoadmapViewportDays({
    viewportStart: recordRoadmapViewportStart,
    viewportWidthPx,
    dayWidthPx,
  });

  const canvasWidthPx = days.length * dayWidthPx;

  const { records, startFieldMetadataItem, endFieldMetadataItem } =
    useRecordRoadmapFetchRecords();

  const { updateDates } = useRecordRoadmapUpdateDates();
  const { createAtDay } = useRecordRoadmapCreateOnDoubleClick();

  useRecordRoadmapWheelZoom(canvasRef);

  const labelFieldMetadataItem = useMemo(() => {
    if (isDefined(recordIndexRoadmapFieldLabelId)) {
      return objectMetadataItem.fields.find(
        (field) => field.id === recordIndexRoadmapFieldLabelId,
      );
    }
    return objectMetadataItem.fields.find(
      (field) => field.id === objectMetadataItem.labelIdentifierFieldMetadataId,
    );
  }, [recordIndexRoadmapFieldLabelId, objectMetadataItem]);

  const placedRecords = useMemo(() => {
    if (
      !isDefined(startFieldMetadataItem) ||
      !isDefined(endFieldMetadataItem)
    ) {
      return [];
    }
    return records
      .map((record) => {
        const startValue = record[startFieldMetadataItem.name];
        const endValue = record[endFieldMetadataItem.name];
        const startDate = parseRoadmapDateValue(startValue);
        const endDate = parseRoadmapDateValue(endValue);
        if (startDate === null || endDate === null) {
          return null;
        }
        const label =
          labelFieldMetadataItem !== undefined
            ? String(record[labelFieldMetadataItem.name] ?? record.id)
            : record.id;
        return { record, startDate, endDate, label };
      })
      .filter(isDefined);
  }, [
    records,
    startFieldMetadataItem,
    endFieldMetadataItem,
    labelFieldMetadataItem,
  ]);

  const { swimlanes, groupFieldName, supportsCrossSwimlaneDrop } =
    useRecordRoadmapSwimlanes({ placedRecords });

  const handleDoubleClickEmptyArea = useCallback(
    ({ swimlaneKey, clientX }: { swimlaneKey: string; clientX: number }) => {
      const canvas = canvasRef.current;
      if (canvas === null) return;
      const canvasRect = canvas.getBoundingClientRect();
      const offsetX = clientX - canvasRect.left + canvas.scrollLeft;
      const dayIndex = Math.max(0, Math.floor(offsetX / dayWidthPx));
      const startDate = recordRoadmapViewportStart.add({ days: dayIndex });
      const endDate = startDate.add({ days: 3 });

      void createAtDay({
        startDate,
        endDate,
        startFieldName: startFieldMetadataItem?.name,
        endFieldName: endFieldMetadataItem?.name,
        groupFieldName: supportsCrossSwimlaneDrop ? groupFieldName : null,
        swimlaneKey,
      });
    },
    [
      dayWidthPx,
      recordRoadmapViewportStart,
      createAtDay,
      startFieldMetadataItem,
      endFieldMetadataItem,
      supportsCrossSwimlaneDrop,
      groupFieldName,
    ],
  );

  const handleBarCommit = useCallback(
    ({
      recordId,
      startDate,
      endDate,
      targetSwimlaneKey,
    }: {
      recordId: string;
      startDate: Temporal.PlainDate;
      endDate: Temporal.PlainDate;
      targetSwimlaneKey?: string | null;
    }) => {
      const canUpdateGroup =
        supportsCrossSwimlaneDrop &&
        isDefined(groupFieldName) &&
        targetSwimlaneKey !== undefined;

      void updateDates({
        recordId,
        startFieldName: startFieldMetadataItem?.name,
        endFieldName: endFieldMetadataItem?.name,
        startDate,
        endDate,
        groupFieldName: canUpdateGroup ? groupFieldName : undefined,
        groupValue: canUpdateGroup
          ? targetSwimlaneKey === ROADMAP_UNCATEGORIZED_SWIMLANE_KEY
            ? null
            : (targetSwimlaneKey ?? null)
          : undefined,
      });
    },
    [
      updateDates,
      startFieldMetadataItem,
      endFieldMetadataItem,
      supportsCrossSwimlaneDrop,
      groupFieldName,
    ],
  );

  if (!isDefined(startFieldMetadataItem) || !isDefined(endFieldMetadataItem)) {
    return (
      <StyledEmpty>
        This Roadmap view is missing its start or end field. Open the view
        options to configure the timeline.
      </StyledEmpty>
    );
  }

  return (
    <StyledTimelineContainer>
      <StyledTimelineCanvas ref={canvasRef}>
        <StyledTimelineInner style={{ width: canvasWidthPx }}>
          <RecordRoadmapTimeHeader
            days={days}
            viewportStart={recordRoadmapViewportStart}
            dayWidthPx={dayWidthPx}
          />
          {recordIndexRoadmapShowWeekends && (
            <RecordRoadmapWeekendsOverlay
              days={days}
              viewportStart={recordRoadmapViewportStart}
              dayWidthPx={dayWidthPx}
            />
          )}
          {swimlanes.map((swimlane) => (
            <RecordRoadmapSwimlane
              key={swimlane.key}
              swimlaneKey={swimlane.key}
              label={swimlane.label}
              color={swimlane.color}
              onDoubleClickEmptyArea={handleDoubleClickEmptyArea}
            >
              {swimlane.records.map(({ record, startDate, endDate, label }) => (
                <RecordRoadmapRow
                  key={record.id}
                  recordId={record.id}
                  label={label}
                  startDate={startDate}
                  endDate={endDate}
                  viewportStart={recordRoadmapViewportStart}
                  dayWidthPx={dayWidthPx}
                  currentSwimlaneKey={swimlane.key}
                  onCommit={handleBarCommit}
                />
              ))}
            </RecordRoadmapSwimlane>
          ))}
          {recordIndexRoadmapShowToday && (
            <RecordRoadmapTodayLine
              viewportStart={recordRoadmapViewportStart}
              dayWidthPx={dayWidthPx}
            />
          )}
        </StyledTimelineInner>
      </StyledTimelineCanvas>
    </StyledTimelineContainer>
  );
};
