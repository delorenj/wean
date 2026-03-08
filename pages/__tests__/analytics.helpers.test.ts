import {
  addUTCDays,
  buildDailyDoseTotals,
  buildTrendAnalytics,
  calculateReductionRatePercent,
  calculateReductionStreakDays,
  calculateRollingAverage,
  calculateWeekOverWeekComparison,
  findBestWeek,
  getUTCStartOfDay,
  toUTCDateISO,
} from '../analytics.helpers';

const createDose = (amount: number, doseUnit: string, isoDate: string) => ({
  amount,
  doseUnit,
  date: {
    toDate: () => new Date(isoDate),
  },
});

describe('analytics.helpers', () => {
  describe('UTC date utilities', () => {
    it('normalizes dates using UTC boundaries', () => {
      const sourceDate = new Date('2026-03-08T23:45:00.000-05:00');
      const utcStart = getUTCStartOfDay(sourceDate);

      expect(utcStart.toISOString()).toBe('2026-03-09T00:00:00.000Z');
      expect(toUTCDateISO(utcStart)).toBe('2026-03-09');
      expect(toUTCDateISO(addUTCDays(utcStart, -2))).toBe('2026-03-07');
    });
  });

  describe('buildDailyDoseTotals', () => {
    it('buckets doses by UTC day and fills missing days with zero totals', () => {
      const doses = [
        createDose(2000, 'mg', '2026-03-02T23:30:00.000-05:00'), // UTC day => 2026-03-03
        createDose(1.5, 'g', '2026-03-05T10:00:00.000Z'),
        createDose(0.5, 'g', '2026-03-08T08:00:00.000Z'),
      ];

      const totals = buildDailyDoseTotals(doses, {
        days: 7,
        endDate: new Date('2026-03-08T22:00:00.000Z'),
        unit: 'g',
      });

      expect(totals).toEqual([
        { dateISO: '2026-03-02', totalDose: 0 },
        { dateISO: '2026-03-03', totalDose: 2 },
        { dateISO: '2026-03-04', totalDose: 0 },
        { dateISO: '2026-03-05', totalDose: 1.5 },
        { dateISO: '2026-03-06', totalDose: 0 },
        { dateISO: '2026-03-07', totalDose: 0 },
        { dateISO: '2026-03-08', totalDose: 0.5 },
      ]);
    });
  });

  describe('rolling + metrics helpers', () => {
    const weeklyTotals = [
      { dateISO: '2026-03-02', totalDose: 8 },
      { dateISO: '2026-03-03', totalDose: 7 },
      { dateISO: '2026-03-04', totalDose: 7 },
      { dateISO: '2026-03-05', totalDose: 6 },
      { dateISO: '2026-03-06', totalDose: 5 },
      { dateISO: '2026-03-07', totalDose: 4 },
      { dateISO: '2026-03-08', totalDose: 3 },
    ];

    it('calculates rolling averages for each day', () => {
      const rolling = calculateRollingAverage(weeklyTotals, 7);

      expect(rolling[0].rollingAverage).toBe(8);
      expect(rolling[3].rollingAverage).toBe(7);
      expect(rolling[6].rollingAverage).toBe(5.71);
    });

    it('calculates reduction rate and streak days', () => {
      expect(calculateReductionRatePercent(weeklyTotals)).toBe(62.5);
      expect(calculateReductionStreakDays(weeklyTotals)).toBe(7);
    });

    it('finds best week and compares week-over-week deltas', () => {
      const monthTotals = [
        ...Array.from({ length: 16 }).map((_, index) => ({
          dateISO: `2026-03-${String(index + 1).padStart(2, '0')}`,
          totalDose: 10,
        })),
        ...Array.from({ length: 7 }).map((_, index) => ({
          dateISO: `2026-03-${String(index + 17).padStart(2, '0')}`,
          totalDose: 6,
        })),
        ...Array.from({ length: 7 }).map((_, index) => ({
          dateISO: `2026-03-${String(index + 24).padStart(2, '0')}`,
          totalDose: 4,
        })),
      ];

      const bestWeek = findBestWeek(monthTotals);
      const wow = calculateWeekOverWeekComparison(monthTotals);

      expect(bestWeek?.weekStartISO).toBe('2026-03-24');
      expect(bestWeek?.weekEndISO).toBe('2026-03-30');
      expect(bestWeek?.averageDailyDose).toBe(4);

      expect(wow.currentWeekTotal).toBe(28);
      expect(wow.previousWeekTotal).toBe(42);
      expect(wow.delta).toBe(-14);
      expect(wow.percentChange).toBeCloseTo(-33.3, 1);
    });
  });

  describe('buildTrendAnalytics', () => {
    it('returns weekly and monthly snapshots with metrics', () => {
      const doses = Array.from({ length: 30 }).map((_, index) =>
        createDose(30 - index, 'g', `2026-03-${String(index + 1).padStart(2, '0')}T12:00:00.000Z`)
      );

      const snapshot = buildTrendAnalytics(doses, {
        endDate: new Date('2026-03-30T23:00:00.000Z'),
        unit: 'g',
      });

      expect(snapshot.weekly.dailyTotals).toHaveLength(7);
      expect(snapshot.weekly.rollingAverage).toHaveLength(7);
      expect(snapshot.monthly.dailyTotals).toHaveLength(30);
      expect(snapshot.monthly.rollingAverage).toHaveLength(30);

      expect(snapshot.weekly.metrics.averageDailyDose).toBeGreaterThan(0);
      expect(snapshot.monthly.metrics.bestWeek).not.toBeNull();
      expect(snapshot.monthly.weekOverWeek.currentWeekTotal).toBeLessThan(
        snapshot.monthly.weekOverWeek.previousWeekTotal
      );
    });
  });
});
