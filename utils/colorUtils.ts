interface ThemeColors {
  critical: string;
  warning: string;
  good: string;
}

export const getColorByPercent = (percent: number, colors: ThemeColors) => {
  if (percent >= 90) return colors.critical;
  if (percent >= 75) return colors.warning;
  return colors.good;
};

export const getAvailableColorByPercent = (percent: number, colors: ThemeColors) => {
  if (percent <= 10) return colors.critical;
  if (percent <= 25) return colors.warning;
  return colors.good;
};
