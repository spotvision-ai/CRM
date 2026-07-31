import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { type Temporal } from 'temporal-polyfill';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Avatar, Tag } from 'twenty-ui/data-display';
import {
  IconAlertTriangle,
  IconCalendar,
  IconCalendarEvent,
  IconGitBranch,
  IconLock,
} from 'twenty-ui/icon';
import { Card } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ActivityRow } from '@/activities/components/ActivityRow';
import { type MilestoneCardRecord } from '@/activities/milestones/types/MilestoneCardRecord';
import { type MilestoneSelectChip } from '@/activities/milestones/utils/resolveMilestoneSelectChip';
import { stripMilestoneMarkdown } from '@/activities/milestones/utils/stripMilestoneMarkdown';
import { computeRoadmapDeviation } from '@/object-record/record-roadmap/hooks/useRecordRoadmapDeviation';
import { parseRoadmapDateValue } from '@/object-record/record-roadmap/utils/computeRoadmapBarPosition';
import { beautifyExactDate } from '~/utils/date-utils';

// Each milestone gets its own card rather than sharing one with hairline
// dividers: rows here are multi-line, so a 1px divider doesn't read as a
// boundary. The nested selector overrides ActivityRow's fixed 48px height,
// which a description plus a tag row overflows.
const StyledMilestoneCard = styled(Card)`
  flex-shrink: 0;

  > div > div {
    align-items: flex-start;
    height: auto;
    min-height: ${themeCssVariables.spacing[12]};
    padding-bottom: ${themeCssVariables.spacing[2]};
    padding-top: ${themeCssVariables.spacing[2]};
  }
`;

const StyledLeftSide = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

// The title owns its own line: the status and blockedBy tags below use
// `preventShrink`, so sharing a row would collapse the title to zero width.
const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

const StyledTagRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledDescription = styled.div`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: ${themeCssVariables.font.color.secondary};
  display: -webkit-box;
  font-size: ${themeCssVariables.font.size.sm};
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledMetaRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledMetaItem = styled.div`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledRightSide = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  margin-left: ${themeCssVariables.spacing[3]};
  white-space: nowrap;
`;

const StyledDateRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: inline-flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledDateLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  text-transform: uppercase;
`;

const formatMilestoneDateRange = (
  startDate: string | null,
  endDate: string | null,
): string | null => {
  const formattedStart = isNonEmptyString(startDate)
    ? beautifyExactDate(startDate)
    : null;
  const formattedEnd = isNonEmptyString(endDate)
    ? beautifyExactDate(endDate)
    : null;

  if (!isDefined(formattedStart)) {
    return formattedEnd;
  }
  if (!isDefined(formattedEnd)) {
    return formattedStart;
  }

  return formattedStart === formattedEnd
    ? formattedEnd
    : `${formattedStart} - ${formattedEnd}`;
};

const getAssigneeFullName = (
  assignee: MilestoneCardRecord['assignee'],
): string | null => {
  if (!isDefined(assignee)) {
    return null;
  }

  const fullName =
    `${assignee.name?.firstName ?? ''} ${assignee.name?.lastName ?? ''}`.trim();

  return isNonEmptyString(fullName) ? fullName : null;
};

type MilestoneRowProps = {
  milestone: MilestoneCardRecord;
  statusChip: MilestoneSelectChip | null;
  blockedByChip: MilestoneSelectChip | null;
  dependsOnCount: number;
  today: Temporal.PlainDate;
  onClick: () => void;
};

export const MilestoneRow = ({
  milestone,
  statusChip,
  blockedByChip,
  dependsOnCount,
  today,
  onClick,
}: MilestoneRowProps) => {
  const descriptionPreview = isDefined(milestone.description?.markdown)
    ? stripMilestoneMarkdown(milestone.description.markdown)
    : '';

  const plannedRange = formatMilestoneDateRange(
    milestone.plannedStartDate,
    milestone.plannedEndDate,
  );

  const plannedEndDate = parseRoadmapDateValue(milestone.plannedEndDate);
  const actualEndDate =
    parseRoadmapDateValue(milestone.actualEndDate) ?? plannedEndDate;

  // Without an actual end the planned end doubles as the projection, so the
  // deviation collapses to plain "days past planned".
  const deviation =
    isDefined(plannedEndDate) && isDefined(actualEndDate)
      ? computeRoadmapDeviation({
          plannedEndDate,
          actualEndDate,
          status: milestone.status,
          today,
        })
      : null;

  const assigneeFullName = getAssigneeFullName(milestone.assignee);

  return (
    <StyledMilestoneCard fullWidth rounded>
      <ActivityRow onClick={onClick}>
        <StyledLeftSide>
          <StyledTitle>{milestone.name || t`Untitled milestone`}</StyledTitle>
          {(isDefined(statusChip) || isDefined(blockedByChip)) && (
            <StyledTagRow>
              {isDefined(statusChip) && (
                <Tag
                  color={statusChip.color}
                  text={statusChip.label}
                  weight="medium"
                  preventShrink
                />
              )}
              {isDefined(blockedByChip) && (
                <Tag
                  color={blockedByChip.color}
                  text={blockedByChip.label}
                  Icon={IconLock}
                  preventShrink
                />
              )}
            </StyledTagRow>
          )}
          {descriptionPreview !== '' && (
            <StyledDescription>{descriptionPreview}</StyledDescription>
          )}
          {(isDefined(assigneeFullName) || dependsOnCount > 0) && (
            <StyledMetaRow>
              {isDefined(assigneeFullName) && (
                <StyledMetaItem>
                  <Avatar
                    size="xs"
                    type="rounded"
                    placeholder={assigneeFullName}
                    avatarUrl={milestone.assignee?.avatarUrl}
                  />
                  {assigneeFullName}
                </StyledMetaItem>
              )}
              {dependsOnCount > 0 && (
                <StyledMetaItem>
                  <IconGitBranch size={12} />
                  {plural(dependsOnCount, {
                    one: '# dependency',
                    other: '# dependencies',
                  })}
                </StyledMetaItem>
              )}
            </StyledMetaRow>
          )}
        </StyledLeftSide>
        <StyledRightSide>
          {isDefined(plannedRange) && (
            <StyledDateRow>
              <IconCalendarEvent size={12} />
              <StyledDateLabel>{t`Planned`}</StyledDateLabel>
              {plannedRange}
            </StyledDateRow>
          )}
          {isNonEmptyString(milestone.actualEndDate) && (
            <StyledDateRow>
              <IconCalendar size={12} />
              <StyledDateLabel>{t`Actual`}</StyledDateLabel>
              {beautifyExactDate(milestone.actualEndDate)}
            </StyledDateRow>
          )}
          {isDefined(deviation) && deviation.deviationDays > 0 && (
            <Tag
              color={deviation.isOverdue ? 'red' : 'orange'}
              text={
                deviation.isOverdue
                  ? t`${deviation.deviationDays}d overdue`
                  : t`${deviation.deviationDays}d late`
              }
              Icon={IconAlertTriangle}
              weight="medium"
              preventShrink
            />
          )}
        </StyledRightSide>
      </ActivityRow>
    </StyledMilestoneCard>
  );
};
