import { styled } from '@linaria/react';
import { type MouseEvent, type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSwimlane = styled.div`
  position: relative;
`;

const StyledSwimlaneHeader = styled.div`
  position: sticky;
  left: 0;
  display: inline-flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  background-color: ${themeCssVariables.background.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.secondary};
  z-index: 2;
  /* The header sits on the scroll container's left edge so it stays readable
     while the user scrolls the timeline horizontally. */
`;

const StyledColorDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
`;

type RecordRoadmapSwimlaneProps = {
  swimlaneKey: string;
  label: string;
  color?: string | null;
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
export const RecordRoadmapSwimlane = ({
  swimlaneKey,
  label,
  color,
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
      <StyledSwimlaneHeader>
        {color !== undefined && color !== null && (
          <StyledColorDot style={{ backgroundColor: color }} />
        )}
        {label}
      </StyledSwimlaneHeader>
      {children}
    </StyledSwimlane>
  );
};
