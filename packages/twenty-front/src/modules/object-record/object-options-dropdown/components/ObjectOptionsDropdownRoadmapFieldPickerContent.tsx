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
import { FieldMetadataType } from 'twenty-shared/types';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

import { recordIndexRoadmapFieldColorIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldColorIdState';
import { recordIndexRoadmapFieldEndIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldEndIdState';
import { recordIndexRoadmapFieldStartIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldStartIdState';

type RoadmapFieldRole = 'start' | 'end' | 'color';

type ObjectOptionsDropdownRoadmapFieldPickerContentProps = {
  role: RoadmapFieldRole;
};

// Shared picker sub-page for every per-field ROADMAP setting. The `role` prop
// decides which field subset is listed (DATE fields for start/end, SELECT
// fields for color) and which view column is persisted on select. Keeping
// the three sub-pages in one file avoids duplicating dropdown boilerplate.
export const ObjectOptionsDropdownRoadmapFieldPickerContent = ({
  role,
}: ObjectOptionsDropdownRoadmapFieldPickerContentProps) => {
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
  const setRecordIndexRoadmapFieldColorId = useSetAtomState(
    recordIndexRoadmapFieldColorIdState,
  );

  const availableFields = objectMetadataItem.fields.filter((field) => {
    if (role === 'color') {
      return field.type === FieldMetadataType.SELECT;
    }
    return isFieldMetadataDateKind(field.type);
  });

  const currentFieldId =
    role === 'start'
      ? currentView?.roadmapFieldStartId
      : role === 'end'
        ? currentView?.roadmapFieldEndId
        : currentView?.roadmapFieldColorId;

  // Start/end must differ from each other; color has no conflict constraint.
  const otherFieldId =
    role === 'start'
      ? currentView?.roadmapFieldEndId
      : role === 'end'
        ? currentView?.roadmapFieldStartId
        : null;

  const currentField = currentFieldId
    ? objectMetadataItem.fields.find((field) => field.id === currentFieldId)
    : undefined;

  const filteredFields = availableFields.filter((field) =>
    field.label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const handleSelect = async (field: FieldMetadataItem) => {
    if (field.id === otherFieldId) {
      // Backend would reject start === end; nothing to do client-side
      // beyond keeping the dropdown open so the user can try another field.
      return;
    }
    if (role === 'start') {
      setRecordIndexRoadmapFieldStartId(field.id);
      await updateCurrentView({ roadmapFieldStartId: field.id });
    } else if (role === 'end') {
      setRecordIndexRoadmapFieldEndId(field.id);
      await updateCurrentView({ roadmapFieldEndId: field.id });
    } else {
      setRecordIndexRoadmapFieldColorId(field.id);
      await updateCurrentView({ roadmapFieldColorId: field.id });
    }
    closeDropdown();
  };

  const handleClear = async () => {
    if (role !== 'color') return;
    setRecordIndexRoadmapFieldColorId(null);
    await updateCurrentView({ roadmapFieldColorId: null });
    closeDropdown();
  };

  const headerLabel =
    role === 'start'
      ? t`Start date field`
      : role === 'end'
        ? t`End date field`
        : t`Color field`;

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
        {headerLabel}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={searchInput}
        placeholder={t`Search fields`}
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        {role === 'color' && currentField !== undefined && (
          <MenuItemSelect
            selected={false}
            onClick={handleClear}
            text={t`No color`}
          />
        )}
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
