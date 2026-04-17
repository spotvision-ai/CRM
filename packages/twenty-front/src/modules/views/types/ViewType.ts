import {
  IconCalendar,
  type IconComponent,
  IconLayoutKanban,
  IconTable,
  IconTimelineEvent,
} from 'twenty-ui/display';

export { ViewType } from '~/generated-metadata/graphql';
import { ViewType } from '~/generated-metadata/graphql';

const VIEW_TYPE_ICON_MAPPING = [
  { icon: IconLayoutKanban, value: ViewType.KANBAN },
  { icon: IconTable, value: ViewType.TABLE },
  { icon: IconCalendar, value: ViewType.CALENDAR },
  { icon: IconTimelineEvent, value: ViewType.ROADMAP },
] as const satisfies {
  icon: IconComponent;
  value: ViewType;
}[];

export const viewTypeIconMapping = (viewType?: ViewType) => {
  return (
    VIEW_TYPE_ICON_MAPPING.find((type) => type.value === viewType)?.icon ??
    IconTable
  );
};
