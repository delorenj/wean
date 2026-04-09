import {
  buildMilestoneStates,
  calculateProgressPercentage,
  findHighestUncelebratedMilestone,
  generateWeeklyMilestones,
  getLatestDoseOnOrBeforeDate,
  getReachedMilestones,
  reconcileMilestoneAchievements,
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

  describe('milestone threshold helpers', () => {
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

  describe('date milestone helpers', () => {
    it('generates weekly milestone checkpoints through the target date', () => {
      const milestones = generateWeeklyMilestones({
        startDose: 20,
        targetDose: 5,
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        targetDate: new Date('2026-01-29T00:00:00.000Z'),
      });

      expect(milestones).toHaveLength(4);
      expect(milestones[0].targetDateISO).toBe('2026-01-08');
      expect(milestones[3].targetDateISO).toBe('2026-01-29');
      expect(milestones[3].targetDose).toBe(5);
    });

    it('finds the latest logged dose on or before a milestone date', () => {
      expect(
        getLatestDoseOnOrBeforeDate('2026-01-15', {
          '2026-01-05': 19.2,
          '2026-01-10': 17.4,
          '2026-01-20': 15.1,
        })
      ).toBe(17.4);

      expect(getLatestDoseOnOrBeforeDate('2026-01-01', { '2026-01-05': 19.2 })).toBeNull();
    });

    it('marks milestones as achieved when logged dose meets checkpoint target', () => {
      const { milestones, newlyAchievedMilestones } = reconcileMilestoneAchievements({
        milestones: [
          {
            id: 'm1',
            label: 'Week 1',
            targetDose: 18,
            targetDateISO: '2026-01-08',
            achieved: false,
          },
          {
            id: 'm2',
            label: 'Week 2',
            targetDose: 15,
            targetDateISO: '2026-01-15',
            achieved: false,
          },
        ],
        doseTotalsByDate: {
          '2026-01-08': 17.8,
          '2026-01-15': 15.4,
        },
        today: new Date('2026-01-16T00:00:00.000Z'),
      });

      expect(newlyAchievedMilestones.map((milestone) => milestone.id)).toEqual(['m1']);
      expect(milestones[0]).toMatchObject({ achieved: true, actualDose: 17.8 });
      expect(milestones[1]).toMatchObject({ achieved: false, actualDose: 15.4 });
    });
  });
});
