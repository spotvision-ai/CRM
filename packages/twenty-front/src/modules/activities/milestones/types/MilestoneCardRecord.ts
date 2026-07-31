export type MilestoneCardRecord = {
  __typename: 'OpportunityMilestone';
  id: string;
  name: string | null;
  status: string | null;
  blockedBy: string | null;
  plannedStartDate: string | null;
  plannedEndDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  position: number | null;
  opportunityId: string | null;
  assigneeId: string | null;
  assignee: {
    id: string;
    name: { firstName: string | null; lastName: string | null } | null;
    avatarUrl: string | null;
  } | null;
  description: { markdown: string | null; blocknote: string | null } | null;
};
