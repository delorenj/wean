import {
  calculateTaperProgressPercentage,
  compareActualDoseToTarget,
  generateTaperSchedule,
  getTargetDoseForDate,
} from './useTaperPlan.helpers';

describe('useTaperPlan.helpers', () => {
  const startDate = new Date('2026-01-01T00:00:00.000Z');

  describe('generateTaperSchedule', () => {
    it('builds a linear schedule across the full timeline', () => {
      const plan = generateTaperSchedule({
        currentDose: 20,
        targetDose: 10,
        timelineDays: 6,
        strategy: 'linear',
        startDate,
      });

      expect(plan.dailyTargets.map((day) => day.targetDose)).toEqual([20, 18, 16, 14, 12, 10]);
      expect(plan.weeklyTargets).toHaveLength(1);
      expect(plan.weeklyTargets[0].averageTargetDose).toBe(15);
      expect(plan.totalDays).toBe(5);
    });

    it('builds a stepped schedule with plateaus between step days', () => {
      const plan = generateTaperSchedule({
        currentDose: 21,
        targetDose: 7,
        timelineDays: 7,
        strategy: 'stepped',
        stepIntervalDays: 2,
        startDate,
      });

      expect(plan.dailyTargets[0].targetDose).toBe(21);
      expect(plan.dailyTargets[1].targetDose).toBe(21);
      expect(plan.dailyTargets[2].targetDose).toBe(16.33);
      expect(plan.dailyTargets[3].targetDose).toBe(16.33);
      expect(plan.dailyTargets[4].targetDose).toBe(11.67);
      expect(plan.dailyTargets[6].targetDose).toBe(7);
      expect(plan.strategyConfig.stepIntervalDays).toBe(2);
    });

    it('builds a percentage schedule and automatically raises reduction rate to meet timeline', () => {
      const plan = generateTaperSchedule({
        currentDose: 100,
        targetDose: 25,
        timelineDays: 15,
        strategy: 'percentage',
        stepIntervalDays: 7,
        startDate,
      });

      expect(plan.strategyConfig.requiredPercentageReductionPerStep).toBeCloseTo(50, 2);
      expect(plan.strategyConfig.percentageReductionPerStep).toBeCloseTo(50, 2);
      expect(plan.dailyTargets[0].targetDose).toBe(100);
      expect(plan.dailyTargets[7].targetDose).toBe(50);
      expect(plan.dailyTargets[14].targetDose).toBe(25);
    });

    it('honors configured percentage reduction when it is already sufficient', () => {
      const plan = generateTaperSchedule({
        currentDose: 100,
        targetDose: 10,
        timelineDays: 22,
        strategy: 'percentage',
        stepIntervalDays: 7,
        percentageReductionPerStep: 60,
        startDate,
      });

      expect(plan.strategyConfig.percentageReductionPerStep).toBe(60);
      expect(plan.dailyTargets[7].targetDose).toBe(40);
      expect(plan.dailyTargets[14].targetDose).toBe(16);
      expect(plan.dailyTargets[21].targetDose).toBe(10);
    });

    it('captures all milestone thresholds in long plans', () => {
      const plan = generateTaperSchedule({
        currentDose: 40,
        targetDose: 0,
        timelineDays: 60,
        strategy: 'linear',
        startDate,
      });

      expect(plan.milestonesReached).toEqual([25, 50, 75, 100]);
    });

    it('throws for invalid dose ranges', () => {
      expect(() =>
        generateTaperSchedule({
          currentDose: 0,
          targetDose: 0,
          timelineDays: 30,
          strategy: 'linear',
          startDate,
        })
      ).toThrow('Current dose must be greater than 0.');

      expect(() =>
        generateTaperSchedule({
          currentDose: 10,
          targetDose: 10,
          timelineDays: 30,
          strategy: 'linear',
          startDate,
        })
      ).toThrow('Target dose must be lower than current dose.');
    });
  });

  describe('getTargetDoseForDate', () => {
    it('returns target for dates inside plan timeline and null outside timeline', () => {
      const plan = generateTaperSchedule({
        currentDose: 10,
        targetDose: 5,
        timelineDays: 6,
        strategy: 'linear',
        startDate,
      });

      expect(getTargetDoseForDate(plan, new Date('2026-01-01T18:00:00.000Z'))).toBe(10);
      expect(getTargetDoseForDate(plan, new Date('2026-01-03T12:00:00.000Z'))).toBe(8);
      expect(getTargetDoseForDate(plan, new Date('2026-01-20T00:00:00.000Z'))).toBeNull();
    });
  });

  describe('compareActualDoseToTarget', () => {
    it('classifies on-track, over, and under with tolerance', () => {
      expect(compareActualDoseToTarget(10.4, 10, 5).status).toBe('on-track');
      expect(compareActualDoseToTarget(11, 10, 5).status).toBe('over');
      expect(compareActualDoseToTarget(8.8, 10, 5).status).toBe('under');
    });
  });

  describe('calculateTaperProgressPercentage', () => {
    it('calculates progress from start to target range', () => {
      expect(calculateTaperProgressPercentage(20, 0, 15)).toBe(25);
      expect(calculateTaperProgressPercentage(20, 0, 10)).toBe(50);
      expect(calculateTaperProgressPercentage(20, 0, 0)).toBe(100);
    });
  });
});
