import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { recordRoadmapHiddenRecordCountComponentState } from '@/object-record/record-roadmap/states/recordRoadmapHiddenRecordCountComponentState';
import { recordRoadmapViewportStartComponentState } from '@/object-record/record-roadmap/states/recordRoadmapViewportStartComponentState';
import { recordRoadmapZoomComponentState } from '@/object-record/record-roadmap/states/recordRoadmapZoomComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewRoadmapZoom } from '~/generated-metadata/graphql';

const StyledTopBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledGroup = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledButton = styled.button<{ isActive?: boolean }>`
  align-items: center;
  background-color: ${(props) =>
    props.isActive
      ? themeCssVariables.background.tertiary
      : themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  height: 28px;
  padding: 0 ${themeCssVariables.spacing[2]};

  &:hover {
    background-color: ${themeCssVariables.background.tertiary};
  }
`;

const StyledHiddenCounter = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

// MONTH remains in the enum for back-compat with views persisted with that
// default zoom, but the UI only exposes the three groupings the PRD calls
// out: day (individual days), week (7-day buckets), quarter (months under
// Q1–Q4).
const ZOOM_OPTIONS: { value: ViewRoadmapZoom; label: string }[] = [
  { value: ViewRoadmapZoom.DAY, label: 'Day' },
  { value: ViewRoadmapZoom.WEEK, label: 'Week' },
  { value: ViewRoadmapZoom.QUARTER, label: 'Quarter' },
];

export const RecordRoadmapTopBar = () => {
  const { t } = useLingui();

  const [recordRoadmapZoom, setRecordRoadmapZoom] = useAtomComponentState(
    recordRoadmapZoomComponentState,
  );
  const [, setRecordRoadmapViewportStart] = useAtomComponentState(
    recordRoadmapViewportStartComponentState,
  );

  const recordRoadmapHiddenRecordCount = useAtomComponentStateValue(
    recordRoadmapHiddenRecordCountComponentState,
  );

  const handleTodayClick = () => {
    // Mirror the auto-fit rule (earliest record − 7 days) but anchored on
    // today instead of the data, so the user lands with a consistent 1-week
    // runway on the left regardless of where the records sit.
    setRecordRoadmapViewportStart(
      Temporal.Now.plainDateISO().subtract({ days: 7 }),
    );
  };

  return (
    <StyledTopBar>
      <StyledGroup>
        {ZOOM_OPTIONS.map((option) => (
          <StyledButton
            key={option.value}
            isActive={recordRoadmapZoom === option.value}
            onClick={() => setRecordRoadmapZoom(option.value)}
          >
            {option.label}
          </StyledButton>
        ))}
        <StyledButton onClick={handleTodayClick}>{t`Go today`}</StyledButton>
      </StyledGroup>
      {recordRoadmapHiddenRecordCount > 0 && (
        <StyledHiddenCounter>
          {t`${recordRoadmapHiddenRecordCount} records hidden (missing dates)`}
        </StyledHiddenCounter>
      )}
    </StyledTopBar>
  );
};
