import { styled } from '@linaria/react';

import { RecordRoadmapTimeline } from '@/object-record/record-roadmap/components/RecordRoadmapTimeline';
import { RecordRoadmapTopBar } from '@/object-record/record-roadmap/components/RecordRoadmapTopBar';

const StyledRoot = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

export const RecordRoadmap = () => (
  <StyledRoot>
    <RecordRoadmapTopBar />
    <RecordRoadmapTimeline />
  </StyledRoot>
);
