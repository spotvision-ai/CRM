import { styled } from '@linaria/react';

import { MilestonesCard } from '@/activities/milestones/components/MilestonesCard';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  /* As a grid item the default min-height:auto lets the content grow past the
     widget card, which clips instead of scrolling. */
  min-height: 0;
  width: 100%;
`;

type MilestonesWidgetProps = {
  widget: PageLayoutWidget;
};

export const MilestonesWidget = ({
  widget: _widget,
}: MilestonesWidgetProps) => {
  const { isInSidePanel } = useLayoutRenderingContext();

  return (
    <SidePanelProvider value={{ isInSidePanel }}>
      <StyledContainer>
        <MilestonesCard />
      </StyledContainer>
    </SidePanelProvider>
  );
};
