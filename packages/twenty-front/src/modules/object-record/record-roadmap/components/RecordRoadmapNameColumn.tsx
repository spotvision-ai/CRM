import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  ROADMAP_HEADER_HEIGHT,
  ROADMAP_NAME_COLUMN_WIDTH,
  ROADMAP_ROW_HEIGHT,
  ROADMAP_SWIMLANE_HEADER_HEIGHT,
} from '@/object-record/record-roadmap/constants/RoadmapDimensions';
import { type RoadmapSwimlane } from '@/object-record/record-roadmap/hooks/useRecordRoadmapSwimlanes';

// Lives inside its own dedicated vertical scroller (`StyledNameColumnScroller`
// in RecordRoadmapTimeline); the timeline's onScroll handler mirrors its
// scrollTop onto the scroller so the two panes always show the same rows.
const StyledColumn = styled.div`
  background-color: ${themeCssVariables.background.primary};
`;

// Pinned at the top of the name-column scroller so it mirrors the timeline's
// sticky time header: vertical scroll slides the labels underneath, but this
// spacer stays put.
const StyledTimeHeaderSpacer = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  height: ${ROADMAP_HEADER_HEIGHT}px;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const StyledSwimlaneGroup = styled.div`
  position: relative;
`;

const StyledSwimlaneHeader = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${ROADMAP_SWIMLANE_HEADER_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledColorDot = styled.span`
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  height: 8px;
  width: 8px;
`;

const StyledNameRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  height: ${ROADMAP_ROW_HEIGHT}px;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background-color: ${themeCssVariables.background.secondary};
  }
`;

type RecordRoadmapNameColumnProps = {
  swimlanes: RoadmapSwimlane[];
  onOpenRecord?: (recordId: string) => void;
};

export const RecordRoadmapNameColumn = ({
  swimlanes,
  onOpenRecord,
}: RecordRoadmapNameColumnProps) => (
  <StyledColumn style={{ width: ROADMAP_NAME_COLUMN_WIDTH }}>
    <StyledTimeHeaderSpacer />
    {swimlanes.map((swimlane) => (
      <StyledSwimlaneGroup key={swimlane.key}>
        <StyledSwimlaneHeader>
          {swimlane.color !== undefined && swimlane.color !== null && (
            <StyledColorDot style={{ backgroundColor: swimlane.color }} />
          )}
          {swimlane.label}
        </StyledSwimlaneHeader>
        {swimlane.records.map((placed) => (
          <StyledNameRow
            key={placed.record.id}
            title={placed.label}
            onClick={() => onOpenRecord?.(placed.record.id)}
          >
            {placed.label}
          </StyledNameRow>
        ))}
      </StyledSwimlaneGroup>
    ))}
  </StyledColumn>
);
