import {
  buildMilestoneStates,
  calculateProgressPercentage,
  findHighestUncelebratedMilestone,
  getReachedMilestones,
} from './useGoals.helpers';

describe('useGoals.helpers', () => {
  describe('calculateProgressPercentage', () => {
    it('returns 0 when no reduction has happened yet', () => {
      expect(
        calculateProgressPercentage({
          startDose: 20,
          targetDose: 5,
          currentDose: 20,
        })
      ).toBe(0);
    });

    it('returns expected progress percentage across the taper range', () => {
      expect(
        calculateProgressPercentage({
          startDose: 20,
          targetDose: 5,
          currentDose: 12.5,
        })
      ).toBe(50);
    });

    it('clamps progress to 100 once target is met or surpassed', () => {
      expect(
        calculateProgressPercentage({
          startDose: 20,
          targetDose: 5,
          currentDose: 4,
        })
      ).toBe(100);
    });
  });

  describe('milestone helpers', () => {
    it('returns reached milestones from progress percentage', () => {
      expect(getReachedMilestones(74.9)).toEqual([25, 50]);
      expect(getReachedMilestones(100)).toEqual([25, 50, 75, 100]);
    });

    it('builds milestone state flags for reached and celebrated milestones', () => {
      expect(buildMilestoneStates(60, [25])).toEqual([
        { threshold: 25, isReached: true, isCelebrated: true },
        { threshold: 50, isReached: true, isCelebrated: false },
        { threshold: 75, isReached: false, isCelebrated: false },
        { threshold: 100, isReached: false, isCelebrated: false },
      ]);
    });

    it('finds the highest newly reached milestone for celebrations', () => {
      expect(findHighestUncelebratedMilestone(79, [25])).toBe(75);
      expect(findHighestUncelebratedMilestone(40, [25])).toBeNull();
    });
  });
});
