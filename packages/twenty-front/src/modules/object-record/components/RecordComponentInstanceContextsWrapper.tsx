import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { RecordFieldsComponentInstanceContext } from '@/object-record/record-field/states/context/RecordFieldsComponentInstanceContext';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordRoadmapComponentInstanceContext } from '@/object-record/record-roadmap/states/contexts/RecordRoadmapComponentInstanceContext';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { type PropsWithChildren } from 'react';

export type RecordComponentInstanceContextsWrapperProps = PropsWithChildren<{
  componentInstanceId: string;
}>;

export const RecordComponentInstanceContextsWrapper = ({
  componentInstanceId,
  children,
}: RecordComponentInstanceContextsWrapperProps) => {
  return (
    <RecordFilterGroupsComponentInstanceContext.Provider
      value={{ instanceId: componentInstanceId }}
    >
      <RecordFiltersComponentInstanceContext.Provider
        value={{ instanceId: componentInstanceId }}
      >
        <RecordSortsComponentInstanceContext.Provider
          value={{ instanceId: componentInstanceId }}
        >
          <RecordFieldsComponentInstanceContext.Provider
            value={{ instanceId: componentInstanceId }}
          >
            <RecordCalendarComponentInstanceContext.Provider
              value={{ instanceId: componentInstanceId }}
            >
              <RecordRoadmapComponentInstanceContext.Provider
                value={{ instanceId: componentInstanceId }}
              >
                {children}
              </RecordRoadmapComponentInstanceContext.Provider>
            </RecordCalendarComponentInstanceContext.Provider>
          </RecordFieldsComponentInstanceContext.Provider>
        </RecordSortsComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFilterGroupsComponentInstanceContext.Provider>
  );
};
