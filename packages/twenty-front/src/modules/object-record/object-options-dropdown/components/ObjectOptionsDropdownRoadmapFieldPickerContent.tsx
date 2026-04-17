import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

import { recordIndexRoadmapFieldEndIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldEndIdState';
import { recordIndexRoadmapFieldStartIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldStartIdState';

type RoadmapFieldRole = 'start' | 'end';

type Props = {
  role: RoadmapFieldRole;
};

// Generic picker sub-page for the ROADMAP view's start / end DATE field. One
// instance per role keeps the content narrow and matches the Calendar date-
// field sub-page pattern.
export const ObjectOptionsDropdownRoadmapFieldPickerContent = ({
  role,
}: Props) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchInput, setSearchInput] = useState('');

  const { objectMetadataItem, resetContent, closeDropdown } =
    useObjectOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();
  const { updateCurrentView } = useUpdateCurrentView();

  const setRecordIndexRoadmapFieldStartId = useSetAtomState(
    recordIndexRoadmapFieldStartIdState,
  );
  const setRecordIndexRoadmapFieldEndId = useSetAtomState(
    recordIndexRoadmapFieldEndIdState,
  );

  const availableFields = objectMetadataItem.fields.filter((field) =>
    isFieldMetadataDateKind(field.type),
  );

  const currentFieldId =
    role === 'start'
      ? currentView?.roadmapFieldStartId
      : currentView?.roadmapFieldEndId;

  const otherFieldId =
    role === 'start'
      ? currentView?.roadmapFieldEndId
      : currentView?.roadmapFieldStartId;

  const currentField = currentFieldId
    ? objectMetadataItem.fields.find((field) => field.id === currentFieldId)
    : undefined;

  const filteredFields = availableFields.filter((field) =>
    field.label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const handleSelect = async (field: FieldMetadataItem) => {
    if (field.id === otherFieldId) {
      // Backend would reject (start === end); nothing to do client-side
      // beyond keeping the dropdown open so the user can try another field.
      return;
    }
    if (role === 'start') {
      setRecordIndexRoadmapFieldStartId(field.id);
      await updateCurrentView({ roadmapFieldStartId: field.id });
    } else {
      setRecordIndexRoadmapFieldEndId(field.id);
      await updateCurrentView({ roadmapFieldEndId: field.id });
    }
    closeDropdown();
  };

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => resetContent()}
            Icon={IconChevronLeft}
          />
        }
      >
        {role === 'start' ? t`Start date field` : t`End date field`}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={searchInput}
        placeholder={t`Search fields`}
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        {filteredFields.map((field) => (
          <MenuItemSelect
            key={field.id}
            selected={field.id === currentField?.id}
            disabled={field.id === otherFieldId}
            onClick={() => handleSelect(field)}
            LeftIcon={getIcon(field.icon)}
            text={field.label}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
