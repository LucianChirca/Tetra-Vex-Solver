import type { Digit } from "../core";

// Display colors live in the UI, not the domain.
export const DIGIT_COLORS: Record<Digit, string> = {
  0: "#C0392B",
  1: "#2E86DE",
  2: "#27AE60",
  3: "#E67E22",
  4: "#7D3C98",
  5: "#16A085",
  6: "#1ABC9C",
  7: "#C2185B",
  8: "#5D4037",
  9: "#566573",
};

export const THEME = {
  bg: "#0A0A0A",
  panel: "#161616",
  panelBorder: "#2A2A2A",
  text: "#FFFFFF",
  accent: "#F1C40F",
  cellEmpty: "#101010",
};

export const FPS = 60;
