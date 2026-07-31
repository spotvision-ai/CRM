import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { Tag } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { MilestoneRow } from '@/activities/milestones/components/MilestoneRow';
import { useOpportunityMilestones } from '@/activities/milestones/hooks/useOpportunityMilestones';
import { resolveMilestoneSelectChip } from '@/activities/milestones/utils/resolveMilestoneSelectChip';
import { useRecordRoadmapDependencies } from '@/object-record/record-roadmap/hooks/useRecordRoadmapDependencies';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
`;

const StyledFilterBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
`;

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  /* Extra bottom padding so the last card doesn't sit flush against the
     scroll edge, which reads as a cut-off row. */
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[6]};
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[6]};
  text-align: center;
`;

export const MilestonesCard = () => {
  const targetRecord = useTargetRecord();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const [selectedStatusValues, setSelectedStatusValues] = useState<
    string[] | null
  >(null);

  const isOpportunity = targetRecord.targetObjectNameSingular === 'opportunity';

  const {
    milestones,
    loading,
    statusOptions,
    effectiveStatusValues,
    statusFieldMetadataItem,
    blockedByFieldMetadataItem,
  } = useOpportunityMilestones({
    opportunityId: targetRecord.id,
    enabled: isOpportunity,
    selectedStatusValues,
  });

  const { dependencies } = useRecordRoadmapDependencies({
    recordIds: milestones.map((milestone) => milestone.id),
    enabled: isOpportunity,
  });

  const dependsOnCountByMilestoneId = dependencies.reduce<
    Record<string, number>
  >((counts, dependency) => {
    counts[dependency.dependentMilestoneId] =
      (counts[dependency.dependentMilestoneId] ?? 0) + 1;
    return counts;
  }, {});

  const today = Temporal.Now.plainDateISO();

  const toggleStatusValue = (statusValue: string) => {
    const currentValues = effectiveStatusValues ?? [];
    setSelectedStatusValues(
      currentValues.includes(statusValue)
        ? currentValues.filter((value) => value !== statusValue)
        : [...currentValues, statusValue],
    );
  };

  if (!isOpportunity) {
    return (
      <StyledEmpty>
        {t`Milestones are only available on Opportunities.`}
      </StyledEmpty>
    );
  }

  const renderListContent = () => {
    if (loading) {
      return <StyledEmpty>{t`Loading milestones…`}</StyledEmpty>;
    }

    if (milestones.length === 0) {
      return (
        <StyledEmpty>
          {statusOptions.length > 0
            ? t`No milestones match the selected statuses.`
            : t`No milestones yet for this deal.`}
        </StyledEmpty>
      );
    }

    return (
      <StyledList>
        {milestones.map((milestone) => (
          <MilestoneRow
            key={milestone.id}
            milestone={milestone}
            statusChip={resolveMilestoneSelectChip(
              statusFieldMetadataItem,
              milestone.status,
            )}
            blockedByChip={
              milestone.blockedBy?.toUpperCase() === 'NONE'
                ? null
                : resolveMilestoneSelectChip(
                    blockedByFieldMetadataItem,
                    milestone.blockedBy,
                  )
            }
            dependsOnCount={dependsOnCountByMilestoneId[milestone.id] ?? 0}
            today={today}
            onClick={() => {
              openRecordInSidePanel({
                recordId: milestone.id,
                objectNameSingular: 'opportunityMilestone',
              });
            }}
          />
        ))}
      </StyledList>
    );
  };

  return (
    <StyledContainer>
      {statusOptions.length > 0 && (
        <StyledFilterBar>
          {statusOptions.map((option) => {
            const chip = resolveMilestoneSelectChip(
              statusFieldMetadataItem,
              option.value,
            );
            const isSelected =
              effectiveStatusValues?.includes(option.value) === true;

            return (
              <Tag
                key={option.value}
                color={isSelected ? (chip?.color ?? 'gray') : 'transparent'}
                variant={isSelected ? 'solid' : 'border'}
                weight={isSelected ? 'medium' : 'regular'}
                text={chip?.label ?? option.value}
                onClick={() => toggleStatusValue(option.value)}
                preventShrink
              />
            );
          })}
        </StyledFilterBar>
      )}
      <StyledScrollArea>{renderListContent()}</StyledScrollArea>
    </StyledContainer>
  );
};
