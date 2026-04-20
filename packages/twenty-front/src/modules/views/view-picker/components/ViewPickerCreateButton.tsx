import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewType } from '@/views/types/ViewType';
import { useCreateViewFromCurrentState } from '@/views/view-picker/hooks/useCreateViewFromCurrentState';
import { useDestroyViewFromCurrentState } from '@/views/view-picker/hooks/useDestroyViewFromCurrentState';
import { useGetAvailableFieldsForCalendar } from '@/views/view-picker/hooks/useGetAvailableFieldsForCalendar';
import { useGetAvailableFieldsForRoadmap } from '@/views/view-picker/hooks/useGetAvailableFieldsForRoadmap';
import { useGetAvailableFieldsToGroupRecordsBy } from '@/views/view-picker/hooks/useGetAvailableFieldsToGroupRecordsBy';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerCalendarFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerCalendarFieldMetadataIdComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerMainGroupByFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerMainGroupByFieldMetadataIdComponentState';
import { viewPickerRoadmapFieldEndIdComponentState } from '@/views/view-picker/states/viewPickerRoadmapFieldEndIdComponentState';
import { viewPickerRoadmapFieldStartIdComponentState } from '@/views/view-picker/states/viewPickerRoadmapFieldStartIdComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/input';

export const ViewPickerCreateButton = () => {
  const { t } = useLingui();
  const { availableFieldsForGrouping, navigateToSelectSettings } =
    useGetAvailableFieldsToGroupRecordsBy();
  const { availableFieldsForCalendar, navigateToDateFieldSettings } =
    useGetAvailableFieldsForCalendar();
  const { availableFieldsForRoadmap } = useGetAvailableFieldsForRoadmap();

  const { viewPickerMode } = useViewPickerMode();
  const viewPickerType = useAtomComponentStateValue(
    viewPickerTypeComponentState,
  );
  const viewPickerIsPersisting = useAtomComponentStateValue(
    viewPickerIsPersistingComponentState,
  );
  const viewPickerMainGroupByFieldMetadataId = useAtomComponentStateValue(
    viewPickerMainGroupByFieldMetadataIdComponentState,
  );
  const viewPickerCalendarFieldMetadataId = useAtomComponentStateValue(
    viewPickerCalendarFieldMetadataIdComponentState,
  );
  const viewPickerRoadmapFieldStartId = useAtomComponentStateValue(
    viewPickerRoadmapFieldStartIdComponentState,
  );
  const viewPickerRoadmapFieldEndId = useAtomComponentStateValue(
    viewPickerRoadmapFieldEndIdComponentState,
  );

  // Roadmap needs two distinct DATE fields. Mirror the same "Go to Settings"
  // escape hatch CALENDAR uses when the object has zero eligible fields.
  const isRoadmapInvalid =
    viewPickerType === ViewType.ROADMAP &&
    (viewPickerRoadmapFieldStartId === '' ||
      viewPickerRoadmapFieldEndId === '' ||
      viewPickerRoadmapFieldStartId === viewPickerRoadmapFieldEndId);

  const { createViewFromCurrentState } = useCreateViewFromCurrentState();
  const { destroyViewFromCurrentState } = useDestroyViewFromCurrentState();

  const handleCreateButtonClick = () => {
    createViewFromCurrentState();
  };

  if (viewPickerMode === 'edit') {
    return (
      <Button
        title={t`Delete`}
        onClick={destroyViewFromCurrentState}
        accent="danger"
        fullWidth
        size="small"
        justify="center"
        focus={false}
        variant="secondary"
        disabled={viewPickerIsPersisting}
      />
    );
  }

  if (
    viewPickerType === ViewType.KANBAN &&
    availableFieldsForGrouping.length === 0
  ) {
    return (
      <Button
        title={t`Go to Settings`}
        onClick={navigateToSelectSettings}
        size="small"
        accent="blue"
        fullWidth
        justify="center"
      />
    );
  }

  if (
    viewPickerType === ViewType.CALENDAR &&
    availableFieldsForCalendar.length === 0
  ) {
    return (
      <Button
        title={t`Go to Settings`}
        onClick={navigateToDateFieldSettings}
        size="small"
        accent="blue"
        fullWidth
        justify="center"
      />
    );
  }

  if (
    viewPickerType === ViewType.ROADMAP &&
    availableFieldsForRoadmap.length < 2
  ) {
    return (
      <Button
        title={t`Go to Settings`}
        onClick={navigateToDateFieldSettings}
        size="small"
        accent="blue"
        fullWidth
        justify="center"
      />
    );
  }

  if (
    viewPickerType !== ViewType.KANBAN ||
    viewPickerMainGroupByFieldMetadataId !== ''
  ) {
    return (
      <Button
        title={t`Create`}
        onClick={handleCreateButtonClick}
        ariaLabel={t`Create new view`}
        accent="blue"
        fullWidth
        size="small"
        justify="center"
        disabled={
          viewPickerIsPersisting ||
          (viewPickerType === ViewType.KANBAN &&
            viewPickerMainGroupByFieldMetadataId === '') ||
          (viewPickerType === ViewType.CALENDAR &&
            viewPickerCalendarFieldMetadataId === '') ||
          isRoadmapInvalid
        }
      />
    );
  }
};
