import { styled } from '@linaria/react';
import { useCallback, useMemo, useRef } from 'react';
import { type Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordRoadmapRow } from '@/object-record/record-roadmap/components/RecordRoadmapRow';
import { RecordRoadmapTimeHeader } from '@/object-record/record-roadmap/components/RecordRoadmapTimeHeader';
import { RecordRoadmapTodayLine } from '@/object-record/record-roadmap/components/RecordRoadmapTodayLine';
import { RecordRoadmapWeekendsOverlay } from '@/object-record/record-roadmap/components/RecordRoadmapWeekendsOverlay';
import { ROADMAP_DAY_WIDTH_BY_ZOOM } from '@/object-record/record-roadmap/constants/RoadmapZoomLevels';
import { useRecordRoadmapContextOrThrow } from '@/object-record/record-roadmap/contexts/RecordRoadmapContext';
import { useRecordRoadmapFetchRecords } from '@/object-record/record-roadmap/hooks/useRecordRoadmapFetchRecords';
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
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  background-color: ${themeCssVariables.background.primary};
`;

const StyledTimelineCanvas = styled.div`
  position: relative;
  overflow-x: auto;
  overflow-y: auto;
  flex: 1;
`;

const StyledTimelineInner = styled.div`
  position: relative;
`;

const StyledEmpty = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.font.color.tertiary};
  text-align: center;
  font-size: ${themeCssVariables.font.size.sm};
`;

const MIN_VIEWPORT_WIDTH_PX = 1200;

export const RecordRoadmapTimeline = () => {
  const { objectMetadataItem } = useRecordRoadmapContextOrThrow();
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const viewportStart = useAtomComponentStateValue(
    recordRoadmapViewportStartComponentState,
  );
  const zoom = useAtomComponentStateValue(recordRoadmapZoomComponentState);

  const showToday = useAtomStateValue(recordIndexRoadmapShowTodayState);
  const showWeekends = useAtomStateValue(recordIndexRoadmapShowWeekendsState);
  const labelFieldMetadataId = useAtomStateValue(
    recordIndexRoadmapFieldLabelIdState,
  );

  const dayWidthPx = ROADMAP_DAY_WIDTH_BY_ZOOM[zoom];

  const viewportWidthPx = Math.max(
    canvasRef.current?.clientWidth ?? MIN_VIEWPORT_WIDTH_PX,
    MIN_VIEWPORT_WIDTH_PX,
  );

  const { days } = computeRoadmapViewportDays({
    viewportStart,
    viewportWidthPx,
    dayWidthPx,
  });

  const canvasWidthPx = days.length * dayWidthPx;

  const { records, startFieldMetadataItem, endFieldMetadataItem } =
    useRecordRoadmapFetchRecords();

  const { updateDates } = useRecordRoadmapUpdateDates();

  useRecordRoadmapWheelZoom(canvasRef);

  const handleBarCommit = useCallback(
    ({
      recordId,
      startDate,
      endDate,
    }: {
      recordId: string;
      startDate: Temporal.PlainDate;
      endDate: Temporal.PlainDate;
    }) => {
      void updateDates({
        recordId,
        startFieldName: startFieldMetadataItem?.name,
        endFieldName: endFieldMetadataItem?.name,
        startDate,
        endDate,
      });
    },
    [updateDates, startFieldMetadataItem, endFieldMetadataItem],
  );

  const labelFieldMetadataItem = useMemo(() => {
    if (isDefined(labelFieldMetadataId)) {
      return objectMetadataItem.fields.find(
        (field) => field.id === labelFieldMetadataId,
      );
    }
    return objectMetadataItem.fields.find(
      (field) => field.id === objectMetadataItem.labelIdentifierFieldMetadataId,
    );
  }, [labelFieldMetadataId, objectMetadataItem]);

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
            viewportStart={viewportStart}
            dayWidthPx={dayWidthPx}
          />
          {showWeekends && (
            <RecordRoadmapWeekendsOverlay
              days={days}
              viewportStart={viewportStart}
              dayWidthPx={dayWidthPx}
            />
          )}
          {placedRecords.map(({ record, startDate, endDate, label }) => (
            <RecordRoadmapRow
              key={record.id}
              recordId={record.id}
              label={label}
              startDate={startDate}
              endDate={endDate}
              viewportStart={viewportStart}
              dayWidthPx={dayWidthPx}
              onCommit={handleBarCommit}
            />
          ))}
          {showToday && (
            <RecordRoadmapTodayLine
              viewportStart={viewportStart}
              dayWidthPx={dayWidthPx}
            />
          )}
        </StyledTimelineInner>
      </StyledTimelineCanvas>
    </StyledTimelineContainer>
  );
};
