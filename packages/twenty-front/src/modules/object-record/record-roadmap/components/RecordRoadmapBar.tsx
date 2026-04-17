import { styled } from '@linaria/react';
import { type Temporal } from 'temporal-polyfill';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  ROADMAP_BAR_HEIGHT,
  ROADMAP_BAR_VERTICAL_PADDING,
} from '@/object-record/record-roadmap/constants/RoadmapDimensions';
import { computeRoadmapBarPosition } from '@/object-record/record-roadmap/utils/computeRoadmapBarPosition';

const StyledBar = styled.div<{ hasError: boolean }>`
  position: absolute;
  top: ${ROADMAP_BAR_VERTICAL_PADDING}px;
  height: ${ROADMAP_BAR_HEIGHT}px;
  display: flex;
  align-items: center;
  padding: 0 ${themeCssVariables.spacing[2]};
  border-radius: 4px;
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid
    ${(props) =>
      props.hasError
        ? themeCssVariables.border.color.danger
        : themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;

  &:hover {
    background-color: ${themeCssVariables.background.tertiary};
  }
`;

type RecordRoadmapBarProps = {
  label: string;
  startDate: Temporal.PlainDate;
  endDate: Temporal.PlainDate;
  viewportStart: Temporal.PlainDate;
  dayWidthPx: number;
};

export const RecordRoadmapBar = ({
  label,
  startDate,
  endDate,
  viewportStart,
  dayWidthPx,
}: RecordRoadmapBarProps) => {
  const { leftPx, widthPx, durationDays } = computeRoadmapBarPosition({
    startDate,
    endDate,
    viewportStart,
    dayWidthPx,
  });

  const hasError = durationDays < 0;

  return (
    <StyledBar
      hasError={hasError}
      style={{ left: leftPx, width: widthPx }}
      title={
        hasError
          ? `End date is before start date (${startDate.toString()} → ${endDate.toString()})`
          : `${label} (${startDate.toString()} → ${endDate.toString()})`
      }
    >
      {label}
    </StyledBar>
  );
};
