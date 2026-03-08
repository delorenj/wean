import {
  calculateTaperProgressPercentage,
  generateTaperSchedule,
  getTaperStrategyConfig,
} from './useTaperPlan.helpers';

describe('useTaperPlan.helpers', () => {
  describe('getTaperStrategyConfig', () => {
    it('returns expected strategy defaults', () => {
      expect(getTaperStrategyConfig('aggressive')).toEqual({
        reductionPercent: 10,
        reductionEveryDays: 3,
      });
      expect(getTaperStrategyConfig('moderate')).toEqual({
        reductionPercent: 10,
        reductionEveryDays: 7,
      });
      expect(getTaperStrategyConfig('gentle')).toEqual({
        reductionPercent: 5,
        reductionEveryDays: 7,
      });
    });
  });

  describe('generateTaperSchedule', () => {
    const startDate = new Date('2026-01-01T00:00:00.000Z');

    it('builds an aggressive schedule with 10% reductions every 3 days', () => {
      const plan = generateTaperSchedule({
        currentDose: 100,
        targetDose: 0,
        taperSpeed: 'aggressive',
        startDate,
      });

      expect(plan.reductionPercent).toBe(10);
      expect(plan.reductionEveryDays).toBe(3);
      expect(plan.schedule[0]).toMatchObject({ day: 0, dose: 100 });
      expect(plan.schedule[1]).toMatchObject({ day: 3, dose: 90 });
      expect(plan.schedule[2]).toMatchObject({ day: 6, dose: 81 });
      expect(plan.schedule[plan.schedule.length - 1].dose).toBe(0);
    });

    it('builds a moderate schedule with 10% reductions every 7 days', () => {
      const plan = generateTaperSchedule({
        currentDose: 20,
        targetDose: 0,
        taperSpeed: 'moderate',
        startDate,
      });

      expect(plan.reductionPercent).toBe(10);
      expect(plan.reductionEveryDays).toBe(7);
      expect(plan.schedule[1].day).toBe(7);
      expect(plan.schedule[1].dose).toBe(18);
      expect(plan.schedule[2].day).toBe(14);
    });

    it('builds a gentle schedule with 5% reductions every 7 days', () => {
      const plan = generateTaperSchedule({
        currentDose: 20,
        targetDose: 0,
        taperSpeed: 'gentle',
        startDate,
      });

      expect(plan.reductionPercent).toBe(5);
      expect(plan.reductionEveryDays).toBe(7);
      expect(plan.schedule[1]).toMatchObject({ day: 7, dose: 19 });
      expect(plan.schedule[2]).toMatchObject({ day: 14, dose: 18.05 });
    });

    it('defaults target dose to zero when omitted', () => {
      const plan = generateTaperSchedule({
        currentDose: 12,
        taperSpeed: 'moderate',
        startDate,
      });

      expect(plan.targetDose).toBe(0);
      expect(plan.schedule[plan.schedule.length - 1].dose).toBe(0);
    });

    it('marks milestone steps as progress thresholds are crossed', () => {
      const plan = generateTaperSchedule({
        currentDose: 20,
        targetDose: 0,
        taperSpeed: 'aggressive',
        startDate,
      });

      const milestoneSteps = plan.schedule.filter((step) => step.milestones.length > 0);
      const flattenedMilestones = milestoneSteps.flatMap((step) => step.milestones);

      expect(flattenedMilestones).toContain(25);
      expect(flattenedMilestones).toContain(50);
      expect(flattenedMilestones).toContain(75);
      expect(flattenedMilestones).toContain(100);
      expect(plan.milestonesReached).toEqual([25, 50, 75, 100]);
    });

    it('throws for invalid dose ranges', () => {
      expect(() =>
        generateTaperSchedule({
          currentDose: 0,
          targetDose: 0,
          taperSpeed: 'moderate',
          startDate,
        })
      ).toThrow('Current dose must be greater than 0.');

      expect(() =>
        generateTaperSchedule({
          currentDose: 10,
          targetDose: 10,
          taperSpeed: 'moderate',
          startDate,
        })
      ).toThrow('Target dose must be lower than current dose.');
    });
  });

  describe('calculateTaperProgressPercentage', () => {
    it('calculates progress from start to target range', () => {
      expect(calculateTaperProgressPercentage(20, 0, 15)).toBe(25);
      expect(calculateTaperProgressPercentage(20, 0, 10)).toBe(50);
      expect(calculateTaperProgressPercentage(20, 0, 0)).toBe(100);
    });

    it('handles guardrail inputs safely', () => {
      expect(calculateTaperProgressPercentage(10, 10, 10)).toBe(100);
      expect(calculateTaperProgressPercentage(10, 10, 12)).toBe(0);
      expect(calculateTaperProgressPercentage(Number.NaN, 0, 0)).toBe(100);
    });
  });
});
