import { computeDailyDoseGaugeMetrics, formatDose } from './index';

describe('DailyDoseGauge helpers', () => {
  it('calculates under-target progress correctly', () => {
    const metrics = computeDailyDoseGaugeMetrics(5, 10);

    expect(metrics.percentage).toBe(50);
    expect(metrics.isOverTarget).toBe(false);
    expect(metrics.remainingAmount).toBe(5);
    expect(metrics.clampedProgressRatio).toBe(0.5);
  });

  it('flags over-target state and overflow amount', () => {
    const metrics = computeDailyDoseGaugeMetrics(12, 10);

    expect(metrics.percentage).toBe(120);
    expect(metrics.isOverTarget).toBe(true);
    expect(metrics.overTargetAmount).toBe(2);
    expect(metrics.clampedProgressRatio).toBe(1);
  });

  it('handles zero target safely', () => {
    const metrics = computeDailyDoseGaugeMetrics(0, 0);

    expect(metrics.percentage).toBe(0);
    expect(metrics.isOverTarget).toBe(false);
    expect(metrics.clampedProgressRatio).toBe(0);
  });

  it('formats dose values with precision', () => {
    expect(formatDose(3.456, 1)).toBe('3.5');
    expect(formatDose(3.456, 2)).toBe('3.46');
  });
});
