import {
  DELETE_ACTION_WIDTH,
  clampDeleteSwipeTranslate,
  shouldOpenDeleteAction,
} from './deleteDose.helpers';

describe('deleteDose.helpers', () => {
  describe('clampDeleteSwipeTranslate', () => {
    it('clamps right swipes to zero', () => {
      expect(clampDeleteSwipeTranslate(20)).toBe(0);
    });

    it('allows left swipes up to the action width', () => {
      expect(clampDeleteSwipeTranslate(-30)).toBe(-30);
      expect(clampDeleteSwipeTranslate(-(DELETE_ACTION_WIDTH + 30))).toBe(-DELETE_ACTION_WIDTH);
    });

    it('returns zero for invalid values', () => {
      expect(clampDeleteSwipeTranslate(Number.NaN)).toBe(0);
      expect(clampDeleteSwipeTranslate(-40, 0)).toBe(0);
    });
  });

  describe('shouldOpenDeleteAction', () => {
    it('opens once swipe passes half the action width', () => {
      expect(shouldOpenDeleteAction(-DELETE_ACTION_WIDTH / 2)).toBe(true);
      expect(shouldOpenDeleteAction(-DELETE_ACTION_WIDTH)).toBe(true);
    });

    it('stays closed for short swipes or invalid input', () => {
      expect(shouldOpenDeleteAction(-(DELETE_ACTION_WIDTH / 2) + 1)).toBe(false);
      expect(shouldOpenDeleteAction(0)).toBe(false);
      expect(shouldOpenDeleteAction(Number.NaN)).toBe(false);
    });
  });
});
