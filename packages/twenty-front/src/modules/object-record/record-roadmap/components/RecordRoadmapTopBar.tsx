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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]};
  gap: ${themeCssVariables.spacing[2]};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  flex-shrink: 0;
`;

const StyledGroup = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  align-items: center;
`;

const StyledButton = styled.button<{ isActive?: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 ${themeCssVariables.spacing[2]};
  background-color: ${(props) =>
    props.isActive
      ? themeCssVariables.background.tertiary
      : themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm};
  cursor: pointer;

  &:hover {
    background-color: ${themeCssVariables.background.tertiary};
  }
`;

const StyledHiddenCounter = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const ZOOM_OPTIONS: { value: ViewRoadmapZoom; label: string }[] = [
  { value: ViewRoadmapZoom.DAY, label: 'Day' },
  { value: ViewRoadmapZoom.WEEK, label: 'Week' },
  { value: ViewRoadmapZoom.MONTH, label: 'Month' },
  { value: ViewRoadmapZoom.QUARTER, label: 'Quarter' },
];

export const RecordRoadmapTopBar = () => {
  const { t } = useLingui();

  const [zoom, setZoom] = useAtomComponentState(
    recordRoadmapZoomComponentState,
  );
  const [, setViewportStart] = useAtomComponentState(
    recordRoadmapViewportStartComponentState,
  );

  const hiddenRecordCount = useAtomComponentStateValue(
    recordRoadmapHiddenRecordCountComponentState,
  );

  const handleTodayClick = () => {
    // Align today to roughly one-third from the left — keeps some past
    // context visible and leaves more future runway where most planning
    // happens.
    setViewportStart(Temporal.Now.plainDateISO().subtract({ months: 1 }));
  };

  return (
    <StyledTopBar>
      <StyledGroup>
        {ZOOM_OPTIONS.map((option) => (
          <StyledButton
            key={option.value}
            isActive={zoom === option.value}
            onClick={() => setZoom(option.value)}
          >
            {option.label}
          </StyledButton>
        ))}
        <StyledButton onClick={handleTodayClick}>{t`Today`}</StyledButton>
      </StyledGroup>
      {hiddenRecordCount > 0 && (
        <StyledHiddenCounter>
          {t`${hiddenRecordCount} records hidden (missing dates)`}
        </StyledHiddenCounter>
      )}
    </StyledTopBar>
  );
};
