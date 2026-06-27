import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { isFieldFullNameValue } from '@/object-record/record-field/ui/types/guards/isFieldFullNameValue';
import { isDefined } from 'twenty-shared/utils';

// Resolves a to-one RELATION field value to the related record's human label,
// using the related object's configured labelIdentifier (so it handles
// FULL_NAME composites like a person's `name`, not just plain `name` text).
// Falls back to the related record id, then null. This is what lets the
// timeline show "Acme Corp" / "Jane Doe" instead of the raw UUID or
// `[object Object]` that `String(record[field])` produced.
export const resolveRoadmapRelationLabel = ({
  rawValue,
  targetObjectMetadataItem,
}: {
  rawValue: unknown;
  targetObjectMetadataItem:
    | Pick<
        EnrichedObjectMetadataItem,
        'fields' | 'labelIdentifierFieldMetadataId'
      >
    | undefined;
}): string | null => {
  if (!isDefined(rawValue) || typeof rawValue !== 'object') {
    return null;
  }
  const related = rawValue as Record<string, unknown>;

  const labelIdentifierName = isDefined(targetObjectMetadataItem)
    ? getLabelIdentifierFieldMetadataItem(targetObjectMetadataItem)?.name
    : undefined;
  const labelValue = related[labelIdentifierName ?? 'name'];

  if (isFieldFullNameValue(labelValue)) {
    const fullName =
      `${labelValue.firstName ?? ''} ${labelValue.lastName ?? ''}`.trim();
    if (fullName.length > 0) {
      return fullName;
    }
  }
  if (typeof labelValue === 'string' && labelValue.length > 0) {
    return labelValue;
  }

  const relatedId = related.id;
  return typeof relatedId === 'string' ? relatedId : null;
};
