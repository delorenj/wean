import {
  buildDoseChangeReminders,
  compareActualToPlannedDose,
  generateSmartTaperPlan,
  getPlanDayIndexForDate,
  getPlannedDoseForDate,
  getStrategyDefaults,
} from '../plan.helpers';

describe('plan.helpers', () => {
  describe('generateSmartTaperPlan', () => {
    it('generates a complete taper schedule with final target', () => {
      const plan = generateSmartTaperPlan({
        substance: 'Kratom',
        currentDose: 20,
        targetDose: 4,
        timelineDays: 28,
        unit: 'g',
        strategy: 'gradual',
        reductionPercent: 5,
        reductionEveryDays: 7,
        startDateISO: '2026-03-01T10:00:00.000Z',
      });

      expect(plan.schedule).toHaveLength(28);
      expect(plan.schedule[0].targetDose).toBe(20);
      expect(plan.schedule[27].targetDose).toBe(4);
      expect(plan.schedule[7].isDoseChangeDay).toBe(true);
      expect(plan.schedule[8].isDoseChangeDay).toBe(false);
    });

    it('keeps doses monotonically decreasing and never under target', () => {
      const plan = generateSmartTaperPlan({
        substance: 'Nicotine',
        currentDose: 18,
        targetDose: 2,
        timelineDays: 42,
        unit: 'mg',
        strategy: 'aggressive',
        reductionPercent: 10,
        reductionEveryDays: 7,
      });

      for (let index = 1; index < plan.schedule.length; index += 1) {
        expect(plan.schedule[index].targetDose).toBeLessThanOrEqual(plan.schedule[index - 1].targetDose);
        expect(plan.schedule[index].targetDose).toBeGreaterThanOrEqual(plan.targetDose);
      }
    });

    it('throws for invalid timeline', () => {
      expect(() => {
        generateSmartTaperPlan({
          substance: 'Kratom',
          currentDose: 20,
          targetDose: 5,
          timelineDays: 1,
          unit: 'g',
          strategy: 'gradual',
          reductionPercent: 5,
          reductionEveryDays: 7,
        });
      }).toThrow('Timeline must be at least 2 days');
    });
  });

  describe('date helpers', () => {
    const plan = generateSmartTaperPlan({
      substance: 'Kratom',
      currentDose: 20,
      targetDose: 5,
      timelineDays: 14,
      unit: 'g',
      strategy: 'gradual',
      reductionPercent: 5,
      reductionEveryDays: 7,
      startDateISO: '2026-03-01T00:00:00.000Z',
    });

    it('resolves day index for in-range date', () => {
      const dayIndex = getPlanDayIndexForDate(plan, new Date('2026-03-05T12:00:00.000Z'));
      expect(dayIndex).toBe(5);
    });

    it('clamps day index before start and after end', () => {
      expect(getPlanDayIndexForDate(plan, new Date('2026-02-20T12:00:00.000Z'))).toBe(0);
      expect(getPlanDayIndexForDate(plan, new Date('2026-04-20T12:00:00.000Z'))).toBe(plan.schedule.length - 1);
    });

    it('gets planned dose for date', () => {
      const dose = getPlannedDoseForDate(plan, new Date('2026-03-08T12:00:00.000Z'));
      expect(typeof dose).toBe('number');
      expect(dose).toBeGreaterThanOrEqual(plan.targetDose);
      expect(dose).toBeLessThanOrEqual(plan.currentDose);
    });
  });

  describe('comparison and reminders', () => {
    const plan = generateSmartTaperPlan({
      substance: 'Kratom',
      currentDose: 10,
      targetDose: 2,
      timelineDays: 21,
      unit: 'g',
      strategy: 'gradual',
      reductionPercent: 5,
      reductionEveryDays: 7,
      startDateISO: '2026-03-01T00:00:00.000Z',
    });

    it('compares actual vs planned dose', () => {
      const comparison = compareActualToPlannedDose(8.2, 8.0);
      expect(comparison.status).toBe('over');
      expect(comparison.delta).toBe(0.2);
    });

    it('returns on-track for very small deltas', () => {
      const comparison = compareActualToPlannedDose(7.02, 7.0);
      expect(comparison.status).toBe('on-track');
    });

    it('builds reminders only for dose-change days', () => {
      const reminders = buildDoseChangeReminders(plan, new Date('2026-03-01T00:00:00.000Z'), 10);

      expect(reminders.length).toBeGreaterThan(0);
      reminders.forEach((reminder) => {
        expect(reminder.message).toContain('Dose change');
      });
    });
  });

  describe('strategy defaults', () => {
    it('returns expected defaults', () => {
      expect(getStrategyDefaults('gradual')).toEqual({ reductionPercent: 5, reductionEveryDays: 7 });
      expect(getStrategyDefaults('aggressive')).toEqual({ reductionPercent: 10, reductionEveryDays: 7 });
      expect(getStrategyDefaults('custom')).toEqual({ reductionPercent: 7, reductionEveryDays: 5 });
    });
  });
});
