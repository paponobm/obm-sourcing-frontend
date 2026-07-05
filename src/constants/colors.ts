/**
 * Raw hex values for contexts that can't consume Tailwind classes or CSS vars
 * (inline SVG fills, <meta theme-color>, canvas/chart libraries). The
 * canonical source of truth is still globals.css / tailwind.config.ts —
 * keep this in sync if the palette ever changes.
 */
export const COLORS = {
  ink: "#16262A",
  teal: "#12525A",
  tealDark: "#0B393F",
  paper: "#FAFAF7",
  paper2: "#F1EFE9",
  line: "#DCD8CC",
  brass: "#AD7C2C",
  brassSoft: "#F4E7CE",
  green: "#3E6B4F",
  greenSoft: "#E4EEE4",
  gray: "#7A756B",
  red: "#9C4A3C",
} as const;
