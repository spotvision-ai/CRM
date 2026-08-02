import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { v4 } from 'uuid';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';

type AddMilestoneButtonProps = {
  opportunityId: string;
  size?: 'small' | 'medium';
};

export const AddMilestoneButton = ({
  opportunityId,
  size = 'small',
}: AddMilestoneButtonProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'opportunityMilestone',
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: 'opportunityMilestone',
  });

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  if (!objectPermissions.canUpdateObjectRecords) {
    return null;
  }

  const handleClick = async () => {
    const recordId = v4();

    // `position: 'last'` lets the server append it to the deal's milestones —
    // the column default of 0 would tie every new record at the top.
    await createOneRecord({
      id: recordId,
      opportunityId,
      position: 'last',
    });

    openRecordInSidePanel({
      recordId,
      objectNameSingular: 'opportunityMilestone',
      isNewRecord: true,
    });
  };

  return (
    <Button
      Icon={IconPlus}
      size={size}
      variant="secondary"
      title={t`Add milestone`}
      onClick={handleClick}
    />
  );
};
