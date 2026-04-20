import { ViewRoadmapZoom } from '~/generated-metadata/graphql';

// Pixel width of a single day at each zoom level. The timeline grid derives
// every other horizontal measurement from these values (bar position/width,
// header cell size, weekend overlay columns, etc.).
export const ROADMAP_DAY_WIDTH_BY_ZOOM: Record<ViewRoadmapZoom, number> = {
  [ViewRoadmapZoom.DAY]: 72,
  [ViewRoadmapZoom.WEEK]: 28,
  [ViewRoadmapZoom.MONTH]: 10,
  [ViewRoadmapZoom.QUARTER]: 4,
};

// oxlint-disable-next-line twenty/max-consts-per-file
export const ROADMAP_DEFAULT_ZOOM: ViewRoadmapZoom = ViewRoadmapZoom.MONTH;
