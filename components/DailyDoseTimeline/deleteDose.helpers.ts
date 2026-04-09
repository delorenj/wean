export const DELETE_ACTION_WIDTH = 88;

export const clampDeleteSwipeTranslate = (
  deltaX: number,
  maxWidth = DELETE_ACTION_WIDTH
): number => {
  if (!Number.isFinite(deltaX)) {
    return 0;
  }

  if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
    return 0;
  }

  const minimumTranslate = -Math.abs(maxWidth);

  return Math.max(minimumTranslate, Math.min(0, deltaX));
};

export const shouldOpenDeleteAction = (
  deltaX: number,
  actionWidth = DELETE_ACTION_WIDTH
): boolean => {
  if (!Number.isFinite(deltaX)) {
    return false;
  }

  const threshold = Math.abs(actionWidth) * 0.5;

  return deltaX <= -threshold;
};
