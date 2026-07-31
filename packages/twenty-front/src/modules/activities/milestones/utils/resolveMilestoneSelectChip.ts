import { isNonEmptyString } from '@sniptt/guards';
import { type ThemeColor } from 'twenty-ui/theme';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export type MilestoneSelectChip = {
  label: string;
  color: ThemeColor;
};

// Resolves a raw SELECT value into the label and color the workspace actually
// configured, so the widget shows "In progress" in purple instead of the raw
// `IN_PROGRESS`. Falls back to the raw value on workspaces whose options were
// renamed after the record was written.
export const resolveMilestoneSelectChip = (
  fieldMetadataItem: FieldMetadataItem | undefined,
  value: string | null,
): MilestoneSelectChip | null => {
  if (!isNonEmptyString(value)) {
    return null;
  }

  const option = fieldMetadataItem?.options?.find(
    (fieldOption) => fieldOption.value === value,
  );

  return {
    label: isNonEmptyString(option?.label) ? option.label : value,
    color: option?.color ?? 'gray',
  };
};
