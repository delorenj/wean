import {
  buildDailyDoseTotals,
  buildTrendAnalyticsSnapshot,
  calculateAverageDailyDose,
  calculateDoseReductionStreak,
  calculateTrendDirection,
} from './useAnalytics.helpers';

const createDose = (amount: number, doseUnit: string, isoDate: string) => ({
  amount,
  doseUnit,
  date: {
    toDate: () => new Date(isoDate),
  },
});

describe('useAnalytics.helpers', () => {
  it('calculates average daily dose from daily totals', () => {
    const totals = [
      { dateISO: '2026-03-02', totalDose: 8 },
      { dateISO: '2026-03-03', totalDose: 6 },
      { dateISO: '2026-03-04', totalDose: 4 },
      { dateISO: '2026-03-05', totalDose: 2 },
    ];

    expect(calculateAverageDailyDose(totals)).toBe(5);
  });

  it('detects trend direction as down/up/stable', () => {
    const downTrend = calculateTrendDirection([
      { dateISO: '2026-03-01', totalDose: 10 },
      { dateISO: '2026-03-07', totalDose: 5 },
    ]);

    const upTrend = calculateTrendDirection([
      { dateISO: '2026-03-01', totalDose: 5 },
      { dateISO: '2026-03-07', totalDose: 10 },
    ]);

    const stableTrend = calculateTrendDirection([
      { dateISO: '2026-03-01', totalDose: 5 },
      { dateISO: '2026-03-07', totalDose: 5.05 },
    ]);

    expect(downTrend.direction).toBe('down');
    expect(upTrend.direction).toBe('up');
    expect(stableTrend.direction).toBe('stable');
  });

  it('calculates consecutive strict reduction streak from latest day backward', () => {
    const streakTotals = [
      { dateISO: '2026-03-01', totalDose: 12 },
      { dateISO: '2026-03-02', totalDose: 11 },
      { dateISO: '2026-03-03', totalDose: 10 },
      { dateISO: '2026-03-04', totalDose: 9 },
      { dateISO: '2026-03-05', totalDose: 9 },
      { dateISO: '2026-03-06', totalDose: 8 },
      { dateISO: '2026-03-07', totalDose: 7 },
    ];

    expect(calculateDoseReductionStreak(streakTotals)).toBe(3);
  });

  it('builds weekly and monthly analytics snapshots from dose history', () => {
    const doses = Array.from({ length: 30 }).map((_, index) =>
      createDose(30 - index, 'g', `2026-03-${String(index + 1).padStart(2, '0')}T12:00:00.000Z`)
    );

    const snapshot = buildTrendAnalyticsSnapshot(doses, {
      endDate: new Date('2026-03-30T23:00:00.000Z'),
      unit: 'g',
    });

    expect(snapshot.weekly.dailyTotals).toHaveLength(7);
    expect(snapshot.monthly.dailyTotals).toHaveLength(30);
    expect(snapshot.weekly.averageDailyDose).toBeGreaterThan(0);
    expect(snapshot.monthly.trend.direction).toBe('down');
    expect(snapshot.monthly.reductionStreakDays).toBeGreaterThan(1);
  });

  it('normalizes mixed units into the selected unit when bucketing daily totals', () => {
    const doses = [
      createDose(500, 'mg', '2026-03-01T10:00:00.000Z'),
      createDose(1, 'g', '2026-03-01T16:00:00.000Z'),
      createDose(1, 'oz', '2026-03-02T16:00:00.000Z'),
    ];

    const totals = buildDailyDoseTotals(doses, {
      days: 2,
      endDate: new Date('2026-03-02T23:59:59.000Z'),
      unit: 'g',
    });

    expect(totals[0]).toEqual({ dateISO: '2026-03-01', totalDose: 1.5 });
    expect(totals[1].totalDose).toBeCloseTo(28.35, 2);
  });
});
