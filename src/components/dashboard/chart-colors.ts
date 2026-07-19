/**
 * Dashboard pie-chart palette — matched in tone/saturation to this app's own
 * existing muted theme colors (--green: #3e6b4f, --red: #9c4a3c, --brass:
 * #fc4700) rather than stock bright chart colors, plus one muted blue added
 * for the "Closed"/"Completed"/"Monthly Active" slices, which this theme
 * doesn't otherwise have a token for.
 */
export const CHART_COLORS = {
  green: "#3e6b4f",
  red: "#9c4a3c",
  orange: "#d97a3d",
  blue: "#3b6ea5",
} as const;
