interface GenerateProgressPercentageParams {
  completed: number;
  total: number;
}

export function generateProgressPercentage({
  completed,
  total,
}: GenerateProgressPercentageParams): number {
  return Math.round((completed / total) * 100);
}
