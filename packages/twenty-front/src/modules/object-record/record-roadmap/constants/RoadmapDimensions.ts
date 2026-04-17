// Vertical layout constants for the timeline. The values intentionally stay
// on an 8px spacing rhythm so the bars align with the row dividers without
// fractional pixels.

export const ROADMAP_ROW_HEIGHT = 40;
export const ROADMAP_BAR_HEIGHT = 24;
export const ROADMAP_BAR_VERTICAL_PADDING =
  (ROADMAP_ROW_HEIGHT - ROADMAP_BAR_HEIGHT) / 2;
export const ROADMAP_HEADER_HEIGHT = 48;
export const ROADMAP_MIN_BAR_WIDTH = 8;
// Buffer used when deriving the viewport date range from the DOM width. Keeps
// enough spare days off-screen that a user scroll doesn't flash an empty gap.
export const ROADMAP_VIEWPORT_BUFFER_RATIO = 0.2;
