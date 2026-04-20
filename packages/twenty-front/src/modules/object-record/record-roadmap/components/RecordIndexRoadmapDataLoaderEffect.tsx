import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useRecordRoadmapFetchRecords } from '@/object-record/record-roadmap/hooks/useRecordRoadmapFetchRecords';
import { recordRoadmapHiddenRecordCountComponentState } from '@/object-record/record-roadmap/states/recordRoadmapHiddenRecordCountComponentState';
import { recordRoadmapRecordIdsComponentState } from '@/object-record/record-roadmap/states/recordRoadmapRecordIdsComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { parseRoadmapDateValue } from '@/object-record/record-roadmap/utils/computeRoadmapBarPosition';

// Pushes the raw record IDs into Jotai state and counts records that cannot
// be placed (missing start or end). The Timeline component reads the records
// directly through its own hook, but the TopBar reads the hidden-count from
// this effect so both stay in sync without re-fetching.
export const RecordIndexRoadmapDataLoaderEffect = () => {
  const [, setRecordRoadmapRecordIds] = useAtomComponentState(
    recordRoadmapRecordIdsComponentState,
  );
  const [, setRecordRoadmapHiddenRecordCount] = useAtomComponentState(
    recordRoadmapHiddenRecordCountComponentState,
  );

  const { records, startFieldMetadataItem, endFieldMetadataItem } =
    useRecordRoadmapFetchRecords();

  useEffect(() => {
    setRecordRoadmapRecordIds(records.map((record) => record.id));

    if (
      !isDefined(startFieldMetadataItem) ||
      !isDefined(endFieldMetadataItem)
    ) {
      setRecordRoadmapHiddenRecordCount(0);
      return;
    }

    const hidden = records.reduce((count, record) => {
      const startValue = record[startFieldMetadataItem.name];
      const endValue = record[endFieldMetadataItem.name];
      const hasBothDates =
        parseRoadmapDateValue(startValue) !== null &&
        parseRoadmapDateValue(endValue) !== null;
      return hasBothDates ? count : count + 1;
    }, 0);

    setRecordRoadmapHiddenRecordCount(hidden);
  }, [
    records,
    startFieldMetadataItem,
    endFieldMetadataItem,
    setRecordRoadmapRecordIds,
    setRecordRoadmapHiddenRecordCount,
  ]);

  return null;
};
