import { styled } from '@linaria/react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';

import { RecordRoadmapConnectionPreview } from '@/object-record/record-roadmap/components/RecordRoadmapConnectionPreview';
import {
  type DependencyClickPayload,
  RecordRoadmapDependencyConnectors,
} from '@/object-record/record-roadmap/components/RecordRoadmapDependencyConnectors';
import { RecordRoadmapDependencyPopover } from '@/object-record/record-roadmap/components/RecordRoadmapDependencyPopover';
import { RecordRoadmapNameColumn } from '@/object-record/record-roadmap/components/RecordRoadmapNameColumn';
import { RecordRoadmapRow } from '@/object-record/record-roadmap/components/RecordRoadmapRow';
import { RecordRoadmapSwimlane } from '@/object-record/record-roadmap/components/RecordRoadmapSwimlane';
import { RecordRoadmapTimeHeader } from '@/object-record/record-roadmap/components/RecordRoadmapTimeHeader';
import { RecordRoadmapTodayLine } from '@/object-record/record-roadmap/components/RecordRoadmapTodayLine';
import { RecordRoadmapWeekendsOverlay } from '@/object-record/record-roadmap/components/RecordRoadmapWeekendsOverlay';
import {
  ROADMAP_DAY_WIDTH_BY_ZOOM,
  ROADMAP_DEFAULT_ZOOM,
} from '@/object-record/record-roadmap/constants/RoadmapZoomLevels';
import { useRecordRoadmapContextOrThrow } from '@/object-record/record-roadmap/contexts/RecordRoadmapContext';
import {
  ROADMAP_NAME_COLUMN_FIELD_WIDTH,
  ROADMAP_NAME_COLUMN_WIDTH,
} from '@/object-record/record-roadmap/constants/RoadmapDimensions';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useRecordRoadmapCreateOnDoubleClick } from '@/object-record/record-roadmap/hooks/useRecordRoadmapCreateOnDoubleClick';
import { useRecordRoadmapDependencies } from '@/object-record/record-roadmap/hooks/useRecordRoadmapDependencies';
import { useRecordRoadmapFetchRecords } from '@/object-record/record-roadmap/hooks/useRecordRoadmapFetchRecords';
import {
  ROADMAP_UNCATEGORIZED_SWIMLANE_KEY,
  useRecordRoadmapSwimlanes,
} from '@/object-record/record-roadmap/hooks/useRecordRoadmapSwimlanes';
import { useRecordRoadmapUpdateDates } from '@/object-record/record-roadmap/hooks/useRecordRoadmapUpdateDates';
import { useRecordRoadmapWheelZoom } from '@/object-record/record-roadmap/hooks/useRecordRoadmapWheelZoom';
import { recordIndexRoadmapFieldBlockedByIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldBlockedByIdState';
import { recordIndexRoadmapFieldColorIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldColorIdState';
import { recordIndexRoadmapFieldEndIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldEndIdState';
import { recordIndexRoadmapFieldLabelIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldLabelIdState';
import { recordIndexRoadmapFieldPlannedEndIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldPlannedEndIdState';
import { recordIndexRoadmapFieldPlannedStartIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldPlannedStartIdState';
import { recordIndexRoadmapFieldStartIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldStartIdState';
import { recordIndexRoadmapFieldStatusIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldStatusIdState';
import { recordIndexRoadmapShowTodayState } from '@/object-record/record-index/states/recordIndexRoadmapShowTodayState';
import { recordIndexRoadmapShowWeekendsState } from '@/object-record/record-index/states/recordIndexRoadmapShowWeekendsState';
import { recordRoadmapPendingConnectionState } from '@/object-record/record-roadmap/states/recordRoadmapPendingConnectionState';
import { recordRoadmapNameColumnWidthComponentState } from '@/object-record/record-roadmap/states/recordRoadmapNameColumnWidthComponentState';
import { recordRoadmapViewportStartComponentState } from '@/object-record/record-roadmap/states/recordRoadmapViewportStartComponentState';
import { recordRoadmapZoomComponentState } from '@/object-record/record-roadmap/states/recordRoadmapZoomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDestroyOneRecord } from '@/object-record/hooks/useDestroyOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { computeRoadmapBarLayouts } from '@/object-record/record-roadmap/utils/computeRoadmapBarLayouts';
import { computeRoadmapViewportDays } from '@/object-record/record-roadmap/utils/computeRoadmapViewportDays';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { parseRoadmapDateValue } from '@/object-record/record-roadmap/utils/computeRoadmapBarPosition';
import { computeNewPositionOfDraggedRecord } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { resolveRoadmapRelationLabel } from '@/object-record/record-roadmap/utils/resolveRoadmapRelationLabel';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { FieldMetadataType } from 'twenty-shared/types';
import { RecordIndexRemoveSortingModal } from '@/object-record/record-index/components/RecordIndexRemoveSortingModal';
import { RECORD_INDEX_REMOVE_SORTING_MODAL_ID } from '@/object-record/record-index/constants/RecordIndexRemoveSortingModalId';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';

const StyledTimelineContainer = styled.div`
  background-color: ${themeCssVariables.background.primary};
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

// Two independent scroll regions side by side: the left pane scrolls only
// vertically (names), the right pane scrolls in both directions (timeline).
// A shared `scrollTop` is enforced in JS so horizontally panning the timeline
// never strands the labels — this is simpler and more reliable than
// `position: sticky` inside a horizontally-scrolling flex/grid child.
const StyledScrollRow = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  position: relative;
`;

const StyledNameColumnScroller = styled.div`
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  flex-shrink: 0;
  overflow-x: hidden;
  overflow-y: hidden;
`;

// Drag-divider sitting on the name-pane / canvas boundary. Lives in
// StyledScrollRow (not the scroller, which clips overflow) so it isn't cut off.
// Dragging it resizes the Name column; the canvas is flex:1 and reflows.
const StyledColumnResizer = styled.div`
  bottom: 0;
  cursor: col-resize;
  position: absolute;
  top: 0;
  touch-action: none;
  width: 7px;
  z-index: 4;

  &::after {
    background-color: transparent;
    content: '';
    height: 100%;
    left: 3px;
    position: absolute;
    transition: background-color 80ms ease-out;
    width: 1px;
  }

  &:hover::after {
    background-color: ${themeCssVariables.tag.text.blue};
  }
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
// Days rendered on each side of the user's anchor on first paint. Generous
// enough that short scrolls never hit an edge, small enough that the initial
// DOM stays cheap even at DAY zoom (72 px × 730 days ≈ 52k px).
const INITIAL_BUFFER_DAYS = 365;
// Extension step when the user scrolls within `EDGE_EXTEND_THRESHOLD_PX` of
// either canvas edge. Larger extensions = fewer re-renders but coarser panning.
const BUFFER_EXTENSION_DAYS = 180;
const EDGE_EXTEND_THRESHOLD_PX = 400;

export const RecordRoadmapTimeline = () => {
  const { objectMetadataItem, objectPermissions } =
    useRecordRoadmapContextOrThrow();
  const readOnly = !objectPermissions.canUpdateObjectRecords;
  // oxlint-disable-next-line twenty/no-state-useref
  const canvasRef = useRef<HTMLDivElement | null>(null);
  // oxlint-disable-next-line twenty/no-state-useref
  const nameColumnScrollerRef = useRef<HTMLDivElement | null>(null);

  const [recordRoadmapViewportStart, setRecordRoadmapViewportStart] =
    useAtomComponentState(recordRoadmapViewportStartComponentState);
  const [recordRoadmapZoom, setRecordRoadmapZoom] = useAtomComponentState(
    recordRoadmapZoomComponentState,
  );
  const { updateCurrentView } = useUpdateCurrentView();

  const recordIndexRoadmapShowToday = useAtomStateValue(
    recordIndexRoadmapShowTodayState,
  );
  const recordIndexRoadmapShowWeekends = useAtomStateValue(
    recordIndexRoadmapShowWeekendsState,
  );
  const recordIndexRoadmapFieldStartId = useAtomStateValue(
    recordIndexRoadmapFieldStartIdState,
  );
  const recordIndexRoadmapFieldEndId = useAtomStateValue(
    recordIndexRoadmapFieldEndIdState,
  );
  const recordIndexRoadmapFieldLabelId = useAtomStateValue(
    recordIndexRoadmapFieldLabelIdState,
  );
  const recordIndexRoadmapFieldColorId = useAtomStateValue(
    recordIndexRoadmapFieldColorIdState,
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

  const dayWidthPx = ROADMAP_DAY_WIDTH_BY_ZOOM[recordRoadmapZoom];

  const viewportWidthPx = Math.max(
    canvasRef.current?.clientWidth ?? MIN_VIEWPORT_WIDTH_PX,
    MIN_VIEWPORT_WIDTH_PX,
  );

  // Sliding window around `recordRoadmapViewportStart` (the user's anchor,
  // e.g. from the Today button or auto-fit). `daysBefore` / `daysAfter` grow
  // when the user scrolls near either edge; preserving `scrollLeft` across
  // extension updates keeps panning smooth with no visible jump. The window
  // resets whenever the anchor moves externally so the Today button still
  // recenters instead of leaving a stale extension in place.
  const [daysBefore, setDaysBefore] = useState(INITIAL_BUFFER_DAYS);
  const [daysAfter, setDaysAfter] = useState(INITIAL_BUFFER_DAYS);

  const renderedDaysStart = useMemo(
    () => recordRoadmapViewportStart.subtract({ days: daysBefore }),
    [recordRoadmapViewportStart, daysBefore],
  );

  const visibleDays = Math.max(
    Math.ceil(viewportWidthPx / Math.max(dayWidthPx, 1)),
    1,
  );
  const totalDays = daysBefore + visibleDays + daysAfter;

  const { days } = computeRoadmapViewportDays({
    renderedDaysStart,
    totalDays,
  });

  const canvasWidthPx = days.length * dayWidthPx;

  const {
    records,
    startFieldMetadataItem,
    endFieldMetadataItem,
    hasActiveSort,
  } = useRecordRoadmapFetchRecords();

  const { objectMetadataItems } = useObjectMetadataItems();
  const { openModal } = useModal();
  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    RECORD_INDEX_REMOVE_SORTING_MODAL_ID,
  );

  const [recordRoadmapNameColumnWidth, setRecordRoadmapNameColumnWidth] =
    useAtomComponentState(recordRoadmapNameColumnWidthComponentState);
  // oxlint-disable-next-line twenty/no-state-useref
  const columnResizeRef = useRef<{
    pointerId: number;
    startX: number;
    startWidth: number;
  } | null>(null);

  const handleColumnResizePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      columnResizeRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startWidth: recordRoadmapNameColumnWidth,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [recordRoadmapNameColumnWidth],
  );

  const handleColumnResizePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = columnResizeRef.current;
      if (drag === null || event.pointerId !== drag.pointerId) return;
      // Clamp so the column can't collapse past readability or eat the canvas.
      const next = Math.min(
        Math.max(drag.startWidth + (event.clientX - drag.startX), 160),
        560,
      );
      setRecordRoadmapNameColumnWidth(next);
    },
    [setRecordRoadmapNameColumnWidth],
  );

  const handleColumnResizePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = columnResizeRef.current;
      if (drag === null) return;
      event.currentTarget.releasePointerCapture?.(drag.pointerId);
      columnResizeRef.current = null;
    },
    [],
  );

  const { updateDates } = useRecordRoadmapUpdateDates();
  const { createAtDay } = useRecordRoadmapCreateOnDoubleClick();
  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const handleOpenRecord = useCallback(
    (clickedRecordId: string) => {
      openRecordFromIndexView({ recordId: clickedRecordId });
    },
    [openRecordFromIndexView],
  );

  useRecordRoadmapWheelZoom(canvasRef);
  // Ctrl/Cmd + wheel over the name column zooms too (and stops the browser
  // page-zoom there); plain wheel is forwarded to the canvas scroll below.
  useRecordRoadmapWheelZoom(nameColumnScrollerRef);

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

  // When the label field is a RELATION we resolve the related object's
  // metadata so its labelIdentifier (company `name`, person FULL_NAME, …)
  // drives the displayed text instead of the raw related-record object.
  const labelFieldTarget = useMemo(() => {
    if (labelFieldMetadataItem?.type !== FieldMetadataType.RELATION) {
      return undefined;
    }
    return objectMetadataItems.find(
      (item) =>
        item.id === labelFieldMetadataItem.relation?.targetObjectMetadata?.id,
    );
  }, [labelFieldMetadataItem, objectMetadataItems]);

  // Color field is a SELECT: we match each record's value against the
  // field's `options` array and surface the option's `color` (already a
  // theme token like 'blue', 'red', etc.). NULL when unconfigured or when
  // the record's value doesn't match any option — the bar then falls back
  // to the neutral default styling.
  const colorFieldMetadataItem = useMemo(() => {
    if (!isDefined(recordIndexRoadmapFieldColorId)) return undefined;
    return objectMetadataItem.fields.find(
      (field) => field.id === recordIndexRoadmapFieldColorId,
    );
  }, [recordIndexRoadmapFieldColorId, objectMetadataItem]);

  const plannedStartFieldMetadataItem = useMemo(() => {
    if (!isDefined(recordIndexRoadmapFieldPlannedStartId)) return undefined;
    return objectMetadataItem.fields.find(
      (field) => field.id === recordIndexRoadmapFieldPlannedStartId,
    );
  }, [recordIndexRoadmapFieldPlannedStartId, objectMetadataItem]);

  const plannedEndFieldMetadataItem = useMemo(() => {
    if (!isDefined(recordIndexRoadmapFieldPlannedEndId)) return undefined;
    return objectMetadataItem.fields.find(
      (field) => field.id === recordIndexRoadmapFieldPlannedEndId,
    );
  }, [recordIndexRoadmapFieldPlannedEndId, objectMetadataItem]);

  const statusFieldMetadataItem = useMemo(() => {
    if (!isDefined(recordIndexRoadmapFieldStatusId)) return undefined;
    return objectMetadataItem.fields.find(
      (field) => field.id === recordIndexRoadmapFieldStatusId,
    );
  }, [recordIndexRoadmapFieldStatusId, objectMetadataItem]);

  const blockedByFieldMetadataItem = useMemo(() => {
    if (!isDefined(recordIndexRoadmapFieldBlockedById)) return undefined;
    return objectMetadataItem.fields.find(
      (field) => field.id === recordIndexRoadmapFieldBlockedById,
    );
  }, [recordIndexRoadmapFieldBlockedById, objectMetadataItem]);

  // Resolve each status SELECT value to a {label,color} chip for the on-bar
  // pill (Fase 3.2). Built once per render from the field's options.
  const statusOptionByValue = useMemo(() => {
    const map = new Map<string, { label: string; color: string | null }>();
    for (const option of statusFieldMetadataItem?.options ?? []) {
      map.set(option.value, { label: option.label, color: option.color });
    }
    return map;
  }, [statusFieldMetadataItem]);

  const placedRecords = useMemo(() => {
    if (
      !isDefined(startFieldMetadataItem) ||
      !isDefined(endFieldMetadataItem)
    ) {
      return [];
    }
    const colorOptions = colorFieldMetadataItem?.options ?? [];
    return records
      .map((record) => {
        const startValue = record[startFieldMetadataItem.name];
        const endValue = record[endFieldMetadataItem.name];
        // When the configured `start`/`end` fields are empty (e.g.
        // milestone not started yet so actualStart/actualEnd are null),
        // fall back to plannedStart/plannedEnd so the bar still renders.
        // No-op for views that don't configure plannedStart/plannedEnd.
        let startDate = parseRoadmapDateValue(startValue);
        if (startDate === null && plannedStartFieldMetadataItem !== undefined) {
          startDate = parseRoadmapDateValue(
            record[plannedStartFieldMetadataItem.name],
          );
        }
        let endDate = parseRoadmapDateValue(endValue);
        if (endDate === null && plannedEndFieldMetadataItem !== undefined) {
          endDate = parseRoadmapDateValue(
            record[plannedEndFieldMetadataItem.name],
          );
        }
        if (startDate === null || endDate === null) {
          return null;
        }
        let label: string;
        if (labelFieldMetadataItem === undefined) {
          label = record.id;
        } else if (labelFieldMetadataItem.type === FieldMetadataType.RELATION) {
          label =
            resolveRoadmapRelationLabel({
              rawValue: record[labelFieldMetadataItem.name],
              targetObjectMetadataItem: labelFieldTarget,
            }) ?? record.id;
        } else {
          label = String(record[labelFieldMetadataItem.name] ?? record.id);
        }
        let color: string | null = null;
        if (colorFieldMetadataItem !== undefined) {
          const rawValue = record[colorFieldMetadataItem.name];
          if (typeof rawValue === 'string' && rawValue.length > 0) {
            color =
              colorOptions.find((option) => option.value === rawValue)?.color ??
              null;
          }
        }
        const plannedStartDate =
          plannedStartFieldMetadataItem !== undefined
            ? parseRoadmapDateValue(record[plannedStartFieldMetadataItem.name])
            : null;
        const plannedEndDate =
          plannedEndFieldMetadataItem !== undefined
            ? parseRoadmapDateValue(record[plannedEndFieldMetadataItem.name])
            : null;
        const status =
          statusFieldMetadataItem !== undefined
            ? (() => {
                const raw = record[statusFieldMetadataItem.name];
                return typeof raw === 'string' && raw.length > 0 ? raw : null;
              })()
            : null;
        const blockedBy =
          blockedByFieldMetadataItem !== undefined
            ? (() => {
                const raw = record[blockedByFieldMetadataItem.name];
                return typeof raw === 'string' && raw.length > 0 ? raw : null;
              })()
            : null;
        return {
          record,
          startDate,
          endDate,
          label,
          color,
          plannedStartDate,
          plannedEndDate,
          status,
          blockedBy,
        };
      })
      .filter(isDefined);
  }, [
    records,
    startFieldMetadataItem,
    endFieldMetadataItem,
    labelFieldMetadataItem,
    labelFieldTarget,
    colorFieldMetadataItem,
    plannedStartFieldMetadataItem,
    plannedEndFieldMetadataItem,
    statusFieldMetadataItem,
    blockedByFieldMetadataItem,
  ]);

  const { swimlanes, groupFieldName, supportsCrossSwimlaneDrop } =
    useRecordRoadmapSwimlanes({ placedRecords, hasActiveSort });

  const { currentView } = useGetCurrentViewOnly();
  const currentViewId = currentView?.id;

  // --- Persist viewing preferences so they survive reloads ---

  // Zoom → view.roadmapDefaultZoom (the column already exists). Seed the live
  // zoom from the saved default once the view has loaded, then persist user
  // changes back, debounced so ctrl+wheel zoom bursts don't spam the mutation.
  // oxlint-disable-next-line twenty/no-state-useref
  const hasSeededZoomRef = useRef(false);
  useEffect(() => {
    if (hasSeededZoomRef.current || !isDefined(currentView)) return;
    hasSeededZoomRef.current = true;
    setRecordRoadmapZoom(
      currentView.roadmapDefaultZoom ?? ROADMAP_DEFAULT_ZOOM,
    );
  }, [currentView, setRecordRoadmapZoom]);

  useEffect(() => {
    if (!hasSeededZoomRef.current) return;
    const savedZoom = currentView?.roadmapDefaultZoom ?? ROADMAP_DEFAULT_ZOOM;
    if (recordRoadmapZoom === savedZoom) return;
    const timeout = setTimeout(() => {
      void updateCurrentView({ roadmapDefaultZoom: recordRoadmapZoom });
    }, 600);
    return () => clearTimeout(timeout);
  }, [recordRoadmapZoom, currentView, updateCurrentView]);

  // Name-column width → localStorage, keyed per view (a client-side viewing
  // preference; there's no view column for it). Re-hydrate when the view
  // changes; persist on resize, debounced so a drag writes once on settle.
  // oxlint-disable-next-line twenty/no-state-useref
  const hasHydratedWidthRef = useRef(false);
  useEffect(() => {
    hasHydratedWidthRef.current = false;
  }, [currentViewId]);
  useEffect(() => {
    if (!isDefined(currentViewId)) return;
    const storageKey = `roadmap:nameColumnWidth:${currentViewId}`;
    if (!hasHydratedWidthRef.current) {
      hasHydratedWidthRef.current = true;
      const stored = Number.parseInt(
        localStorage.getItem(storageKey) ?? '',
        10,
      );
      setRecordRoadmapNameColumnWidth(
        Number.isFinite(stored)
          ? Math.min(Math.max(stored, 160), 560)
          : ROADMAP_NAME_COLUMN_WIDTH,
      );
      return;
    }
    const timeout = setTimeout(() => {
      localStorage.setItem(storageKey, String(recordRoadmapNameColumnWidth));
    }, 400);
    return () => clearTimeout(timeout);
  }, [
    currentViewId,
    recordRoadmapNameColumnWidth,
    setRecordRoadmapNameColumnWidth,
  ]);

  // Visible view-fields define the columns the name column renders next to
  // each milestone label. Skip the configured `start`/`end` (rendered as the
  // bar itself) and the `label` (rendered as the row title) — those are
  // already represented elsewhere on the timeline.
  const nameColumnFields = useMemo(() => {
    if (!currentView?.viewFields) return [];
    const labelOrAnchorIds = new Set(
      [
        recordIndexRoadmapFieldStartId,
        recordIndexRoadmapFieldEndId,
        recordIndexRoadmapFieldLabelId,
        labelFieldMetadataItem?.id,
      ].filter(isDefined),
    );
    return currentView.viewFields
      .filter((viewField) => viewField.isVisible)
      .filter((viewField) => !labelOrAnchorIds.has(viewField.fieldMetadataId))
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((viewField) =>
        objectMetadataItem.fields.find(
          (field) => field.id === viewField.fieldMetadataId,
        ),
      )
      .filter(isDefined);
  }, [
    currentView?.viewFields,
    recordIndexRoadmapFieldStartId,
    recordIndexRoadmapFieldEndId,
    recordIndexRoadmapFieldLabelId,
    labelFieldMetadataItem?.id,
    objectMetadataItem.fields,
  ]);

  // Pre-resolve RELATION extra-fields shown in the name column to the related
  // record's label (same labelIdentifier logic as the bar label) so the column
  // shows "Acme Corp" instead of a UUID. Keyed recordId → fieldId; FieldCell
  // stays pure and just reads this map.
  const nameColumnRelationLabels = useMemo(() => {
    const relationFields = nameColumnFields.filter(
      (field) => field.type === FieldMetadataType.RELATION,
    );
    if (relationFields.length === 0) {
      return {} as Record<string, Record<string, string>>;
    }
    const targetByFieldId = new Map(
      relationFields.map((field) => [
        field.id,
        objectMetadataItems.find(
          (item) => item.id === field.relation?.targetObjectMetadata?.id,
        ),
      ]),
    );
    const result: Record<string, Record<string, string>> = {};
    for (const placed of placedRecords) {
      for (const field of relationFields) {
        const resolved = resolveRoadmapRelationLabel({
          rawValue: placed.record[field.name],
          targetObjectMetadataItem: targetByFieldId.get(field.id),
        });
        if (resolved !== null) {
          (result[placed.record.id] ??= {})[field.id] = resolved;
        }
      }
    }
    return result;
  }, [nameColumnFields, placedRecords, objectMetadataItems]);

  // Total width of the left pane = user-resizable Name column + fixed-width
  // extra field columns. Drives both the scroller width and the divider's x.
  const nameColumnTotalWidth =
    recordRoadmapNameColumnWidth +
    nameColumnFields.length * ROADMAP_NAME_COLUMN_FIELD_WIDTH;

  // Bar layouts indexed by recordId. Mirrors the deterministic vertical
  // stacking the swimlane CSS uses, so the SVG connector overlay aligns
  // pixel-for-pixel with the bars without DOM measurement.
  const barLayouts = useMemo(
    () =>
      computeRoadmapBarLayouts({
        swimlanes,
        viewportStart: renderedDaysStart,
        dayWidthPx,
      }),
    [swimlanes, renderedDaysStart, dayWidthPx],
  );

  // Dependencies are only meaningful when the underlying object is
  // OpportunityMilestone (where the schema lives). The hook is gated by
  // `enabled` so other objects don't pay for an extra fetch.
  const isMilestoneObject =
    objectMetadataItem.nameSingular === 'opportunityMilestone';
  const milestoneRecordIds = useMemo(
    () => placedRecords.map(({ record }) => record.id),
    [placedRecords],
  );
  const { dependencies, refetch: refetchDependencies } =
    useRecordRoadmapDependencies({
      recordIds: milestoneRecordIds,
      enabled: isMilestoneObject,
    });

  // Connection authoring: clicking a dot on bar A captures the start
  // anchor; clicking another bar's dot commits the dependency edge. The
  // preview line follows the cursor in inner-canvas coordinates while
  // pending. Escape (or click on the empty canvas) clears the state.
  const [recordRoadmapPendingConnection, setRecordRoadmapPendingConnection] =
    useAtomState(recordRoadmapPendingConnectionState);
  const [connectionCursor, setConnectionCursor] = useState<{
    xPx: number;
    yPx: number;
  } | null>(null);
  const { enqueueErrorSnackBar } = useSnackBar();
  const { createOneRecord: createOneDependency } = useCreateOneRecord({
    objectNameSingular: 'opportunityMilestoneDependency',
  });
  const { destroyOneRecord: destroyOneDependency } = useDestroyOneRecord({
    objectNameSingular: 'opportunityMilestoneDependency',
  });
  const { updateOneRecord: updateOneRecordGeneric } = useUpdateOneRecord();

  // The selected dependency drives the popover render. `null` means
  // nothing is open. The Timeline owns this state because the popover
  // sits above the SVG overlay and needs the full inner-canvas
  // coordinate system to position itself.
  const [selectedDependency, setSelectedDependency] =
    useState<DependencyClickPayload | null>(null);

  const handleDependencyClick = useCallback(
    (payload: DependencyClickPayload) => {
      setSelectedDependency(payload);
    },
    [],
  );

  const handleDependencyClosePopover = useCallback(() => {
    setSelectedDependency(null);
  }, []);

  const handleDependencyDelete = useCallback(async () => {
    if (selectedDependency === null) return;
    try {
      await destroyOneDependency(selectedDependency.dependency.id);
      await refetchDependencies();
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : 'Could not delete dependency',
      });
    } finally {
      setSelectedDependency(null);
    }
  }, [
    selectedDependency,
    destroyOneDependency,
    refetchDependencies,
    enqueueErrorSnackBar,
  ]);

  const handleDependencyDescriptionSave = useCallback(
    async (nextDescription: string | null) => {
      if (selectedDependency === null) return;
      try {
        await updateOneRecordGeneric({
          objectNameSingular: 'opportunityMilestoneDependency',
          idToUpdate: selectedDependency.dependency.id,
          updateOneRecordInput: { description: nextDescription },
        });
        await refetchDependencies();
      } catch (error) {
        enqueueErrorSnackBar({
          message:
            error instanceof Error
              ? error.message
              : 'Could not update dependency',
        });
      }
    },
    [
      selectedDependency,
      updateOneRecordGeneric,
      refetchDependencies,
      enqueueErrorSnackBar,
    ],
  );

  const handlePortClick = useCallback(
    ({ recordId, port }: { recordId: string; port: 'start' | 'end' }) => {
      const layout = barLayouts.get(recordId);
      if (!isDefined(layout)) return;

      // Clicked-port anchor in inner-canvas coordinates. Matches the
      // dot's center so the preview line shoots out from where the
      // cursor was when the user pressed down.
      const anchorXPx =
        port === 'start' ? layout.leftPx : layout.leftPx + layout.widthPx;
      const anchorYPx = layout.topPx + layout.heightPx / 2;

      // First click — capture the origin port.
      if (recordRoadmapPendingConnection === null) {
        setRecordRoadmapPendingConnection({
          recordId,
          port,
          anchorXPx,
          anchorYPx,
        });
        setConnectionCursor({ xPx: anchorXPx, yPx: anchorYPx });
        return;
      }

      // Second click on the same record cancels (no self-loops anyway).
      if (recordRoadmapPendingConnection.recordId === recordId) {
        setRecordRoadmapPendingConnection(null);
        setConnectionCursor(null);
        return;
      }

      // Second click on a different record commits the edge. Convention:
      // first-clicked = required (predecessor), second-clicked = dependent
      // (successor). This matches the visual "draw an arrow from end of A
      // to start of B = B depends on A" mental model.
      void (async () => {
        try {
          await createOneDependency({
            requiredMilestoneId: recordRoadmapPendingConnection.recordId,
            dependentMilestoneId: recordId,
          });
          // Force a refetch — the optimistic-create effect doesn't
          // reliably match queries filtered by `{ in: [...] }` on a
          // foreign-key column, so the new edge is invisible until the
          // next render that hits the server. An explicit refetch on
          // success keeps the SVG arrow in lockstep with the DB.
          await refetchDependencies();
        } catch (error) {
          // Backend cycle validator + uniqueness checks surface here.
          // Snackbar message comes from the GraphQLError so the user
          // gets the friendly "would create a cycle" copy when relevant.
          enqueueErrorSnackBar({
            message:
              error instanceof Error
                ? error.message
                : 'Could not create dependency',
          });
        } finally {
          setRecordRoadmapPendingConnection(null);
          setConnectionCursor(null);
        }
      })();
    },
    [
      barLayouts,
      recordRoadmapPendingConnection,
      setRecordRoadmapPendingConnection,
      createOneDependency,
      refetchDependencies,
      enqueueErrorSnackBar,
    ],
  );

  // Track cursor in inner-canvas coords while a connection is pending so
  // the preview line follows the pointer. Listening on the canvas (not
  // window) keeps the math simple — clientX/Y minus the canvas bounding
  // rect, plus the canvas's own scroll, gives inner-content coordinates.
  const handleCanvasPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (recordRoadmapPendingConnection === null) return;
      const canvas = canvasRef.current;
      if (canvas === null) return;
      const rect = canvas.getBoundingClientRect();
      setConnectionCursor({
        xPx: event.clientX - rect.left + canvas.scrollLeft,
        yPx: event.clientY - rect.top + canvas.scrollTop,
      });
    },
    [recordRoadmapPendingConnection],
  );

  // Click anywhere on the canvas that's NOT a port dot cancels the in-
  // progress connection. The dots stop propagation in their own handler,
  // so reaching this handler implies the click landed on empty timeline,
  // a swimlane, or a bar body.
  const handleCanvasPointerDownCapture = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (recordRoadmapPendingConnection === null) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-roadmap-bar-port]')) return;
      setRecordRoadmapPendingConnection(null);
      setConnectionCursor(null);
    },
    [recordRoadmapPendingConnection, setRecordRoadmapPendingConnection],
  );

  // Escape always cancels — global listener is fine here, the atom is
  // null for the vast majority of the session so we attach the handler
  // only while pending.
  useEffect(() => {
    if (recordRoadmapPendingConnection === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setRecordRoadmapPendingConnection(null);
        setConnectionCursor(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recordRoadmapPendingConnection, setRecordRoadmapPendingConnection]);

  const swimlaneStackHeightPx = useMemo(() => {
    let total = 0;
    for (const swimlane of swimlanes) {
      total += 28 + swimlane.records.length * 40;
    }
    return total;
  }, [swimlanes]);
  const canvasHeightPx = 48 + swimlaneStackHeightPx;

  // Keep scrollLeft stable whenever `daysBefore` grows (new days prepended to
  // the canvas push existing content right by the delta's pixel equivalent).
  // oxlint-disable-next-line twenty/no-state-useref
  const previousDaysBeforeRef = useRef(daysBefore);
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const delta = daysBefore - previousDaysBeforeRef.current;
    previousDaysBeforeRef.current = daysBefore;
    if (delta !== 0) {
      canvas.scrollLeft += delta * dayWidthPx;
    }
  }, [daysBefore, dayWidthPx]);

  // When the user's anchor changes (Today button, auto-fit), reset the
  // sliding window symmetrically and snap the scroll to the anchor so the
  // jump feels intentional instead of accidental. Reference (not value)
  // equality guards re-entry — we want "Go today" to re-snap even when
  // today-7d happens to match the current anchor's value, because the
  // user may have scrolled away and expects a jump back.
  // oxlint-disable-next-line twenty/no-state-useref
  const previousAnchorRef = useRef(recordRoadmapViewportStart);
  useLayoutEffect(() => {
    if (previousAnchorRef.current === recordRoadmapViewportStart) {
      return;
    }
    previousAnchorRef.current = recordRoadmapViewportStart;
    setDaysBefore(INITIAL_BUFFER_DAYS);
    setDaysAfter(INITIAL_BUFFER_DAYS);
    previousDaysBeforeRef.current = INITIAL_BUFFER_DAYS;
    const canvas = canvasRef.current;
    if (canvas !== null) {
      canvas.scrollLeft = INITIAL_BUFFER_DAYS * dayWidthPx;
    }
  }, [recordRoadmapViewportStart, dayWidthPx]);

  // First paint: scroll so the anchor sits at the left edge of the viewport.
  // oxlint-disable-next-line twenty/no-state-useref
  const hasSetInitialScrollRef = useRef(false);
  useLayoutEffect(() => {
    if (hasSetInitialScrollRef.current) return;
    const canvas = canvasRef.current;
    if (canvas === null) return;
    hasSetInitialScrollRef.current = true;
    canvas.scrollLeft = daysBefore * dayWidthPx;
  }, [daysBefore, dayWidthPx]);

  // Extend the window when scroll approaches an edge, and mirror the
  // vertical scroll onto the sticky name-column scroller so the two panes
  // stay row-for-row aligned. `scrollTop` assignment here is a no-op when
  // it already matches, so the guard is implicit.
  const handleCanvasScroll = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    if (canvas.scrollLeft < EDGE_EXTEND_THRESHOLD_PX) {
      setDaysBefore((previous) => previous + BUFFER_EXTENSION_DAYS);
    }
    if (
      canvas.scrollWidth - canvas.scrollLeft - canvas.clientWidth <
      EDGE_EXTEND_THRESHOLD_PX
    ) {
      setDaysAfter((previous) => previous + BUFFER_EXTENSION_DAYS);
    }
    const nameColumnScroller = nameColumnScrollerRef.current;
    if (
      nameColumnScroller !== null &&
      nameColumnScroller.scrollTop !== canvas.scrollTop
    ) {
      nameColumnScroller.scrollTop = canvas.scrollTop;
    }
  }, []);

  // The name column is overflow-hidden and only mirrors the canvas scrollTop,
  // so a wheel over the labels would otherwise do nothing. Forward plain wheel
  // (vertical + horizontal) to the canvas, which then mirrors back here — this
  // lets the user scroll a tall roadmap from anywhere, not just over the bars.
  // Ctrl/Cmd + wheel is left to the zoom hook above.
  const handleNameColumnWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (event.ctrlKey || event.metaKey) return;
      const canvas = canvasRef.current;
      if (canvas === null) return;
      canvas.scrollTop += event.deltaY;
      canvas.scrollLeft += event.deltaX;
    },
    [],
  );

  // Re-anchor the viewport to (earliest placed record - 7 days) only on the
  // first successful load. Zoom changes no longer re-snap — that used to
  // feel like an involuntary "Go today" every time the user switched
  // Day/Week/Quarter. Instead, `useLayoutEffect` below rescales scrollLeft
  // so the visible date stays put across zoom transitions.
  // oxlint-disable-next-line twenty/no-state-useref
  const hasAutoFittedRef = useRef(false);
  useEffect(() => {
    if (hasAutoFittedRef.current || placedRecords.length === 0) return;
    hasAutoFittedRef.current = true;
    const earliest = placedRecords.reduce<Temporal.PlainDate>(
      (acc, placed) =>
        Temporal.PlainDate.compare(placed.startDate, acc) < 0
          ? placed.startDate
          : acc,
      placedRecords[0].startDate,
    );
    const anchored = earliest.subtract({ days: 7 });
    if (
      Temporal.PlainDate.compare(anchored, recordRoadmapViewportStart) !== 0
    ) {
      setRecordRoadmapViewportStart(anchored);
    }
  }, [
    placedRecords,
    recordRoadmapViewportStart,
    setRecordRoadmapViewportStart,
  ]);

  // Preserve the visible date across zoom changes by scaling `scrollLeft`
  // in lock-step with `dayWidthPx`. Runs as a layout effect so the re-paint
  // at the new zoom sees the correct scroll position on the same frame
  // (avoids a visible jump).
  // oxlint-disable-next-line twenty/no-state-useref
  const previousDayWidthPxRef = useRef(dayWidthPx);
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const previous = previousDayWidthPxRef.current;
    previousDayWidthPxRef.current = dayWidthPx;
    if (previous === dayWidthPx || previous === 0) return;
    canvas.scrollLeft = (canvas.scrollLeft * dayWidthPx) / previous;
  }, [dayWidthPx]);

  const handleDoubleClickEmptyArea = useCallback(
    ({ swimlaneKey, clientX }: { swimlaneKey: string; clientX: number }) => {
      const canvas = canvasRef.current;
      if (canvas === null) return;
      const canvasRect = canvas.getBoundingClientRect();
      // The name column is a separate scroller outside the canvas, so the
      // canvas's left edge already aligns with the start of the timeline.
      const offsetX = clientX - canvasRect.left + canvas.scrollLeft;
      const dayIndex = Math.max(0, Math.floor(offsetX / dayWidthPx));
      const startDate = renderedDaysStart.add({ days: dayIndex });
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
      renderedDaysStart,
      createAtDay,
      startFieldMetadataItem,
      endFieldMetadataItem,
      supportsCrossSwimlaneDrop,
      groupFieldName,
    ],
  );

  // Shared reorder-by-position commit used by BOTH the bar vertical-drag and
  // the name-column grip handle. A manual reorder writes `position`, but an
  // active view sort would re-order the records right back on the next fetch —
  // so we mirror the Table: ask the user to remove sorting first (modal)
  // instead of silently fighting them. Position math is delegated to the
  // shared Kanban helper so the intermediary-halves / first-last edge cases
  // stay identical across views.
  const handleRowReorder = useCallback(
    ({
      recordId,
      targetRowRecordId,
    }: {
      recordId: string;
      targetRowRecordId: string;
    }) => {
      if (recordId === targetRowRecordId) return;
      if (hasActiveSort) {
        openModal(RECORD_INDEX_REMOVE_SORTING_MODAL_ID);
        return;
      }
      const sourceSwimlane = swimlanes.find((swimlane) =>
        swimlane.records.some(({ record }) => record.id === recordId),
      );
      if (!isDefined(sourceSwimlane)) {
        return;
      }
      const recordsWithPosition = sourceSwimlane.records
        .map(({ record }) =>
          typeof record.position === 'number'
            ? { id: record.id, position: record.position }
            : null,
        )
        .filter(isDefined);
      if (!recordsWithPosition.some(({ id }) => id === targetRowRecordId)) {
        return;
      }
      const newPosition = computeNewPositionOfDraggedRecord({
        arrayOfRecordsWithPosition: recordsWithPosition,
        idOfItemToMove: recordId,
        idOfTargetItem: targetRowRecordId,
        isDroppedAfterList: false,
      });
      void updateDates({ recordId, position: newPosition });
    },
    [hasActiveSort, openModal, swimlanes, updateDates],
  );

  const handleBarCommit = useCallback(
    ({
      recordId,
      startDate,
      endDate,
      targetSwimlaneKey,
      targetRowRecordId,
    }: {
      recordId: string;
      startDate: Temporal.PlainDate;
      endDate: Temporal.PlainDate;
      targetSwimlaneKey?: string | null;
      targetRowRecordId?: string | null;
    }) => {
      // Reorder-by-position path (drop on a different row of the same
      // swimlane) — delegate to the shared handler the grip handle also uses.
      if (isDefined(targetRowRecordId) && targetRowRecordId !== recordId) {
        handleRowReorder({ recordId, targetRowRecordId });
        return;
      }

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
      handleRowReorder,
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
      <StyledScrollRow>
        <StyledNameColumnScroller
          ref={nameColumnScrollerRef}
          style={{ width: nameColumnTotalWidth }}
          onWheel={handleNameColumnWheel}
        >
          <RecordRoadmapNameColumn
            swimlanes={swimlanes}
            onOpenRecord={handleOpenRecord}
            extraFields={nameColumnFields}
            relationLabels={nameColumnRelationLabels}
            readOnly={readOnly}
            onReorder={handleRowReorder}
            nameColumnWidth={recordRoadmapNameColumnWidth}
          />
        </StyledNameColumnScroller>
        <StyledColumnResizer
          style={{ left: nameColumnTotalWidth - 3 }}
          onPointerDown={handleColumnResizePointerDown}
          onPointerMove={handleColumnResizePointerMove}
          onPointerUp={handleColumnResizePointerUp}
          onPointerCancel={handleColumnResizePointerUp}
        />
        <StyledTimelineCanvas
          ref={canvasRef}
          onScroll={handleCanvasScroll}
          onPointerMove={handleCanvasPointerMove}
          onPointerDownCapture={handleCanvasPointerDownCapture}
        >
          <StyledTimelineInner style={{ width: canvasWidthPx }}>
            <RecordRoadmapTimeHeader
              days={days}
              viewportStart={renderedDaysStart}
              dayWidthPx={dayWidthPx}
              zoom={recordRoadmapZoom}
            />
            {recordIndexRoadmapShowWeekends && (
              <RecordRoadmapWeekendsOverlay
                days={days}
                viewportStart={renderedDaysStart}
                dayWidthPx={dayWidthPx}
              />
            )}
            {swimlanes.map((swimlane) => (
              <RecordRoadmapSwimlane
                key={swimlane.key}
                swimlaneKey={swimlane.key}
                onDoubleClickEmptyArea={
                  readOnly ? undefined : handleDoubleClickEmptyArea
                }
              >
                {swimlane.records.map(
                  ({
                    record,
                    startDate,
                    endDate,
                    label,
                    color,
                    plannedStartDate,
                    plannedEndDate,
                    status,
                    blockedBy,
                  }) => (
                    <RecordRoadmapRow
                      key={record.id}
                      recordId={record.id}
                      label={label}
                      startDate={startDate}
                      endDate={endDate}
                      plannedStartDate={plannedStartDate}
                      plannedEndDate={plannedEndDate}
                      status={status}
                      blockedBy={blockedBy}
                      viewportStart={renderedDaysStart}
                      dayWidthPx={dayWidthPx}
                      color={color}
                      statusChip={
                        status !== null
                          ? (statusOptionByValue.get(status) ?? null)
                          : null
                      }
                      currentSwimlaneKey={swimlane.key}
                      readOnly={readOnly}
                      onCommit={handleBarCommit}
                      onOpenRecord={handleOpenRecord}
                      onPortClick={
                        isMilestoneObject ? handlePortClick : undefined
                      }
                    />
                  ),
                )}
              </RecordRoadmapSwimlane>
            ))}
            {recordIndexRoadmapShowToday && (
              <RecordRoadmapTodayLine
                viewportStart={renderedDaysStart}
                dayWidthPx={dayWidthPx}
              />
            )}
            {isMilestoneObject && (
              <RecordRoadmapDependencyConnectors
                dependencies={dependencies}
                barLayouts={barLayouts}
                canvasWidthPx={canvasWidthPx}
                canvasHeightPx={canvasHeightPx}
                onDependencyClick={readOnly ? undefined : handleDependencyClick}
              />
            )}
            {isMilestoneObject && (
              <RecordRoadmapConnectionPreview
                anchorXPx={recordRoadmapPendingConnection?.anchorXPx ?? null}
                anchorYPx={recordRoadmapPendingConnection?.anchorYPx ?? null}
                cursorXPx={connectionCursor?.xPx ?? null}
                cursorYPx={connectionCursor?.yPx ?? null}
                canvasWidthPx={canvasWidthPx}
                canvasHeightPx={canvasHeightPx}
              />
            )}
            {isMilestoneObject && selectedDependency !== null && (
              <RecordRoadmapDependencyPopover
                dependency={selectedDependency.dependency}
                anchorXPx={selectedDependency.anchorXPx}
                anchorYPx={selectedDependency.anchorYPx}
                canvasWidthPx={canvasWidthPx}
                onClose={handleDependencyClosePopover}
                onDelete={handleDependencyDelete}
                onDescriptionSave={handleDependencyDescriptionSave}
              />
            )}
          </StyledTimelineInner>
        </StyledTimelineCanvas>
      </StyledScrollRow>
      {isModalOpened && <RecordIndexRemoveSortingModal />}
    </StyledTimelineContainer>
  );
};
