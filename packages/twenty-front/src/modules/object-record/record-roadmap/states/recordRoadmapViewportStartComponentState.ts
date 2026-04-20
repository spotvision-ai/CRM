import { RecordRoadmapComponentInstanceContext } from '@/object-record/record-roadmap/states/contexts/RecordRoadmapComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { Temporal } from 'temporal-polyfill';

// Leftmost date visible in the timeline viewport. Defaults to three months
// before today so "today" lands roughly mid-screen for a fresh view.
const computeDefaultViewportStart = (): Temporal.PlainDate =>
  Temporal.Now.plainDateISO().subtract({ months: 3 });

export const recordRoadmapViewportStartComponentState =
  createAtomComponentState<Temporal.PlainDate>({
    key: 'recordRoadmapViewportStartComponentState',
    defaultValue: computeDefaultViewportStart(),
    componentInstanceContext: RecordRoadmapComponentInstanceContext,
  });
