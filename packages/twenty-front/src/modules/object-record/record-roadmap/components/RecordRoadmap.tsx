import { styled } from '@linaria/react';

import { RecordRoadmapTimeline } from '@/object-record/record-roadmap/components/RecordRoadmapTimeline';
import { RecordRoadmapTopBar } from '@/object-record/record-roadmap/components/RecordRoadmapTopBar';

// The parent StyledContainerWithPadding in RecordIndexContainer applies
// `flex: 1; min-height: 0` but is not itself a flex container, so our own
// `flex: 1` never resolves. Filling 100% of the parent's height lets the
// timeline canvas actually clip and scroll vertically when the swimlanes
// exceed the viewport.
const StyledRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

export const RecordRoadmap = () => (
  <StyledRoot>
    <RecordRoadmapTopBar />
    <RecordRoadmapTimeline />
  </StyledRoot>
);
