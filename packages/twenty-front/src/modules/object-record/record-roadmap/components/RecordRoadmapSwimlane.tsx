import { styled } from '@linaria/react';
import { type MouseEvent, type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ROADMAP_SWIMLANE_HEADER_HEIGHT } from '@/object-record/record-roadmap/constants/RoadmapDimensions';

const StyledSwimlane = styled.div`
  position: relative;
`;

// Empty strip on the timeline side that matches the name-column header's
// height so the rows below line up one-for-one between the two panes.
// `box-sizing: border-box` is critical — it mirrors the name-column header
// so both count the 1px bottom border inside the 28 px height and don't
// drift row-for-row on vertical scroll.
const StyledSwimlaneHeaderStrip = styled.div`
  background-color: ${themeCssVariables.background.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  height: ${ROADMAP_SWIMLANE_HEADER_HEIGHT}px;
`;

type RecordRoadmapSwimlaneProps = {
  swimlaneKey: string;
  children: ReactNode;
  onDoubleClickEmptyArea?: (args: {
    swimlaneKey: string;
    clientX: number;
  }) => void;
};

// Groups records that share the same value of the SELECT field configured on
// the view (or a synthetic `__uncategorized__` bucket when the field is
// unset). The `data-roadmap-swimlane-key` attribute is what the bar drag hook
// reads via document.elementFromPoint to detect a cross-swimlane drop.
// The label/color used to render inline here; they now live in the sticky
// left-side name column so long names stay legible without overlapping bars.
export const RecordRoadmapSwimlane = ({
  swimlaneKey,
  children,
  onDoubleClickEmptyArea,
}: RecordRoadmapSwimlaneProps) => {
  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (onDoubleClickEmptyArea === undefined) return;
    // Ignore clicks that land on a bar — the bar stops propagation via its
    // own pointer handlers, but be defensive.
    const target = event.target as HTMLElement | null;
    if (target !== null && target.closest('[data-roadmap-bar]') !== null) {
      return;
    }
    onDoubleClickEmptyArea({ swimlaneKey, clientX: event.clientX });
  };

  return (
    <StyledSwimlane
      data-roadmap-swimlane-key={swimlaneKey}
      onDoubleClick={handleDoubleClick}
    >
      <StyledSwimlaneHeaderStrip />
      {children}
    </StyledSwimlane>
  );
};
