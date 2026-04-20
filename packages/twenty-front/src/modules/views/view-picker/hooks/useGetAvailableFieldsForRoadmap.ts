import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';

// Roadmap views need two DATE/DATE_TIME fields (start and end). The helper
// simply returns the same DATE-kind field list as Calendar — the caller
// decides which one is start vs. end and must ensure the two selections
// differ before creating the view.
export const useGetAvailableFieldsForRoadmap = () => {
  const viewObjectMetadataId = useAtomComponentStateValue(
    viewObjectMetadataIdComponentState,
  );
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadata) => objectMetadata.id === viewObjectMetadataId,
  );

  const availableFieldsForRoadmap =
    objectMetadataItem?.readableFields.filter((field) =>
      isFieldMetadataDateKind(field.type),
    ) ?? [];

  return { availableFieldsForRoadmap };
};
